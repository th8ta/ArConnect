import { useEmbedded } from "~utils/embedded/embedded.hooks";
import { DevFigmaScreen } from "~components/dev/figma-screen/figma-screen.component";

import screenSrc from "url:/assets-beta/figma-screens/backup-options.view.png";

export function AccountBackupSharesEmbeddedView() {
  const { promptToBackUp /*, registerBackUp */ } = useEmbedded();

  // TODO: What if the user already has more than 3 backup shares?

  // TODO: Do we download one file for the whole account or a file per wallet?

  // TODO: Show confirmation message once backed up and keep the file in-memory
  // in case the button is clicked again.

  return (
    <DevFigmaScreen
      title="Account backup"
      src={screenSrc}
      config={[
        {
          label: "Google Drive",
          onClick: () => alert("Not implemented.")
        },
        {
          label: "iCloud",
          onClick: () => alert("Not implemented.")
        },
        {
          label: "Dropbox",
          onClick: () => alert("Not implemented.")
        },
        {
          label: "Download Account Recovery File",
          onClick: () => alert("Not implemented.")
        },
        promptToBackUp
          ? {
              label: "Back",
              to: "/account/backup-shares/reminder",
              variant: "secondary"
            }
          : {
              label: "Cancel",
              to: "/account",
              variant: "secondary"
            }
      ]}
    />
  );
}
