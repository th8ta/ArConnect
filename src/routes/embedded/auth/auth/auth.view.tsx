import { DevFigmaScreen } from "~components/dev/figma-screen/figma-screen.component";
import { useAuth } from "~utils/authentication/authentication.hooks";
import screenSrc from "url:/assets-beta/figma-screens/auth.view.png";
import { DevButtons } from "~components/dev/buttons/buttons.component";

export function AuthEmbeddedView() {
  const { authenticate, authStatus } = useAuth();

  // TODO: Remember last selection and highlight that one / show it in the main screen (not in "More")

  // TODO: Maybe also keep the last few characters of the address (there needs to be an option to disable this)

  return (
    <DevFigmaScreen title="Sign Up or Sign In" src={screenSrc}>
      <DevButtons
        config={[
          {
            label: "Passkey",
            onClick: () => authenticate("passkey")
          },
          {
            label: "Email & Password",
            onClick: () => authenticate("emailPassword")
          },
          {
            label: "Google",
            onClick: () => authenticate("google")
          },
          {
            label: "More Options",
            to: "/auth/more-options"
          },
          {
            label: "ArConnect",
            onClick: () => alert("Not implemented")
            // TODO: Send a message to the SDK to connect using the injected window.arweaveWallet instead
            // TODO: Add special screen when using ArConnect. For MVP, no interface, only proxy.
          },
          {
            label: "Recover Account",
            to: "/auth/recover-account",
            variant: "secondary"
          },
          {
            label: "Delete device shard",
            isDisabled: true,
            variant: "dev"
          }
        ]}
      />
    </DevFigmaScreen>
  );
}
