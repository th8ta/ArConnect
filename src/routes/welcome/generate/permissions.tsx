import Paragraph from "~components/Paragraph";
import { useContext, useEffect } from "react";
import browser from "webextension-polyfill";
import { WalletContext, type SetupWelcomeViewParams } from "../setup";
import { Spacer, useInput } from "@arconnect/components";
import { PageType, trackPage } from "~utils/analytics";
import { useLocation } from "~wallets/router/router.utils";
import type { CommonRouteProps } from "~wallets/router/router.types";
import styled from "styled-components";
import { Button, Text } from "@arconnect/components-rebrand";
import { ToggleSwitch } from "~routes/popup/subscriptions/subscriptionDetails";
import { useStorage } from "@plasmohq/storage/hook";
import { ExtensionStorage } from "~utils/storage";

export type PermissionsWelcomeViewProps =
  CommonRouteProps<SetupWelcomeViewParams>;

export function PermissionsWelcomeView({
  params
}: PermissionsWelcomeViewProps) {
  const { navigate } = useLocation();

  const { setAccountName } = useContext(WalletContext);

  const [analyticSetting, setAnalyticSetting] = useStorage(
    {
      key: "setting_analytic",
      instance: ExtensionStorage
    },
    true
  );

  const [notificationSetting, setNotificationSetting] = useStorage(
    {
      key: "setting_notifications",
      instance: ExtensionStorage
    },
    true
  );

  // input controls
  const accountInput = useInput("Account 1");

  // handle done button
  function done() {
    if (!accountInput.state) return;

    setAccountName(accountInput.state);

    // next page
    navigate(`/${params.setupMode}/${Number(params.page) + 1}`);
  }

  // Segment
  useEffect(() => {
    trackPage(PageType.ONBOARD_NEW_ACCOUNT);
  }, []);

  return (
    <Container>
      <Content>
        <Paragraph>
          {browser.i18n.getMessage("enable_permissions_description")}
        </Paragraph>
        <div>
          <BoxContainer>
            <ToggleSwitch
              checked={analyticSetting}
              setChecked={setAnalyticSetting}
              height={31}
              width={51}
            />
            <div style={{ flex: 1 }}>
              <Text size="md" weight="medium" noMargin>
                {browser.i18n.getMessage("analytics")}
              </Text>
              <Spacer y={0.25} />
              <Text size="sm" variant="secondary" weight="medium" noMargin>
                {browser.i18n.getMessage("enable_analytics_description")}
              </Text>
            </div>
          </BoxContainer>
          <Spacer y={1} />
          <BoxContainer>
            <ToggleSwitch
              checked={notificationSetting}
              setChecked={setNotificationSetting}
              height={31}
              width={51}
            />
            <div style={{ flex: 1 }}>
              <Text size="md" weight="medium" noMargin>
                {browser.i18n.getMessage("setting_notifications")}
              </Text>
              <Spacer y={0.25} />
              <Text size="sm" variant="secondary" weight="medium" noMargin>
                {browser.i18n.getMessage("enable_notifications_description")}
              </Text>
            </div>
          </BoxContainer>
        </div>
      </Content>
      <Button fullWidth onClick={() => done()}>
        {browser.i18n.getMessage("continue")}
      </Button>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  gap: 24px;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

const BoxContainer = styled.div`
  display: flex;
  padding: 12px;
  align-items: center;
  gap: 12px;
  align-self: stretch;
  border-radius: 8px;
  background: ${(props) => props.theme.input.background.dropdown.default};
`;
