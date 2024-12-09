import { AnimatePresence, type Variants, motion } from "framer-motion";
import { useCallback, useState } from "react";
import { ButtonV2, Card } from "@arconnect/components";
import { CheckIcon } from "@iconicicons/react";
import browser from "webextension-polyfill";

import styled from "styled-components";

import { CompletedWelcomeView } from "./gettingStarted/completed";
import { EnableNotificationsWelcomeView } from "./gettingStarted/enableNotifications";
import { ConnectWelcomeView } from "./gettingStarted/connect";
import { ExploreWelcomeView } from "./gettingStarted/explore";
import { useLocation } from "~wallets/router/router.utils";
import type { CommonRouteProps } from "~wallets/router/router.types";
import { Redirect } from "~wallets/router/components/redirect/Redirect";

const Views = [
  CompletedWelcomeView,
  EnableNotificationsWelcomeView,
  ExploreWelcomeView,
  ConnectWelcomeView
];

export interface GettingStartedWelcomeViewParams {
  // TODO: Use a nested router instead:
  page: string;
}

export type GettingStartedWelcomeViewProps =
  CommonRouteProps<GettingStartedWelcomeViewParams>;

export function GettingStartedWelcomeView({
  params: { page: pageParam }
}: GettingStartedWelcomeViewProps) {
  const { navigate } = useLocation();
  const page = Number(pageParam);

  // animate content size
  const [contentSize, setContentSize] = useState<number>(0);
  const contentRef = useCallback<(el: HTMLDivElement) => void>((el) => {
    if (!el) return;

    const obs = new ResizeObserver(() => {
      if (!el || el.clientHeight <= 0) return;
      setContentSize(el.clientHeight);
    });

    obs.observe(el);
  }, []);

  if (isNaN(page) || page < 1 || page > 5) {
    return <Redirect to="/getting-started/1" />;
  }

  const navigateToPage = (pageNum: number) => {
    if (pageNum < 5) {
      navigate(`/getting-started/${pageNum}`);
    } else {
      // reset before unload
      window.onbeforeunload = null;
      window.top.close();
    }
  };

  const View = Views[page - 1];

  return (
    <Wrapper>
      <SetupCard>
        <HeaderContainer>
          <Header>
            <CheckWrapper>
              <CheckIcon />
            </CheckWrapper>
            Setup Complete!
          </Header>
        </HeaderContainer>
        <Content>
          <PageWrapper style={{ height: contentSize }}>
            <AnimatePresence initial={false}>
              <Page key={page} ref={contentRef}>
                <View />
              </Page>
            </AnimatePresence>
          </PageWrapper>
        </Content>
        <Footer>
          <PageIndicatorContainer>
            {Views.map((_, i) => (
              <PageIndicator
                key={i}
                active={page === i + 1}
                onClick={() => navigateToPage(i + 1)}
              />
            ))}
          </PageIndicatorContainer>
          <ButtonV2 fullWidth onClick={() => navigateToPage(page + 1)}>
            {browser.i18n.getMessage(page + 1 < 4 ? "next" : "done")}
          </ButtonV2>
        </Footer>
      </SetupCard>
    </Wrapper>
  );
}

const pageAnimation: Variants = {
  init: {
    opacity: 1
  },
  exit: {
    opacity: 0
  }
};

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const PageIndicatorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.25rem;
`;

const PageIndicator = styled.button<{ active?: boolean }>`
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  margin: 0 0.625rem;
  background-color: ${(props) =>
    props.active ? "#AB9AFF" : `rgba(${props.theme.theme}, 0.3)`};

  border: none;
  cursor: pointer;
  outline: none;
`;

const Page = styled(motion.div).attrs({
  variants: pageAnimation,
  initial: "exit",
  animate: "init"
})`
  position: absolute;
  width: 100%;
  height: max-content;
  left: 0;
  top: 0;
`;

const PageWrapper = styled.div`
  position: relative;
  transition: height 0.17s ease;
`;

const Content = styled.div`
  overflow: hidden;
  height: 100%;
`;
const CheckWrapper = styled.div`
  width: 0.9375rem;
  height: 0.9375rem;
  border-radius: 50%;
  color: #ffffff;

  background-color: rgba(20, 209, 16, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Header = styled.div`
  color: #14d110;
  background-color: rgba(20, 209, 16, 0.05);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border: 1px solid #14d110;
  border-radius: 25px;
  font-size: 0.625rem;
  padding: 0.625rem;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  min-height: 100vh;
  flex-direction: column;
`;

const SetupCard = styled(Card)`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2rem;
  height: 36.375rem;
  width: 26rem;
`;
