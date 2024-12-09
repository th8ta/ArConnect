import { AnimatePresence } from "framer-motion";
import { type PropsWithChildren } from "react";
import { ArConnectThemeProvider } from "~components/hardware/HardwareWalletTheme";
import HistoryProvider from "~components/popup/HistoryProvider";
import { NavigationBar } from "~components/popup/Navigation";
import { UnlockPage } from "~routes/popup/unlock";
import { AuthRequestsProvider } from "~utils/auth/auth.provider";
import { useIFrameLocation } from "~wallets/router/iframe/iframe-router.hook";
import { IFRAME_ROUTES } from "~wallets/router/iframe/iframe.routes";
import { Routes } from "~wallets/router/routes.component";
import { BodyScroller, HistoryObserver } from "~wallets/router/router.utils";
import { useEmbeddedWalletSetUp } from "~wallets/setup/embedded/embedded-wallet-setup.hook";
import type { InitialScreenType } from "~wallets/setup/wallet-setup.types";
import { Router as Wouter } from "wouter";

interface ArConnectEmbeddedAppProps {
  initialScreenType: InitialScreenType;
}

export function ArConnectEmbeddedApp({
  initialScreenType
}: ArConnectEmbeddedAppProps) {
  let content: React.ReactElement = null;

  console.log("initialScreenType =", initialScreenType);

  if (initialScreenType === "locked") {
    content = <UnlockPage />;
  } else if (initialScreenType === "default") {
    content = (
      <>
        <Routes routes={IFRAME_ROUTES} />
        <NavigationBar />
      </>
    );
  }

  return <>{content}</>;
}

export function ArConnectEmbeddedAppRoot() {
  const initialScreenType = useEmbeddedWalletSetUp();

  return (
    <ArConnectThemeProvider>
      <AuthProvider>
        <AuthRequestsProvider initialScreenType={initialScreenType}>
          <Wouter hook={useIFrameLocation}>
            <BodyScroller />
            <HistoryObserver />

            <HistoryProvider>
              <AnimatePresence initial={false}>
                <ArConnectEmbeddedApp initialScreenType={initialScreenType} />
              </AnimatePresence>
            </HistoryProvider>
          </Wouter>
        </AuthRequestsProvider>
      </AuthProvider>
    </ArConnectThemeProvider>
  );
}

const AuthProvider = ({ children }: PropsWithChildren) => {
  // TODO: To be implemented...

  return <>{children}</>;
};
