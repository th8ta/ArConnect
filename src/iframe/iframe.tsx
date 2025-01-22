import { useEffect } from "react";
import { ArConnectThemeProvider } from "~components/hardware/HardwareWalletTheme";
import { NavigationBar } from "~components/popup/Navigation";
import { AuthRequestsProvider } from "~utils/auth/auth.provider";
import { Routes } from "~wallets/router/routes.component";
import { Router as Wouter } from "wouter";
import { IFRAME_ROUTES } from "~wallets/router/iframe/iframe.routes";
import { handleSyncLabelsAlarm } from "~api/background/handlers/alarms/sync-labels/sync-labels-alarm.handler";
import {
  useAuthStatusOverride,
  useEmbeddedLocation
} from "~wallets/router/iframe/iframe-router.hook";
import { EmbeddedProvider } from "~utils/embedded/embedded.provider";

export function ArConnectEmbeddedApp() {
  useEffect(() => {
    handleSyncLabelsAlarm();

    window.addEventListener("message", (event: MessageEvent) => {
      if (!event.data) return;

      // Example: check if the message is from our SDK
      if (event.data.type === "FROM_SDK") {
        const incomingMsg = event.data.payload;
        console.log(
          "Iframe received message from WanderEmbedded:",
          incomingMsg
        );

        // Respond back
        event.source?.postMessage({
          type: "FROM_IFRAME",
          payload: `Got your message: ${incomingMsg}`
        });
      }
    });

    return () => {
      window.removeEventListener("message", (event: MessageEvent) => {
        if (!event.data) return;
      });
    };
  }, []);

  return (
    <>
      <Routes routes={IFRAME_ROUTES} diffLocation />
      <NavigationBar />
    </>
  );
}

export function ArConnectEmbeddedAppRoot() {
  return (
    <ArConnectThemeProvider>
      <EmbeddedProvider>
        <AuthRequestsProvider useStatusOverride={useAuthStatusOverride}>
          <Wouter hook={useEmbeddedLocation}>
            <ArConnectEmbeddedApp />
          </Wouter>
        </AuthRequestsProvider>
      </EmbeddedProvider>
    </ArConnectThemeProvider>
  );
}
