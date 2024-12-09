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
import { AuthProvider } from "~utils/authentication/authentication.provider";

export function ArConnectEmbeddedApp() {
  useEffect(() => {
    handleSyncLabelsAlarm();
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
      <AuthProvider>
        <AuthRequestsProvider useStatusOverride={useAuthStatusOverride}>
          <Wouter hook={useEmbeddedLocation}>
            <ArConnectEmbeddedApp />
          </Wouter>
        </AuthRequestsProvider>
      </AuthProvider>
    </ArConnectThemeProvider>
  );
}
