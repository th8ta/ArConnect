import styled from "styled-components";
import { useEffect } from "react";
import { PageType, trackPage } from "~utils/analytics";
import { Container, Content } from "~components/welcome/Wrapper";
import { Text } from "@arconnect/components-rebrand";
import browser from "webextension-polyfill";

export function GettingStartedOnrampView() {
  // Segment
  useEffect(() => {
    trackPage(PageType.GETTING_STARTED_ONRAMP);
  }, []);

  return (
    <Container>
      <Content justifyContent="center" alignItems="center" textAlign="center">
        <Image
          src={
            "https://archive.org/download/placeholder-image/placeholder-image.jpg"
          }
          alt="Placeholder Image"
        />
        <Text size="lg" weight="medium" noMargin>
          {browser.i18n.getMessage("getting_started_onramp_title")}
        </Text>
      </Content>
    </Container>
  );
}

const Image = styled.img`
  width: 100%;
  flex: 1;
`;
