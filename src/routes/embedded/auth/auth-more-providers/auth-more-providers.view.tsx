import { DevFigmaScreen } from "~components/dev/figma-screen/figma-screen.component";
import { useAuth } from "~utils/authentication/authentication.hooks";
import screenSrc from "url:/assets-beta/figma-screens/auth.view.png";
import { DevButtons } from "~components/dev/buttons/buttons.component";

export function AuthMoreProvidersEmbeddedView() {
  const { authenticate, authStatus } = useAuth();

  // TODO: Remember last selection and highlight that one / show it in the main screen (not in "More")

  // TODO: Maybe also keep the last few characters of the address (there needs to be an option to disable this)

  return (
    <DevFigmaScreen title="More options" src={screenSrc}>
      <DevButtons
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
    </DevFigmaScreen>
  );
}
