import { unlock } from "~wallets/auth";
import {
  InputV2,
  Section,
  Spacer,
  Text,
  useInput,
  useToasts
} from "@arconnect/components";
import Wrapper from "~components/auth/Wrapper";
import browser from "webextension-polyfill";
import { HeadAuth } from "~components/HeadAuth";
import { AuthButtons } from "~components/auth/AuthButtons";
import { withPage } from "~components/page/page.utils";

export function UnlockAuthRequestView() {
  // password input
  const passwordInput = useInput();

  // toasts
  const { setToast } = useToasts();

  // unlock ArConnect
  async function unlockWallet() {
    // unlock using password
    const res = await unlock(passwordInput.state);

    if (!res) {
      passwordInput.setStatus("error");

      return setToast({
        type: "error",
        content: browser.i18n.getMessage("invalidPassword"),
        duration: 2200
      });
    }
  }

  return (
    <Wrapper>
      <div>
        <HeadAuth title={browser.i18n.getMessage("unlock")} />

        <Spacer y={0.75} />

        <Section>
          <Text noMargin>
            {browser.i18n.getMessage("unlock_wallet_to_use")}
          </Text>
          <Spacer y={1.5} />
          <InputV2
            type="password"
            {...passwordInput.bindings}
            label={browser.i18n.getMessage("password")}
            placeholder={browser.i18n.getMessage("enter_password")}
            fullWidth
            autoFocus
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              unlockWallet();
            }}
          />
        </Section>
      </div>

      <Section>
        <AuthButtons
          primaryButtonProps={{
            label: browser.i18n.getMessage("unlock"),
            onClick: unlockWallet
          }}
        />
      </Section>
    </Wrapper>
  );
}
