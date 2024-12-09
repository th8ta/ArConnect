import { ArConnectThemeProvider } from "~components/hardware/HardwareWalletTheme";
import { AuthRequestsProvider } from "~utils/auth/auth.provider";
import { Routes } from "~wallets/router/routes.component";
import { useAuthRequestsLocation } from "~wallets/router/auth/auth-router.hook";
import { AUTH_ROUTES } from "~wallets/router/auth/auth.routes";
import { Router as Wouter } from "wouter";
import { WalletsProvider } from "~utils/wallets/wallets.provider";
import { useExtensionStatusOverride } from "~wallets/router/extension/extension-router.hook";
import { useEffect } from "react";
import { handleSyncLabelsAlarm } from "~api/background/handlers/alarms/sync-labels/sync-labels-alarm.handler";

export function AuthApp() {
  useEffect(() => {
    handleSyncLabelsAlarm();
  }, []);

  return <Routes routes={AUTH_ROUTES} diffLocation />;
}

export function AuthAppRoot() {
  return (
    <ArConnectThemeProvider>
      <WalletsProvider redirectToWelcome>
        <AuthRequestsProvider useStatusOverride={useExtensionStatusOverride}>
          <Wouter hook={useAuthRequestsLocation}>
            <AuthApp />
          </Wouter>
        </AuthRequestsProvider>
      </WalletsProvider>
    </ArConnectThemeProvider>
  );
}

export default AuthAppRoot;
