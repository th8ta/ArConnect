import { AnimatePresence, type Variants, motion } from "framer-motion";
import { Section, Text } from "@arconnect/components";
import { useLocation, useSearchParams } from "~wallets/router/router.utils";
import { CheckIcon, ShareIcon } from "@iconicicons/react";
import browser from "webextension-polyfill";
import styled from "styled-components";
import HeadV2 from "~components/popup/HeadV2";
import type {
  ArConnectRoutePath,
  CommonRouteProps
} from "~wallets/router/router.types";
import { SendButton } from ".";

export interface TransactionCompletedParams {
  id: string;
}

export type TransactionCompletedViewProps =
  CommonRouteProps<TransactionCompletedParams>;

export function TransactionCompletedView({
  params: { id }
}: TransactionCompletedViewProps) {
  const { navigate, back } = useLocation();
  const { back: backPath, isAo } = useSearchParams<{
    back?: string;
    isAo: boolean;
  }>();

  function handleOpen() {
    const url = isAo
      ? `https://www.ao.link/#/message/${id}`
      : `https://viewblock.io/arweave/tx/${id}`;

    browser.tabs.create({ url });
  }

  if (!id) return null;

  return (
    <Wrapper>
      <MainWrapper>
        <HeadV2
          title={browser.i18n.getMessage("transaction_complete")}
          back={() => navigate((backPath as ArConnectRoutePath) || "/")}
        />
        <BodyWrapper>
          <Circle>
            <CheckIcon height={35} width={35} color="#fff" />
          </Circle>
          <TextContainer>
            <Title>{browser.i18n.getMessage("transaction_complete")}</Title>
            <SubTitle>
              {browser.i18n.getMessage("transaction_id")}: {id}
            </SubTitle>
            <LinkText
              onClick={() =>
                navigate(
                  `/transaction/${id}${
                    backPath ? `?back=${encodeURIComponent(backPath)}` : ""
                  }` as ArConnectRoutePath
                )
              }
            >
              {browser.i18n.getMessage("view_transaction_details")}
            </LinkText>
          </TextContainer>
        </BodyWrapper>
      </MainWrapper>
      <AnimatePresence>
        {id && (
          <motion.div
            variants={opacityAnimation}
            initial="hidden"
            animate="shown"
            exit="hidden"
          >
            <Section>
              <SendButton fullWidth onClick={handleOpen}>
                {isAo ? "AOLink" : "Viewblock"}
                <ShareIcon style={{ marginLeft: "5px" }} />
              </SendButton>
            </Section>
          </motion.div>
        )}
      </AnimatePresence>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100vh;
`;

const opacityAnimation: Variants = {
  hidden: { opacity: 0 },
  shown: { opacity: 1 }
};

const MainWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const BodyWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
`;

const Circle = styled.div`
  width: 75px;
  height: 75px;
  border-radius: 50%;
  background-color: rgba(20, 209, 16, 0.25);
  border: 4px solid #14d110;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
  max-width: 90%;
`;

const Title = styled(Text).attrs({
  noMargin: true
})`
  font-size: 20px;
  word-break: break-word;
  overflow-wrap: break-word;
  color: ${(props) => props.theme.primaryTextv2};
`;

const SubTitle = styled(Text).attrs({
  noMargin: true
})`
  display: flex;
  flex-wrap: wrap;
  font-size: 16px;
  color: ${(props) => props.theme.secondaryTextv2};
  word-break: break-word;
  overflow-wrap: break-word;
`;

const LinkText = styled(Text)`
  font-size: 16px;
  color: ${(props) => props.theme.primary};
  cursor: pointer;
`;
