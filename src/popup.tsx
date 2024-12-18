import { NavigationBar } from "~components/popup/Navigation";
import { ArConnectThemeProvider } from "~components/hardware/HardwareWalletTheme";
import { Routes } from "~wallets/router/routes.component";
import { POPUP_ROUTES } from "~wallets/router/popup/popup.routes";
import { Router as Wouter } from "wouter";
import { useExtensionLocation } from "~wallets/router/extension/extension-router.hook";
import { WalletsProvider } from "~utils/wallets/wallets.provider";
import { useEffect } from "react";
import { handleSyncLabelsAlarm } from "~api/background/handlers/alarms/sync-labels/sync-labels-alarm.handler";
import { ErrorBoundary } from "~utils/error/ErrorBoundary/errorBoundary";
import { FallbackView } from "~components/page/common/Fallback/fallback.view";

export function ArConnectBrowserExtensionApp() {
  useEffect(() => {
    handleSyncLabelsAlarm();
  }, []);

  return (
    <>
      <Routes routes={POPUP_ROUTES} />
      <NavigationBar />
    </>
  );
}

export function ArConnectBrowserExtensionAppRoot() {
  return (
    <ArConnectThemeProvider>
      <ErrorBoundary fallback={FallbackView}>
        <WalletsProvider redirectToWelcome>
          <Wouter hook={useExtensionLocation}>
            <ArConnectBrowserExtensionApp />
          </Wouter>
        </WalletsProvider>
      </ErrorBoundary>
    </ArConnectThemeProvider>
  );
}

export default ArConnectBrowserExtensionAppRoot;
