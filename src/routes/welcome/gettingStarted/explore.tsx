import { Spacer, Text } from "@arconnect/components";
import AstroLogo from "url:/assets/ecosystem/astro.png";
import protocollandLogo from "url:/assets/ecosystem/protocolland.svg";
import botegaLogo from "url:/assets/ecosystem/botega.svg";
import Paragraph from "~components/Paragraph";
import browser from "webextension-polyfill";
import styled from "styled-components";
import { useEffect } from "react";
import { PageType, trackPage } from "~utils/analytics";

export function ExploreWelcomeView() {
  // Segment
  useEffect(() => {
    trackPage(PageType.SETUP_EXPLORE);
  }, []);

  return (
    <Wrapper>
      <div>
        <Text heading>{browser.i18n.getMessage("get_started")}</Text>
        <Paragraph>
          {browser.i18n.getMessage("get_started_description")}
        </Paragraph>
      </div>
      <Content>
        <Item>
          <ImageWrapper>
            <Image src={AstroLogo} alt={"Astro"} draggable={false} />
          </ImageWrapper>
          {browser.i18n.getMessage("example_astro_description")}
        </Item>
        <Item>
          <ImageWrapper>
            <Image
              src={protocollandLogo}
              alt={"Protocol Land"}
              draggable={false}
            />
          </ImageWrapper>
          {browser.i18n.getMessage("example_protocolland_description")}
        </Item>
        <Item>
          <ImageWrapper>
            <Image src={botegaLogo} alt={"Botega"} draggable={false} />
          </ImageWrapper>
          {browser.i18n.getMessage("example_botega_description")}
        </Item>
      </Content>
      <Spacer y={1.5} />
    </Wrapper>
  );
}
const Wrapper = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-direction: column;
  justify-content: space-between;
`;
const Item = styled.div`
  display: flex;
  color: #ab9aff;
  font-weight: 500;
  gap: 1.25rem;
`;

const ImageWrapper = styled.div`
  background: rgba(171, 154, 255, 0.15);
  border: 1px solid #ab9aff;
  border-radius: 12px;
`;
const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const Image = styled.img`
  width: 2.125rem;
  height: 2.125rem;
  padding: 0.625rem;
`;
