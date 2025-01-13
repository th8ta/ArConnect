import { DevFigmaScreen } from "~components/dev/figma-screen/figma-screen.component";
import { useEmbedded } from "~utils/embedded/embedded.hooks";

import screenSrc from "url:/assets-beta/figma-screens/auth.view.png";

export function AuthEmbeddedView() {
  const { authenticate } = useEmbedded();

  // TODO: Remember last selection and highlight that one / show it in the main screen (not in "More")

  // TODO: Maybe also keep the last few characters of the address (there needs to be an option to disable this)

  return (
    <DevFigmaScreen
      title="Sign Up or Sign In"
      src={screenSrc}
      config={[
        {
          label: "Passkey",
          onClick: () => authenticate("passkey")
        },
        {
          label: "Google",
          onClick: () => authenticate("google")
        },
        {
          label: "ArConnect",
          onClick: () => alert("Not implemented")
          // TODO: When using Arweave Wallet Kit, it doesn't make sense to show "ArConnect" as an option here, but maybe
          // we would need a "back" option instead to show the AWK selector again.

          // TODO: Send a message to the SDK to connect using the injected window.arweaveWallet instead
          // TODO: Add special screen when using ArConnect. For MVP, no interface, only proxy.
        },
        {
          label: "More Options",
          to: "/auth/more-providers",
          variant: "secondary"
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
  );
}
