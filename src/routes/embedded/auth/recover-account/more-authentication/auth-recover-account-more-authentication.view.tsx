import { DevFigmaScreen } from "~components/dev/figma-screen/figma-screen.component";
import { useEmbedded } from "~utils/embedded/embedded.hooks";
import { useState } from "react";

import screenSrc from "url:/assets-beta/figma-screens/recover-account-more-authentication.view.png";

export function AuthRecoverAccountMoreAuthenticationEmbeddedView() {
  const { importedTempWalletAddress, recoverableAccounts, recoverAccount } =
    useEmbedded();

  const accountToRecover = recoverableAccounts?.[0];
  const accountToRecoverId = accountToRecover?.id;

  const [checkboxChecked, setCheckboxChecked] = useState<boolean>(false);

  const toggleCheckboxChecked = () =>
    setCheckboxChecked((prevValue) => !prevValue);

  return (
    <DevFigmaScreen
      title="Recover your account"
      description="More options"
      src={screenSrc}
      isLoading={!accountToRecover}
      config={[
        {
          label: importedTempWalletAddress,
          isDisabled: true
        },
        {
          label: accountToRecover ? accountToRecover.name : "-",
          isDisabled: true
        },
        {
          label: "Email & Password",
          onClick: () => recoverAccount("emailPassword", accountToRecoverId),
          isDisabled: !checkboxChecked
        },
        {
          label: "Facebook",
          onClick: () => recoverAccount("facebook", accountToRecoverId),
          isDisabled: !checkboxChecked
        },
        {
          label: "Apple",
          onClick: () => recoverAccount("apple", accountToRecoverId),
          isDisabled: !checkboxChecked
        },
        {
          label: "X",
          onClick: () => recoverAccount("x", accountToRecoverId),
          isDisabled: !checkboxChecked
        },
        {
          label: "Back",
          to: "/auth/recover-account/authentication",
          variant: "secondary"
        }
      ]}
    >
      <div>
        <label>
          <input
            type="checkbox"
            checked={checkboxChecked}
            onChange={toggleCheckboxChecked}
          />
          After recovery, all your devices are logged out and your account
          recovery files are invalided. You'll have to download a new one.
        </label>
      </div>
    </DevFigmaScreen>
  );
}
