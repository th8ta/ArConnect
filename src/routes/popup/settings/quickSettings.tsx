import HeadV2 from "~components/popup/HeadV2";
import browser from "webextension-polyfill";
import styled from "styled-components";
import type { CommonRouteProps } from "~wallets/router/router.types";
import { useLocation } from "~wallets/router/router.utils";
import { quickSettingsMenuItems } from "~routes/dashboard/dashboard.constants";
import { SettingListItem } from "~components/popup/list/SettingListItem";
import type { PopupRoutePath } from "~wallets/router/popup/popup.routes";

export interface QuickSettingsViewParams {
  setting?: string;
  subsetting?: string;
}

export type QuickSettingsViewProps = CommonRouteProps<QuickSettingsViewParams>;

export function QuickSettingsView({ params }: QuickSettingsViewProps) {
  const { navigate } = useLocation();
  const activeSetting = params.setting;

  return (
    <>
      <HeadV2
        title={browser.i18n.getMessage("quick_settings")}
        back={() => navigate("/")}
      />
      <SettingsList>
        {quickSettingsMenuItems.map((setting, i) => (
          <SettingListItem
            displayName={setting.displayName}
            description={setting.description}
            icon={setting.icon}
            active={activeSetting === setting.name}
            isExternalLink={!!setting.externalLink}
            onClick={() => {
              if (setting.externalLink) {
                browser.tabs.create({
                  url: browser.runtime.getURL(setting.externalLink)
                });
              } else {
                navigate(`/quick-settings/${setting.name}` as PopupRoutePath);
              }
            }}
            key={i}
          />
        ))}
      </SettingsList>
    </>
  );
}

const SettingsList = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.125rem;
  padding: 0 1rem;
`;
