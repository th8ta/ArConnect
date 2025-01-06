import {
  ButtonV2,
  Loading,
  SelectV2,
  Text,
  TooltipV2,
  useToasts
} from "@arconnect/components";
import type { TokenType } from "~tokens/token";
import { Token as aoToken } from "ao-tokens";
import { useStorage } from "@plasmohq/storage/hook";
import { ExtensionStorage } from "~utils/storage";
import { TrashIcon } from "@iconicicons/react";
import { removeToken } from "~tokens";
import { useMemo, useState } from "react";
import { CopyButton } from "./WalletSettings";
import browser from "webextension-polyfill";
import styled from "styled-components";
import copy from "copy-to-clipboard";
import aoLogo from "url:/assets/ecosystem/ao-logo.svg";
import { formatAddress } from "~utils/format";
import { ResetButton } from "../Reset";
import { RefreshCcw01 } from "@untitled-ui/icons-react";
import { defaultAoTokens, type TokenInfo } from "~tokens/aoTokens/ao";
import type { CommonRouteProps } from "~wallets/router/router.types";

export interface TokenSettingsDashboardViewParams {
  id: string;
}

export type TokenSettingsDashboardViewProps =
  CommonRouteProps<TokenSettingsDashboardViewParams>;

export function TokenSettingsDashboardView({
  params: { id }
}: TokenSettingsDashboardViewProps) {
  // ao tokens
  const [aoTokens, setAoTokens] = useStorage<TokenInfo[] | any[]>(
    {
      key: "ao_tokens",
      instance: ExtensionStorage
    },
    []
  );

  const { setToast } = useToasts();

  const [loading, setLoading] = useState(false);

  const token = useMemo(() => {
    const aoToken = aoTokens.find((ao) => ao.processId === id);

    return {
      ...aoToken,
      id: aoToken.processId,
      name: aoToken.Name,
      ticker: aoToken.Ticker
    };
  }, [aoTokens, id]);

  // update token type
  function updateType(type: TokenType) {
    setAoTokens((allTokens) => {
      const tokenIndex = allTokens.findIndex((t) => t.id === id);
      if (tokenIndex !== -1) {
        allTokens[tokenIndex].type = type;
      }
      return [...allTokens];
    });
  }

  const refreshToken = async () => {
    setLoading(true);
    const defaultToken = defaultAoTokens.find((t) => t.processId === token.id);
    if (!defaultToken) {
      try {
        const tokenInfo = (await aoToken(token.id)).info;
        if (tokenInfo) {
          const updatedTokens = aoTokens.map((t) =>
            t.processId === token.id
              ? {
                  ...t,
                  Name: tokenInfo.Name,
                  Ticker: tokenInfo.Ticker,
                  Logo: tokenInfo.Logo,
                  Denomination: Number(tokenInfo.Denomination),
                  processId: token.id,
                  lastUpdated: new Date().toISOString()
                }
              : t
          );
          setAoTokens(updatedTokens);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching token info:", err);
        setLoading(false);
      }
    } else {
      setLoading(false);
      return;
    }
  };

  if (!token) return null;

  return (
    <Wrapper>
      <Inner>
        <TokenName>
          {token.name} <Image src={aoLogo} />
        </TokenName>
        <div>
          <Title>Symbol:</Title>
          <Text title noMargin>
            {token.ticker}
          </Text>
        </div>
        <div>
          <Title>Address:</Title>
          <div style={{ display: "flex" }}>
            <Text title noMargin>
              {formatAddress(token.id, 10)}
            </Text>
            <TooltipV2 content={browser.i18n.getMessage("copy_address")}>
              <CopyButton
                onClick={() => {
                  copy(token.id);
                  setToast({
                    type: "info",
                    content: browser.i18n.getMessage("copied_address", [
                      formatAddress(token.id, 8)
                    ]),
                    duration: 2200
                  });
                }}
              />
            </TooltipV2>
          </div>
        </div>
        <div>
          <Title>Denomination:</Title>
          <Text title noMargin>
            {token?.Denomination}
          </Text>
        </div>
        <SelectV2
          label={browser.i18n.getMessage("token_type")}
          onChange={(e) => {
            // @ts-expect-error
            updateType(e.target.value as TokenType);
          }}
          fullWidth
        >
          <option value="asset" selected={token.type === "asset"}>
            {browser.i18n.getMessage("token_type_asset")}
          </option>
          <option value="collectible" selected={token.type === "collectible"}>
            {browser.i18n.getMessage("token_type_collectible")}
          </option>
        </SelectV2>
      </Inner>
      <ButtonWrapper>
        <ButtonV2
          fullWidth
          onClick={async () => {
            await refreshToken();
          }}
        >
          {!loading ? (
            <>
              <RefreshCcw01 style={{ marginRight: "5px", height: "18px" }} />
              {browser.i18n.getMessage("refresh_token")}
            </>
          ) : (
            <Loading />
          )}
        </ButtonV2>

        <ResetButton fullWidth onClick={() => removeToken(id)}>
          <TrashIcon style={{ marginRight: "5px" }} />
          {browser.i18n.getMessage("remove_token")}
        </ResetButton>
      </ButtonWrapper>
    </Wrapper>
  );
}

const Inner = styled.div`
  gap: 8px;
  display: flex;
  flex-direction: column;
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

const Image = styled.img`
  width: 16px;
  padding: 0 8px;
  border: 1px solid rgb(${(props) => props.theme.cardBorder});
  border-radius: 2px;
`;

const TokenName = styled(Text).attrs({
  title: true,
  noMargin: true
})`
  font-weight: 600;
`;

const Title = styled(Text).attrs({
  noMargin: true
})`
  color: ${(props) => props.theme.primaryTextv2};
`;
