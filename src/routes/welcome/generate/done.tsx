import { Button, Text } from "@arconnect/components-rebrand";
import { WalletContext } from "../setup";
import browser from "webextension-polyfill";
import { useContext, useEffect } from "react";
import { PageType, trackPage } from "~utils/analytics";
import JSConfetti from "js-confetti";
import WalletIconSvg from "url:~assets/setup/wallet.svg";
import styled from "styled-components";
import { CopyToClipboard } from "~components/CopyToClipboard";
import { formatAddress } from "~utils/format";
import Squircle from "~components/Squircle";

export function GenerateDoneWelcomeView() {
  // wallet context
  const { wallet } = useContext(WalletContext);

  // add generated wallet
  async function done() {
    window.onbeforeunload = null;
    window.top.close();
  }

  useEffect(() => {
    const jsConfetti = new JSConfetti();

    jsConfetti.addConfetti();
  }, []);

  // Segment
  useEffect(() => {
    trackPage(PageType.ONBOARD_COMPLETE);
  }, []);

  return (
    <Container>
      <Content>
        <WalletIcon />
        <InnerContent>
          <Text size="lg" weight="bold" noMargin>
            {browser.i18n.getMessage("congratulations")}
          </Text>
          <Text variant="secondary" noMargin>
            {browser.i18n.getMessage("congratulations_description")}
          </Text>
        </InnerContent>
        <InnerContent>
          <AccountContainer>
            <AccountIcon
              placeholderText={wallet?.nickname?.slice(0, 1) || "A"}
            />
            <Text size="base" weight="medium" noMargin>
              {wallet?.nickname || "Account 1"}
            </Text>
          </AccountContainer>
          <Text size="base" weight="medium" noMargin>
            {browser.i18n.getMessage("your_wallet_address_is")}
          </Text>
          <CopyToClipboard
            label={formatAddress(wallet.address, 16)}
            labelAs={Label}
            text={wallet.address}
          />
        </InnerContent>
      </Content>
      <Button fullWidth onClick={done}>
        {browser.i18n.getMessage("go_to_dashboard")}
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
  justify-content: center;
  text-align: center;
  gap: 24px;
`;

const InnerContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const WalletIcon = styled.img.attrs({
  src: WalletIconSvg
})`
  height: 72px;
  width: 72px;
`;

const AccountContainer = styled.div`
  display: flex;
  padding: 6px 8px;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  background: ${(props) => props.theme.input.background.default.default};
  width: max-content;
`;

const Label = styled(Text).attrs({
  size: "xs",
  weight: "medium",
  noMargin: true
})``;

const AccountIcon = styled(Squircle)`
  width: 24px;
  height: 24px;
  color: ${(props) => props.theme.theme};
`;
