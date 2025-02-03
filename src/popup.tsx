import { NavigationBar } from "~components/popup/Navigation";
import { WanderThemeProvider } from "~components/hardware/HardwareWalletTheme";
import { Routes } from "~wallets/router/routes.component";
import { POPUP_ROUTES } from "~wallets/router/popup/popup.routes";
import { Router as Wouter } from "wouter";
import { useExtensionLocation } from "~wallets/router/extension/extension-router.hook";
import { WalletsProvider } from "~utils/wallets/wallets.provider";
import { useEffect } from "react";
import { handleSyncLabelsAlarm } from "~api/background/handlers/alarms/sync-labels/sync-labels-alarm.handler";
import { ErrorBoundary } from "~utils/error/ErrorBoundary/errorBoundary";
import { FallbackView } from "~components/page/common/Fallback/fallback.view";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 300_000,
      refetchInterval: 300_000,
      retry: 2,
      refetchOnWindowFocus: true
    }
  }
});

export function WanderBrowserExtensionApp() {
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

export function WanderBrowserExtensionAppRoot() {
  return (
    <WanderThemeProvider>
      <ErrorBoundary fallback={FallbackView}>
        <WalletsProvider redirectToWelcome>
          <QueryClientProvider client={queryClient}>
            <Wouter hook={useExtensionLocation}>
              <WanderBrowserExtensionApp />
            </Wouter>
          </QueryClientProvider>
        </WalletsProvider>
      </ErrorBoundary>
    </WanderThemeProvider>
  );
}

export default WanderBrowserExtensionAppRoot;
