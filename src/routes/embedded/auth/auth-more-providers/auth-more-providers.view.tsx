import { DevFigmaScreen } from "~components/dev/figma-screen/figma-screen.component";
import { useEmbedded } from "~utils/embedded/embedded.hooks";

import screenSrc from "url:/assets-beta/figma-screens/auth.view.png";

export function AuthMoreProvidersEmbeddedView() {
  const { authenticate } = useEmbedded();

  // TODO: Remember last selection and highlight that one / show it in the main screen (not in "More")

  // TODO: Maybe also keep the last few characters of the address (there needs to be an option to disable this)

  return (
    <DevFigmaScreen
      title="More options"
      src={screenSrc}
      config={[
        {
          label: "Email & Password",
          onClick: () => authenticate("emailPassword")
        },
        {
          label: "Facebook",
          onClick: () => authenticate("facebook")
        },
        {
          label: "Apple",
          onClick: () => authenticate("apple")
        },
        {
          label: "X",
          onClick: () => authenticate("x")
        },
        {
          label: "Back",
          to: "/auth",
          variant: "secondary"
        }
      ]}
    />
  );
}
