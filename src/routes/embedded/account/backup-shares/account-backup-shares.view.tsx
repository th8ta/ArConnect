import { useRef } from "react";
import { useAuth } from "~utils/authentication/authentication.hooks";
import { DevFigmaScreen } from "~components/dev/figma-screen/figma-screen.component";
import { DevButtons } from "~components/dev/buttons/buttons.component";

import screenSrc from "url:/assets-beta/figma-screens/backup-shares.view.png";

export function AccountBackupSharesEmbeddedView() {
  const { promptToBackUp, skipBackUp, registerBackUp } = useAuth();

  // TODO: What if the user already has more than 3 backup shares?

  const checkboxRef = useRef<HTMLInputElement>();

  const handleSkipClicked = () => {
    skipBackUp(checkboxRef?.current.checked);
  };

  return (
    <DevFigmaScreen title="Account backup" src={screenSrc}>
      <DevButtons
        config={[
          {
            label: "Back up now",
            to: "/account/backup-shares/options"
          },
          promptToBackUp
            ? {
                label: "Back up later",
                to: "/account",
                onClick: () => handleSkipClicked()
              }
            : {
                label: "Cancel",
                to: "/account"
              }
        ]}
      />

      {promptToBackUp ? (
        <label>
          <input type="checkbox" ref={checkboxRef} />
          Do not ask again
        </label>
      ) : null}
    </DevFigmaScreen>
  );
}
