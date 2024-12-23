import { Section, Text } from "@arconnect/components";
import Message from "~components/auth/Message";
import Wrapper from "~components/auth/Wrapper";
import browser from "webextension-polyfill";
import { useEffect } from "react";
import { useCurrentAuthRequest } from "~utils/auth/auth.hooks";
import { HeadAuth } from "~components/HeadAuth";
import { AuthButtons } from "~components/auth/AuthButtons";

export function DecryptAuthRequestView() {
  const { authRequest, acceptRequest, rejectRequest } =
    useCurrentAuthRequest("decrypt");

  const { authID, url, message } = authRequest;

  // listen for enter to reset
  useEffect(() => {
    const listener = async (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      await acceptRequest();
    };

    window.addEventListener("keydown", listener);

    return () => window.removeEventListener("keydown", listener);
  }, [authID]);

  return (
    <Wrapper>
      <div>
        <HeadAuth title={browser.i18n.getMessage("titles_decrypt")} />

        <Section>
          <Text noMargin>
            {browser.i18n.getMessage("decrypt_description", url)}
          </Text>

          <div style={{ marginTop: "16px" }}>
            <Message message={message} />
          </div>
        </Section>
      </div>

      <Section>
        <AuthButtons
          authRequest={authRequest}
          primaryButtonProps={{
            label: browser.i18n.getMessage("decrypt_authorize"),
            onClick: () => acceptRequest()
          }}
          secondaryButtonProps={{
            onClick: () => rejectRequest()
          }}
        />
      </Section>
    </Wrapper>
  );
}
