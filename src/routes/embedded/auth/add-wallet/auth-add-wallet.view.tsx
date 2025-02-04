import { DevFigmaScreen } from "~components/dev/figma-screen/figma-screen.component";
import { useEmbedded } from "~utils/embedded/embedded.hooks";
import { useEffect } from "react";

import screenSrc from "url:/assets-beta/figma-screens/add-a-wallet.view.png";

export function AuthAddWalletEmbeddedView() {
  const { authMethod, generateTempWallet, registerWallet } = useEmbedded();

  useEffect(() => {
    // Pre-generation starts on app load, but this call will re-generate it again if it has expired, as we are trying to
    // prevent a user accessing a site with ArConnect Embedded, not creating an account, and coming back way later after
    // the pregenerated wallet has been sitting in memory for long:
    generateTempWallet();
  }, []);

  return (
    <DevFigmaScreen
      title="Add a wallet"
      src={screenSrc}
      config={[
        {
          label: "Create New Wallet",
          onClick: () => registerWallet("generated")
        },
        {
          label: "Enter Seed Phrase",
          to: "/auth/import-seed-phrase"
        },
        {
          label: "Import Private Key",
          to: "/auth/import-keyfile"
        },
        authMethod === "passkey"
          ? {
              label: "Add this device to an existing account",
              to: "/auth/add-device",
              variant: "secondary"
            }
          : {
              label: `Add ${authMethod} to an existing account`,
              to: "/auth/add-auth-provider",
              variant: "secondary"
            }
      ]}
    />
  );
}
