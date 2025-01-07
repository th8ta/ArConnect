import { DevFigmaScreen } from "~components/dev/figma-screen/figma-screen.component";
import { useAuth } from "~utils/authentication/authentication.hooks";
import { DevButtons } from "~components/dev/buttons/buttons.component";

import screenSrc from "url:/assets-beta/figma-screens/add-wallet-confirmation.view.png";

export function AuthConfirmationEmbeddedView() {
  const { lastWallet, clearLastWallet } = useAuth();

  console.log("lastWallet =", lastWallet);

  return (
    <DevFigmaScreen
      title="Congratulations, your account has been created!"
      src={screenSrc}
    >
      <DevButtons
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
    </DevFigmaScreen>
  );
}
