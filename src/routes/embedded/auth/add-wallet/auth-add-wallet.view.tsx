import { DevFigmaScreen } from "~components/dev/figma-screen/figma-screen.component";
import { useEmbedded } from "~utils/embedded/embedded.hooks";

import screenSrc from "url:/assets-beta/figma-screens/add-a-wallet.view.png";

export function AuthAddWalletEmbeddedView() {
  const { authMethod, generateWallet } = useEmbedded();

  // TODO: Pregenerate wallet when this screen loads and not before to avoid having it in memory for too long...

  // TODO: Redirect to confirmation manually once the tempWallet property is added.

  return (
    <DevFigmaScreen
      title="Add a wallet"
      src={screenSrc}
      config={[
        {
          label: "Create New Wallet",
          onClick: () => generateWallet()
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
