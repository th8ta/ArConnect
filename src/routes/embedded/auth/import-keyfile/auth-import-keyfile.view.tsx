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

  const handleImportWallet = async () => {
    const textareaElement = textareaRef.current;

    if (!textareaElement) return;

    // TODO: Handle errors and loading states.

    // TODO: Show loader at the SDK level while this is "loading" or simply disable the buttons here?

    // TODO: Make sure the confirmation screen is shown after this...

    const jwk = JSON.parse(textareaElement.value) as JWKInterface;

    await importWallet(jwk);
  };

  return lastWallet ? (
    <DevFigmaScreen title="Import private key" src={confirmScreenSrc}>
      <DevButtons
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
    </DevFigmaScreen>
  ) : (
    <DevFigmaScreen title="Import private key" src={screenSrc}>
      <textarea ref={textareaRef} placeholder="Upload keyfile"></textarea>

      <DevButtons
        config={[
          {
            label: "Upload",
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
