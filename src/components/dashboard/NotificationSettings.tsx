import { useStorage } from "@plasmohq/storage/hook";
import styled from "styled-components";
import { ExtensionStorage } from "~utils/storage";
import { Checkbox, Spacer, Text } from "@arconnect/components-rebrand";
import browser from "webextension-polyfill";
import { RadioWrapper } from "./Setting";
import { ToggleSwitch } from "~routes/popup/subscriptions/subscriptionDetails";

export function NotificationSettingsDashboardView() {
  const [notificationSettings, setNotificationSettings] = useStorage(
    {
      key: "setting_notifications",
      instance: ExtensionStorage
    },
    false
  );
  const [notificationCustomizeSettings, setNotificationCustomizeSettings] =
    useStorage(
      {
        key: "setting_notifications_customize",
        instance: ExtensionStorage
      },
      ["default"]
    );

  const toggleNotificationSetting = () => {
    setNotificationSettings(!notificationSettings);
  };

  const handleRadioChange = (setting) => {
    setNotificationCustomizeSettings([setting]);
  };

  return (
    <>
      <Wrapper>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text size="lg" weight="medium" noMargin>
            {browser.i18n.getMessage("setting_notifications")}
          </Text>
          <ToggleSwitch
            checked={notificationSettings}
            setChecked={toggleNotificationSetting}
          />
        </div>
        <Spacer y={1.7} />
        <RadioWrapper>
          {/* AR AND AO TRANSFER NOTIFICATIONS  */}
          <Checkbox
            label="Enable Arweave and ao Transaction Notifications"
            checked={
              notificationCustomizeSettings &&
              notificationCustomizeSettings.includes("default")
            }
            onChange={() => handleRadioChange("default")}
          />

          {/* JUST AR TRANSFER NOTIFICATIONS  */}
          <Checkbox
            label="Enable Arweave Transaction Notifications"
            checked={
              notificationCustomizeSettings &&
              notificationCustomizeSettings.includes("arTransferNotifications")
            }
            onChange={() => handleRadioChange("arTransferNotifications")}
          />

          {/* ALL NOTIFICATIONS */}
          <Checkbox
            checked={
              notificationCustomizeSettings &&
              notificationCustomizeSettings.includes("allTxns")
            }
            onChange={() => handleRadioChange("allTxns")}
            label="Enable all Arweave and ao Notifications"
          />
        </RadioWrapper>
      </Wrapper>
    </>
  );
}

const Wrapper = styled.div`
  position: relative;
`;
