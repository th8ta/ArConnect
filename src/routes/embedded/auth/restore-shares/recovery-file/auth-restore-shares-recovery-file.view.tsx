import { DevFigmaScreen } from "~components/dev/figma-screen/figma-screen.component";
import { useEmbedded } from "~utils/embedded/embedded.hooks";
import { useRef } from "react";

import screenSrc from "url:/assets-beta/figma-screens/restore-shares.view.png";

export function AuthRestoreSharesRecoveryFileEmbeddedView() {
  const { wallets, restoreWallet } = useEmbedded();
  const walletAddress = wallets[0].address;

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleRestore = () => {
    const textareaElement = textareaRef.current;

    // TODO: Throw error with error message for `DevFigmaScreen` to display it:
    if (!textareaElement) return;

    return restoreWallet(walletAddress, textareaRef.current.value);
  };

  // TODO: The recovery file should probably include the wallet address or a hash so that we can
  // request the recovery of the right one from the backend without asking the user to manually select
  // the address of the wallet they want to recover.

  // TODO: Do we need to show a selector with the recoverable wallets or list all of them but tell the user
  // which ones can/can't be recovered (or none)? Can I get a new wallet instead?

  // This view should probably work if the user uploads a keyfile too

  return (
    <DevFigmaScreen
      title="Restore shares / wallet"
      src={screenSrc}
      config={[
        {
          // TODO: This should be a selector / dropdown and we might want to include a bulk / download all option
          label: walletAddress,
          isDisabled: true
        },
        {
          label: "Upload",
          onClick: handleRestore
        },
        {
          label: "Back",
          to: "/auth/restore-shares",
          variant: "secondary"
        }
      ]}
    >
      <textarea ref={textareaRef} placeholder="Upload recovery file"></textarea>
    </DevFigmaScreen>
  );
}
