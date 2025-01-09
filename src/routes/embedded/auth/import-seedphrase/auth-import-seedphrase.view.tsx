import { useAuth } from "~utils/authentication/authentication.hooks";
import { DevFigmaScreen } from "~components/dev/figma-screen/figma-screen.component";
import { DevButtons } from "~components/dev/buttons/buttons.component";
import { useRef, useState } from "react";

import screenSrc from "url:/assets-beta/figma-screens/import-seedphrase.view.png";
import confirmScreenSrc from "url:/assets-beta/figma-screens/import-seedphrase-confirmation.view.png";

export function AuthImportSeedphraseEmbeddedView() {
  const { importWallet, lastWallet, deleteLastWallet } = useAuth();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleImportWallet = async () => {
    const textareaElement = textareaRef.current;

    if (!textareaElement) return;

    // TODO: Handle errors and loading states.

    // TODO: Show loader at the SDK level while this is "loading" or simply disable the buttons here?

    // TODO: Make sure the confirmation screen is shown after this...

    await importWallet(textareaRef.current.textContent);
  };

  return lastWallet ? (
    <DevFigmaScreen title="Enter seedphrase" src={confirmScreenSrc}>
      <DevButtons
        config={[
          {
            label: lastWallet.address,
            isDisabled: true
          },
          {
            label: "No, try again",
            onClick: () => deleteLastWallet()
          },
          {
            label: "Yes, add",
            to: "/auth/confirmation"
          }
        ]}
      />
    </DevFigmaScreen>
  ) : (
    <DevFigmaScreen title="Enter seedphrase" src={screenSrc}>
      <textarea ref={textareaRef} placeholder="Enter seedphrase"></textarea>

      <DevButtons
        config={[
          {
            label: "Import",
            onClick: handleImportWallet
          },
          {
            label: "Back",
            to: "/auth/add-wallet"
          }
        ]}
      />
    </DevFigmaScreen>
  );
}
