import { DevFigmaScreen } from "~components/dev/figma-screen/figma-screen.component";
import { useAuth } from "~utils/authentication/authentication.hooks";
import { DevButtons } from "~components/dev/buttons/buttons.component";

import screenSrc from "url:/assets-beta/figma-screens/add-wallet-confirmation.view.png";

export function AccountAddWalletConfirmationEmbeddedView() {
  const { lastWalletAddress, clearLastWalletAddress } = useAuth();

  // TODO: Change text to created/imported depending on wallet origin.

  return (
    <DevFigmaScreen
      title="Congratulations, your wallet has been created!"
      src={screenSrc}
    >
      <DevButtons
        config={[
          {
            label: lastWalletAddress,
            isDisabled: true
          },
          {
            label: "Done",
            onClick: () => clearLastWalletAddress()
          }
        ]}
      />
    </DevFigmaScreen>
  );
}
