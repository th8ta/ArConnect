import { useEmbedded } from "~utils/embedded/embedded.hooks";
import { DevFigmaScreen } from "~components/dev/figma-screen/figma-screen.component";
import { DevButtons } from "~components/dev/buttons/buttons.component";
import { useRef } from "react";
import type { JWKInterface } from "arweave/web/lib/wallet";

import screenSrc from "url:/assets-beta/figma-screens/import-keyfile.view.png";
import confirmScreenSrc from "url:/assets-beta/figma-screens/import-keyfile-confirmation.view.png";

export function AuthImportKeyfileEmbeddedView() {
  const { importWallet, lastWallet, deleteLastWallet } = useEmbedded();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleImportWallet = () => {
    const textareaElement = textareaRef.current;

    // TODO: Return/throw error...
    if (!textareaElement) return;

    const jwk = JSON.parse(textareaElement.value) as JWKInterface;

    return importWallet(jwk);
  };
  // TODO: Redirect to confirmation manually once the tempWallet property is added.

  return lastWallet ? (
    <DevFigmaScreen
      title="Import private key"
      src={confirmScreenSrc}
      config={[
        {
          label: lastWallet.address,
          isDisabled: true
        },
        {
          label: "No, upload again",
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
      title="Import private key"
      src={screenSrc}
      config={[
        {
          label: "Upload",
          onClick: handleImportWallet
        },
        {
          label: "Back",
          to: "/auth/add-wallet",
          variant: "secondary"
        }
      ]}
    >
      <textarea ref={textareaRef} placeholder="Upload keyfile"></textarea>
    </DevFigmaScreen>
  );
}
