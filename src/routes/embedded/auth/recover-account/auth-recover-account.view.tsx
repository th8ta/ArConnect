import { DevButtons } from "~components/dev/buttons/buttons.component";
import { DevFigmaScreen } from "~components/dev/figma-screen/figma-screen.component";

import screenSrc from "url:/assets-beta/figma-screens/recover-account.view.png";

export function AuthRecoverAccountEmbeddedView() {
  return (
    <DevFigmaScreen
      title="Recover your account"
      description="After recovery, all your devices are logged out and your account recovery files are invalided. You'll have to download a new one."
      src={screenSrc}
    >
      <DevButtons
        config={[
          {
            label: "Enter Seedphrase",
            to: "/auth/recover-account/seedphrase"
          },
          {
            label: "Import Private Key",
            to: "/auth/recover-account/keyfile"
          },
          {
            label: "Cancel",
            to: "/auth",
            variant: "secondary"
          }
        ]}
      />
    </DevFigmaScreen>
  );
}
