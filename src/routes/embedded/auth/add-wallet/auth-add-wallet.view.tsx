import { DevFigmaScreen } from "~components/dev/figma-screen/figma-screen.component";
import { useAuth } from "~utils/authentication/authentication.hooks";
import { DevButtons } from "~components/dev/buttons/buttons.component";

import screenSrc from "url:/assets-beta/figma-screens/add-a-wallet.view.png";

export function AuthAddWalletEmbeddedView() {
  const { authMethod, generateWallet } = useAuth();

  const handleCreateNewWallet = async () => {
    // TODO: Handle errors and loading states.

    // TODO: Show loader at the SDK level while this is "loading" or simply disable the buttons here?

    // TODO: Make sure the confirmation screen is shown after this...

    await generateWallet();

    // TODO: Redirect to confirmation...
  };

  return (
    <DevFigmaScreen title="Add a wallet" src={screenSrc}>
      <DevButtons
        config={[
          {
            label: "Create New Wallet",
            onClick: handleCreateNewWallet
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
    </DevFigmaScreen>
  );
}
