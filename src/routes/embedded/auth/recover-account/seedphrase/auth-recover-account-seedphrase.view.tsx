import { DevButtons } from "~components/dev/buttons/buttons.component";
import { DevFigmaScreen } from "~components/dev/figma-screen/figma-screen.component";
import { useEmbedded } from "~utils/embedded/embedded.hooks";

import screenSrc from "url:/assets-beta/figma-screens/recover-account-seedphrase.view.png";
import { useRef } from "react";

export function AuthRecoverAccountSeedphraseEmbeddedView() {
  const {
    /* tempWallet, clearTempWallet */
  } = useEmbedded();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const checkboxRef = useRef<HTMLInputElement>(null);

  // TODO: Confirm if wallet address is correct

  return (
    <DevFigmaScreen title="Enter seedphrase" src={screenSrc}>
      <div>
        <textarea ref={textareaRef} placeholder="Enter seedphrase"></textarea>
      </div>

      <div>
        <label>
          <input type="checkbox" ref={checkboxRef} />
          After recovery, all your devices are logged out and your account
          recovery files are invalided. You'll have to download a new one.
        </label>
      </div>

      <DevButtons
        config={[
          {
            label: "Recover",
            onClick: () => alert("No implemented yet.")
          },
          {
            label: "Back",
            to: "/auth/recover-account",
            variant: "secondary"
          }
        ]}
      />
    </DevFigmaScreen>
  );
}
