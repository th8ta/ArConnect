import { ButtonV2, Spacer, Text } from "@arconnect/components";
import { ArrowRightIcon } from "@iconicicons/react";
import { motion } from "framer-motion";
import browser from "webextension-polyfill";
import styled from "styled-components";
import { useLocation } from "~wallets/router/router.utils";
import type { CommonRouteProps } from "~wallets/router/router.types";

import { ArweaveWelcomeView } from "./arweave";
import { EcosystemWelcomeView } from "./ecosystem";
import { ScreenshotsWelcomeView } from "./screenshots";
import { Redirect } from "~wallets/router/components/redirect/Redirect";

interface PageInfo {
  // i18n key
  title: string;
  // i18n key
  content: string;
  // arwiki link
  arWiki?: string;
}

const pagesInfo: PageInfo[] = [
  {
    title: "what_is_arweave",
    content: "about_arweave",
    arWiki: "https://arwiki.wiki/#/en/Arweave"
  },
  {
    title: "what_is_the_permaweb",
    content: "about_permaweb",
    arWiki: "https://arwiki.wiki/#/en/the-permaweb"
  },
  {
    title: "what_is_arconnect",
    content: "about_arconnect"
  }
] as const;

const Views = [
  ArweaveWelcomeView,
  EcosystemWelcomeView,
  ScreenshotsWelcomeView
] as const;

export interface StartWelcomeViewParams {
  // TODO: Use a nested router instead:
  page: string;
}

export type StartWelcomeViewProps = CommonRouteProps<StartWelcomeViewParams>;

export function StartWelcomeView({
  params: { page: pageParam }
}: StartWelcomeViewProps) {
  const { navigate } = useLocation();
  const page = Number(pageParam);

  if (isNaN(page) || page < 1 || page > 3) {
    return <Redirect to="/start/1" />;
  }

  const pageInfo = pagesInfo[page - 1];
  const View = Views[page - 1];

  return (
    <Wrapper>
      <ExplainerSection>
        <ExplainTitle>{browser.i18n.getMessage(pageInfo.title)}</ExplainTitle>
        <Spacer y={0.5} />
        <ExplainerContent>
          {browser.i18n.getMessage(pageInfo.content)}
          {pageInfo.arWiki && (
            <>
              <br />
              {" " + browser.i18n.getMessage("read_more_arwiki") + " "}
              <a
                href={pageInfo.arWiki}
                target="_blank"
                rel="noopener noreferrer"
              >
                ArWiki
              </a>
              .
            </>
          )}
        </ExplainerContent>
        <Spacer y={1.25} />
        <ButtonWrapper>
          <ButtonV2
            fullWidth
            onClick={() =>
              navigate(page === 3 ? "/generate/1" : `/start/${page + 1}`)
            }
          >
            {browser.i18n.getMessage("next")}
            <ArrowRightIcon style={{ marginLeft: "5px" }} />
          </ButtonV2>
          <ButtonV2 secondary fullWidth onClick={() => navigate("/generate/1")}>
            {browser.i18n.getMessage("skip")}
          </ButtonV2>
        </ButtonWrapper>
      </ExplainerSection>
      <Pagination>
        {Views.map((_, i) => (
          <Page
            key={i}
            active={page === i + 1}
            onClick={() => navigate(`/start/${i + 1}`)}
          />
        ))}
      </Pagination>
      <View />
    </Wrapper>
  );
}

const Wrapper = styled(motion.div).attrs({
  initial: { opacity: 0 },
  animate: { opacity: 1 }
})`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

const ExplainerSection = styled.div`
  position: absolute;
  left: 3rem;
  bottom: 3rem;
  width: 31%;
`;

const ExplainTitle = styled(Text).attrs({
  title: true,
  noMargin: true
})`
  font-size: 2.7rem;
  font-weight: 600;
`;

const ExplainerContent = styled(Text).attrs({
  noMargin: true
})`
  text-align: justify;

  a {
    color: rgb(${(props) => props.theme.secondaryText});
  }
`;

const Pagination = styled.div`
  position: absolute;
  right: 3rem;
  bottom: 3rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Page = styled.span<{ active?: boolean }>`
  width: 3.5rem;
  height: 2px;
  cursor: pointer;
  background-color: rgb(
    ${(props) => props.theme.theme + ", " + (props.active ? "1" : ".45")}
  );
  transition: all 0.23s ease-in-out;
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
