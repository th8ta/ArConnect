import { useEmbedded } from "~utils/embedded/embedded.hooks";
import { DevFigmaScreen } from "~components/dev/figma-screen/figma-screen.component";
import { MockedFeatureFlags } from "~utils/authentication/fakeDB";
import { WalletUtils } from "~utils/wallets/wallets.utils";

import screenSrc from "url:/assets-beta/figma-screens/export-wallet.view.png";

export function AccountExportWalletEmbeddedView() {
  const { wallets, downloadKeyfile, copySeedphrase } = useEmbedded();
  const walletAddress = wallets[0].address;

  // TODO: Register the "export" event on the server.

  // TODO: Add an option to encrypt with a password

  return (
    <DevFigmaScreen
      title="Export your private key"
      src={screenSrc}
      config={[
        {
          // TODO: This should be a selector / dropdown and we might want to include a bulk / download all option
          label: walletAddress,
          isDisabled: true
        },
        {
          label: "Download Private Key",
          onClick: () => downloadKeyfile(walletAddress)
        },
        {
          label: "Copy Seedphrase",
          onClick: () => copySeedphrase(walletAddress),
          // TODO: if the feature flag is enabled but there's no seedphrase, show a tooltip/explanation on hover,
          // mentioning the seedPhrase might be gone and that it's only available in the device where the wallet was
          // created (we can show that browser that was used from the wallet metadata):
          isDisabled:
            !MockedFeatureFlags.maintainSeedPhrase ||
            !WalletUtils.hasEncryptedSeedPhrase(walletAddress)
        },
        {
          label: "Cancel",
          to: "/account"
        }
      ]}
    />
  );
}
