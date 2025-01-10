import { useEmbedded } from "~utils/embedded/embedded.hooks";
import { DevButtons } from "~components/dev/buttons/buttons.component";
import { DevFigmaScreen } from "~components/dev/figma-screen/figma-screen.component";

import screenSrc from "url:/assets-beta/figma-screens/add-auth-provider.view.png";

export function AuthAddAuthProviderEmbeddedView() {
  const { authMethod } = useEmbedded();

  return (
    <DevFigmaScreen title={`Add ${authMethod}`} src={screenSrc}>
      <DevButtons
        config={[
          {
            label: `Add ${authMethod}`,
            onClick: () => alert("Not implemented.")
          },
          {
            label: "Back",
            to: "/auth/add-wallet",
            variant: "secondary"
          }
        ]}
      />
    </DevFigmaScreen>
  );
}
