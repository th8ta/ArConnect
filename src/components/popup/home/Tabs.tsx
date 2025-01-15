import { Section } from "@arconnect/components";
import { useState, type Dispatch, type SetStateAction } from "react";
import styled from "styled-components";
import browser from "webextension-polyfill";
import Tokens from "./Tokens";
import Collectibles from "./Collectibles";
import Transactions from "./Transactions";

interface TabType {
  id: number;
  name: string;
  component: () => JSX.Element;
}

interface TabProps {
  tab: TabType;
  active: boolean;
  setActiveTab: Dispatch<SetStateAction<number>>;
}

const Tab = ({ tab, active, setActiveTab }: TabProps) => (
  <StyledTab
    active={active}
    tabId={tab.id}
    onClick={() => setActiveTab(tab.id)}
  >
    {browser.i18n.getMessage(tab.name)}
  </StyledTab>
);

export default function Tabs() {
  const [activeTab, setActiveTab] = useState(0);

  // TODO: This could/should be implemented using a nested router:
  const tabs = [
    { id: 0, name: "assets", component: Tokens },
    { id: 1, name: "collectibles", component: Collectibles },
    { id: 2, name: "activity", component: Transactions }
  ];

  const ActiveComponent = tabs[activeTab].component;

  return (
    <Section style={{ padding: 0 }}>
      <TabsWrapper>
        {tabs.map((tab) => (
          <TabWrapper>
            <Tab
              key={tab.id}
              tab={tab}
              active={tab.id === activeTab}
              setActiveTab={setActiveTab}
            />
            {activeTab === 0 && tab.id == 1 && <Seperator />}
            {activeTab === 2 && tab.id == 0 && <Seperator />}
          </TabWrapper>
        ))}
      </TabsWrapper>
      <ContentWrapper>
        <ActiveComponent />
      </ContentWrapper>
    </Section>
  );
}

const TabWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Seperator = styled.div`
  width: 1px;
  height: 23px;
  border-radius: 0.5px;
  background: rgba(142, 142, 147, 0.2);
`;

const TabsWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  border-radius: 10px;
  padding: 2px;
  box-sizing: border-box;
  background: ${(props) => props.theme.surfaceSecondary};
  box-shadow: 0px 2px 3.3px 0px rgba(0, 0, 0, 0.07) inset;
`;

const StyledTab = styled.button<{ active?: boolean; tabId: number }>`
  display: flex;
  width: 108px;
  height: 32px;
  padding: 3px 10px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: ${(props) => props.theme.secondaryText};
  box-sizing: border-box;
  cursor: pointer;

  ${(props) =>
    props.active &&
    `
      color: ${props.theme.primaryText};
      border: 0.5px solid rgba(0, 0, 0, 0.12);
      background: ${props.theme.displayTheme === "dark" ? "#403785" : "#FFF"};
      box-shadow: 0px 3px 1px 0px rgba(0, 0, 0, 0.04), 0px 3px 8px 0px rgba(0, 0, 0, 0.16);
  `}
`;

const ContentWrapper = styled.div`
  margin-top: 16px;
  width: 100%;
`;
