import { DevFigmaScreen } from "~components/dev/figma-screen/figma-screen.component";
import { useEmbedded } from "~utils/embedded/embedded.hooks";

import screenSrc from "url:/assets-beta/figma-screens/add-wallet-confirmation.view.png";

export function AuthConfirmationEmbeddedView() {
  const { lastWallet, clearLastWallet } = useEmbedded();

  // TODO: Change text to created/imported depending on wallet origin.

  return (
    <DevFigmaScreen
      title="Congratulations, your account has been created!"
      src={screenSrc}
      config={[
        {
          label: lastWallet.address,
          isDisabled: true
        },
        {
          label: "Done",
          onClick: () => clearLastWallet()
        }
      ]}
    />
  );
}
