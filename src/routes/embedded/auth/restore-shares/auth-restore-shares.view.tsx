import { DevFigmaScreen } from "~components/dev/figma-screen/figma-screen.component";
import { useEmbedded } from "~utils/embedded/embedded.hooks";

import screenSrc from "url:/assets-beta/figma-screens/restore-shares.view.png";

export function AuthRestoreSharesEmbeddedView() {
  const { authMethod, activateWallet } = useEmbedded();

  // TODO: Do we need to show a selector with the recoverable wallets or list all of them but tell the user
  // which ones can/can't be recovered (or none)? Can I get a new wallet instead?

  return (
    <DevFigmaScreen
      title="Restore shares / wallet"
      src={screenSrc}
      config={[
        {
          label: "Google Drive",
          onClick: () => alert("Not implemented.")
        },
        {
          label: "iCloud",
          onClick: () => alert("Not implemented.")
        },
        {
          label: "Dropbox",
          onClick: () => alert("Not implemented.")
        },
        {
          label: "Upload Account Recovery File",
          to: "/auth/restore-shares/recovery-file"
        },

        // TODO: Actually, users might want to do some of these actions instead, as the device share might be lost or
        // they might just be signing in on a new device:

        {
          label: "Create New Wallet",
          // onClick: () => registerWallet("generated")
          isDisabled: true
        },
        {
          label: "Enter Seed Phrase",
          to: "/auth/import-seed-phrase",
          isDisabled: true
        },
        {
          label: "Import Private Key",
          to: "/auth/import-keyfile",
          isDisabled: true
        }
      ]}
    />
  );
}
