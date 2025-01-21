import { PageType, trackPage } from "~utils/analytics";
import { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Button,
  Input,
  Section,
  useInput
} from "@arconnect/components-rebrand";
import browser from "webextension-polyfill";
import { type Token as TokenInterface } from "~tokens/token";
import { useLocation } from "~wallets/router/router.utils";
import HeadV2 from "~components/popup/HeadV2";
import { type Contact } from "~components/Recipient";
import type { CommonRouteProps } from "~wallets/router/router.types";
import { Flex } from "~components/common/Flex";
import Tabs from "~components/Tabs";

// default size for the qty text
export const arPlaceholder: TokenInterface = {
  id: "AR",
  name: "Arweave",
  ticker: "AR",
  type: "asset",
  balance: "0",
  decimals: 12
};

export type RecipientType = {
  contact?: Contact;
  address: string;
};

export interface TransactionData {
  networkFee: string;
  estimatedFiat: string;
  qty: string;
  token: TokenInterface;
  estimatedNetworkFee: string;
  recipient: RecipientType;
  qtyMode: string;
  message?: string;
  isAo?: boolean;
}

export interface SendViewParams {
  id?: string;
}

export type SendViewProps = CommonRouteProps<SendViewParams>;

export function SendView({}: SendViewProps) {
  const { back } = useLocation();
  const addressInput = useInput();

  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: 0, name: "contacts", component: () => null },
    { id: 1, name: "recents", component: () => null }
  ] as const;

  // Segment
  useEffect(() => {
    trackPage(PageType.SEND);
  }, []);

  return (
    <>
      <HeadV2 back={back} title={browser.i18n.getMessage("send_to")} />

      <Wrapper>
        <Flex direction="column" gap={24}>
          <Flex justify="space-between" gap={8}>
            <Input
              fullWidth
              sizeVariant="small"
              {...addressInput.bindings}
              placeholder="Address or ArNS name"
            />
            <Button
              style={{ padding: "12px 24px", width: "max-content", height: 42 }}
            >
              {browser.i18n.getMessage("next")}
            </Button>
          </Flex>
          <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        </Flex>
      </Wrapper>
    </>
  );
}

const Wrapper = styled(Section)`
  height: calc(100vh - 100px);
  padding-top: 0px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
`;

// Make this dynamic
export const SendButton = styled(Button)<{ alternate?: boolean }>`
  background-color: ${(props) => props.alternate && "rgb(171, 154, 255, 0.15)"};
  border: 1px solid rgba(171, 154, 255, 0.15);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.alternate ? "space-between" : "center")};
  width: 100%;
  color: ${(props) => props.alternate && "#b9b9b9"};
  padding: 10px;
  font-weight: 400;

  &:hover:not(:active):not(:disabled) {
    box-shadow: 0 0 0 0.075rem rgba(${(props) => props.theme.theme}, 0.5);
    background-color: none;
  }
`;

export const Degraded = styled.div`
  background: ${(props) => props.theme.backgroundSecondary};
  display: flex;
  margin: 0 0.9375rem;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid ${(props) => props.theme.fail};
  position: relative;
  z-index: 11;
  border-radius: 0.625rem;

  h4 {
    font-weight: 500;
    font-size: 14px;
    margin: 0;
    padding: 0;
    font-size: inherit;
  }

  span {
    color: ${(props) => props.theme.secondaryTextv2};
    font-size: 12px;
  }
`;

export const WarningWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const SendInput = styled(Input)<{ error?: boolean }>`
  color: ${(props) => (props.error ? "red" : "#b9b9b9")};
  background-color: rgba(171, 154, 255, 0.15);
  font-weight: 400;
  font-size: 1rem;
  padding: 10px;

  // remove counter
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;
