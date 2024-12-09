import { Card, Spacer, Text, useInput } from "@arconnect/components";
import SettingListItem from "~components/dashboard/list/SettingListItem";
import { SettingsList } from "~components/dashboard/list/BaseElement";
import { useEffect, useMemo, useState } from "react";
import { ChevronUp, ChevronDown } from "@untitled-ui/icons-react";
import browser from "webextension-polyfill";
import styled from "styled-components";
import { PageType, trackPage } from "~utils/analytics";
import SearchInput from "~components/dashboard/SearchInput";
import { useLocation } from "~wallets/router/router.utils";
import { SettingDashboardView } from "~components/dashboard/Setting";
import {
  advancedSettings,
  allSettings,
  basicSettings,
  isDashboardRouteConfig,
  type DashboardRouteConfig
} from "~routes/dashboard/dashboard.constants";
import type Setting from "~settings/setting";
import {
  DASHBOARD_SUB_SETTING_ROUTES,
  type DashboardRoutePath
} from "~wallets/router/dashboard/dashboard.routes";
import { Redirect } from "~wallets/router/components/redirect/Redirect";
import { Routes } from "~wallets/router/routes.component";

export interface SettingsDashboardViewParams {
  setting?: string;
  subsetting?: string;
}

export interface SettingsDashboardViewProps {
  params: SettingsDashboardViewParams;
}

export function SettingsDashboardView({ params }: SettingsDashboardViewProps) {
  const { navigate } = useLocation();
  const { setting: activeSettingParam } = params;

  const [showAdvanced, setShowAdvanced] = useState(false);
  const searchInput = useInput();

  const actualActiveSetting = useMemo(() => {
    return allSettings.find(({ name }) => name === activeSettingParam);
  }, [activeSettingParam]);

  // search filter function
  function filterSearchResults(
    dashboardRouteConfig: DashboardRouteConfig | Setting
  ) {
    const query = searchInput.state;

    if (query === "" || !query) {
      return true;
    }

    return (
      dashboardRouteConfig.name.toLowerCase().includes(query.toLowerCase()) ||
      browser.i18n
        .getMessage(dashboardRouteConfig.displayName)
        .toLowerCase()
        .includes(query.toLowerCase()) ||
      browser.i18n
        .getMessage(dashboardRouteConfig.description)
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }

  // Segment
  useEffect(() => {
    trackPage(PageType.SETTINGS);
  }, []);

  // Redirect to the first setting if none is selected:
  if (!actualActiveSetting) {
    return <Redirect to={`/${allSettings[0].name}` as DashboardRoutePath} />;
  }

  if (
    isDashboardRouteConfig(actualActiveSetting) &&
    !actualActiveSetting.component
  ) {
    throw new Error(
      `Missing component for ${actualActiveSetting.displayName} (${actualActiveSetting.name}) setting`
    );
  }

  return (
    <SettingsWrapper>
      <Panel normalPadding showRightBorder>
        <Spacer y={0.45} />

        <SettingsTitle>{browser.i18n.getMessage("settings")}</SettingsTitle>

        <Spacer y={0.85} />

        <SearchInput
          placeholder={browser.i18n.getMessage("search")}
          {...searchInput.bindings}
        />

        <Spacer y={0.85} />

        <Text noMargin>{browser.i18n.getMessage("general")}</Text>

        <Spacer y={0.85} />

        <SettingsList>
          {basicSettings.filter(filterSearchResults).map((setting, i) => (
            <SettingListItem
              displayName={setting.displayName}
              description={setting.description}
              icon={setting.icon}
              active={activeSettingParam === setting.name}
              onClick={() => navigate(`/${setting.name}` as DashboardRoutePath)}
              key={`basic-settings-${i}`}
            />
          ))}

          <AdvancedWrapper>
            <Text noMargin>{browser.i18n.getMessage("advanced")}</Text>
            <div
              onClick={() => setShowAdvanced((prev) => !prev)}
              style={{ display: "flex", cursor: "pointer" }}
            >
              <Text noMargin>
                {browser.i18n.getMessage(showAdvanced ? "hide" : "show")}
              </Text>
              <Action as={showAdvanced ? ChevronUp : ChevronDown} />
            </div>
          </AdvancedWrapper>

          {(showAdvanced || searchInput.state) &&
            advancedSettings
              .filter(filterSearchResults)
              .map((setting, i) => (
                <SettingListItem
                  displayName={setting.displayName}
                  description={setting.description}
                  icon={setting.icon}
                  active={activeSettingParam === setting.name}
                  onClick={() =>
                    navigate(`/${setting.name}` as DashboardRoutePath)
                  }
                  key={`advanced-settings-${i}`}
                />
              ))}
        </SettingsList>
      </Panel>

      <Panel normalPadding showRightBorder>
        <Spacer y={0.45} />

        <MidSettingsTitle>
          {browser.i18n.getMessage(actualActiveSetting?.displayName || "")}
        </MidSettingsTitle>

        <Spacer y={0.85} />

        {isDashboardRouteConfig(actualActiveSetting) ? (
          <actualActiveSetting.component />
        ) : (
          <SettingDashboardView
            key={activeSettingParam}
            setting={actualActiveSetting}
          />
        )}
      </Panel>

      <Panel>
        <Routes
          routes={DASHBOARD_SUB_SETTING_ROUTES}
          diffLocation
          pageComponent={null}
        />
      </Panel>
    </SettingsWrapper>
  );
}

const SettingsWrapper = styled.div`
  display: grid;
  align-items: stretch;
  grid-template-columns: 1fr 1fr 1.5fr;
  padding: 2rem;
  width: calc(100vw - 2rem * 2);
  height: calc(100vh - 2rem * 2);

  @media screen and (max-width: 900px) {
    display: flex;
    flex-wrap: wrap;
    row-gap: 2rem;
    height: auto;
  }
`;

const AdvancedWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Action = styled(ChevronDown)`
  cursor: pointer;
  font-size: 1.25rem;
  width: 1.5rem;
  height: 1.54rem;
  color: rgb(${(props) => props.theme.secondaryText});
  transition: all 0.23s ease-in-out;

  &:hover {
    opacity: 0.85;
  }

  &:active {
    transform: scale(0.92);
  }
`;

const isMac = () => {
  const userAgent = navigator.userAgent;

  return userAgent.includes("Mac") && !userAgent.includes("Windows");
};

const Panel = styled(Card)<{
  normalPadding?: boolean;
  showRightBorder?: boolean;
}>`
  position: relative;
  border-radius: 0;
  ${(props) => props.showRightBorder && `border-right: 1.5px solid #8e7bea;`}
  padding: ${(props) => (props.normalPadding ? "1.5rem 1rem" : "1.5rem")};
  overflow-y: auto;

  ${!isMac()
    ? `
    -ms-overflow-style: none;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }`
    : ""}

  @media screen and (max-width: 900px) {
    width: calc(50% - 2.5rem);
    height: 55vh;
    flex-grow: 1;

    &:nth-child(2) {
      border-right: 1px solid rgb(${(props) => props.theme.cardBorder});
    }

    &:last-child {
      width: 100%;
      height: auto;
    }
  }

  @media screen and (max-width: 645px) {
    width: 100%;
    height: 55vh;
    border-right: 1px solid rgb(${(props) => props.theme.cardBorder});

    &:last-child {
      height: auto;
    }
  }
`;

const SettingsTitle = styled(Text).attrs({
  title: true,
  noMargin: true
})``;

const MidSettingsTitle = styled(Text).attrs({
  title: true,
  noMargin: true
})`
  font-weight: 600;
  text-transform: capitalize;
`;
