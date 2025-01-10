import { useEmbedded } from "~utils/embedded/embedded.hooks";
import { DevFigmaScreen } from "~components/dev/figma-screen/figma-screen.component";
import { useRef } from "react";

import screenSrc from "url:/assets-beta/figma-screens/import-seedphrase.view.png";
import confirmScreenSrc from "url:/assets-beta/figma-screens/import-seedphrase-confirmation.view.png";

export function AuthImportSeedphraseEmbeddedView() {
  const { importWallet, lastWallet, deleteLastWallet } = useEmbedded();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleImportWallet = () => {
    const textareaElement = textareaRef.current;

    // TODO: Return/throw error...
    if (!textareaElement) return;

    return importWallet(textareaRef.current.textContent);
  };

  // TODO: Redirect to confirmation manually once the tempWallet property is added.

  return lastWallet ? (
    <DevFigmaScreen
      title="Enter seedphrase"
      src={confirmScreenSrc}
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
  ) : (
    <DevFigmaScreen
      title="Enter seedphrase"
      src={screenSrc}
      config={[
        {
          label: "Import",
          onClick: handleImportWallet
        },
        {
          label: "Back",
          to: "/auth/add-wallet",
          variant: "secondary"
        }
      ]}
    >
      <textarea ref={textareaRef} placeholder="Enter seedphrase"></textarea>
    </DevFigmaScreen>
  );
}
