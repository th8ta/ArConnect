import { Text } from "@arconnect/components-rebrand";
import browser from "webextension-polyfill";
import styled from "styled-components";
import { ExtensionStorage } from "~utils/storage";
import { useStorage } from "@plasmohq/storage/hook";
import { ToggleSwitch } from "~routes/popup/subscriptions/subscriptionDetails";

export const SignSettingsDashboardView = () => {
  const [transferRequirePassword, setTransferRequirePassword] = useStorage(
    {
      key: "transfer_require_password",
      instance: ExtensionStorage
    },
    false
  );

  return (
    <Wrapper>
      <ToggleSwitchWrapper>
        <Text>{browser.i18n.getMessage("enable_transfer_settings")}</Text>
        <ToggleSwitch
          width={51}
          height={31}
          checked={transferRequirePassword}
          setChecked={setTransferRequirePassword}
        />
      </ToggleSwitchWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
`;

const ToggleSwitchWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;
