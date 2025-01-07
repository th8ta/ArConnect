import { DevFigmaScreen } from "~components/dev/figma-screen/figma-screen.component";
import { useAuth } from "~utils/authentication/authentication.hooks";
import screenSrc from "url:/assets-beta/figma-screens/add-a-wallet.view.png";
import { DevButtons } from "~components/dev/buttons/buttons.component";

export function AuthAddWalletEmbeddedView() {
  const { authMethod } = useAuth();

  return (
    <DevFigmaScreen title="Add a wallet" src={screenSrc}>
      <DevButtons
        config={[
          {
            label: "Create New Wallet",
            to: "/auth/generate-wallet"
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
