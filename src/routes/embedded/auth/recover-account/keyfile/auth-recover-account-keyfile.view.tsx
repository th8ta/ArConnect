import { DevFigmaScreen } from "~components/dev/figma-screen/figma-screen.component";
import { useEmbedded } from "~utils/embedded/embedded.hooks";
import { useEffect, useRef } from "react";
import { useLocation } from "~wallets/router/router.utils";

import screenSrc from "url:/assets-beta/figma-screens/recover-account-keyfile.view.png";
import confirmScreenSrc from "url:/assets-beta/figma-screens/recover-account-keyfile-confirmation.view.png";

export function AuthRecoverAccountKeyfileEmbeddedView() {
  const {
    importTempWallet,
    importedTempWalletAddress,
    deleteImportedTempWallet,
    fetchRecoverableAccounts,
    clearRecoverableAccounts
  } = useEmbedded();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleImportWallet = () => {
    const textareaElement = textareaRef.current;

    // TODO: Throw error with error message for `DevFigmaScreen` to display it:
    if (!textareaElement) return;

    return importTempWallet(textareaRef.current.value);
  };

  const { navigate } = useLocation();

  const handleRecover = async () => {
    await fetchRecoverableAccounts();

    navigate("/auth/recover-account/authentication");
  };

  useEffect(() => {
    // TODO: Make sure the imported wallet does stay in memory:
    deleteImportedTempWallet();
    clearRecoverableAccounts();
  }, []);

  return importedTempWalletAddress ? (
    <DevFigmaScreen
      title="Recover your account"
      description="Import private key"
      src={confirmScreenSrc}
      config={[
        {
          label: importedTempWalletAddress,
          isDisabled: true
        },
        {
          label: "No, upload again",
          onClick: deleteImportedTempWallet,
          variant: "secondary"
        },
        {
          label: "Yes, recover",
          onClick: handleRecover
        }
      ]}
    />
  ) : (
    <DevFigmaScreen
      title="Recover your account"
      description="Import private key"
      src={screenSrc}
      config={[
        {
          label: "Recover",
          onClick: handleImportWallet
        },
        {
          label: "Back",
          to: "/auth/recover-account",
          variant: "secondary"
        }
      ]}
    >
      <textarea ref={textareaRef} placeholder="Upload keyfile"></textarea>
    </DevFigmaScreen>
  );
}
