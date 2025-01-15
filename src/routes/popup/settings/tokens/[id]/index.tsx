import {
  ButtonV2,
  SelectV2,
  Spacer,
  Text,
  TooltipV2,
  useToasts
} from "@arconnect/components";
import type { TokenType } from "~tokens/token";
import { useStorage } from "@plasmohq/storage/hook";
import { ExtensionStorage } from "~utils/storage";
import { TrashIcon } from "@iconicicons/react";
import { removeToken } from "~tokens";
import { useMemo } from "react";
import browser from "webextension-polyfill";
import styled from "styled-components";
import copy from "copy-to-clipboard";
import { formatAddress } from "~utils/format";
import { CopyButton } from "~components/dashboard/subsettings/WalletSettings";
import HeadV2 from "~components/popup/HeadV2";
import type { CommonRouteProps } from "~wallets/router/router.types";
import { useLocation } from "~wallets/router/router.utils";
import { LoadingView } from "~components/page/common/loading/loading.view";

export interface TokenSettingsParams {
  id: string;
}

export type TokenSettingsProps = CommonRouteProps<TokenSettingsParams>;

export function TokenSettingsView({ params: { id } }: TokenSettingsProps) {
  const { navigate } = useLocation();

  // ao tokens
  const [aoTokens, setAoTokens] = useStorage<any[]>(
    {
      key: "ao_tokens",
      instance: ExtensionStorage
    },
    []
  );

  const { setToast } = useToasts();

  const token = useMemo(() => {
    const aoToken = aoTokens.find((ao) => ao.processId === id);
    if (!aoToken) return;

    return {
      ...aoToken,
      id: aoToken.processId,
      name: aoToken.Name,
      ticker: aoToken.Ticker
      // Map additional AO token properties as needed
    };
  }, [aoTokens, id]);

  // update token type
  function updateType(type: TokenType) {
    setAoTokens((allTokens) => {
      const tokenIndex = allTokens.findIndex((t) => t.processId === id);
      if (tokenIndex !== -1) {
        allTokens[tokenIndex].type = type;
      }
      return [...allTokens];
    });
  }

  if (!token) {
    return <LoadingView />;
  }

  return (
    <>
      <HeadV2
        title={token.name}
        back={() => navigate("/quick-settings/tokens")}
      />
      <Wrapper>
        <div>
          <Spacer y={0.45} />
          <Property>
            <PropertyName>Symbol:</PropertyName>
            <PropertyValue>{token.ticker}</PropertyValue>
          </Property>
          <TokenAddress>
            <Property>
              <PropertyName>Address:</PropertyName>
              <PropertyValue>{formatAddress(token.id, 8)}</PropertyValue>
            </Property>
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
          </TokenAddress>
          <SelectV2
            small
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
        </div>
        <ButtonV2
          fullWidth
          onClick={async () => {
            await removeToken(id);
            navigate(`/quick-settings/tokens`);
          }}
          style={{ backgroundColor: "#8C1A1A" }}
        >
          <TrashIcon style={{ marginRight: "5px" }} />
          {browser.i18n.getMessage("remove_token")}
        </ButtonV2>
      </Wrapper>
    </>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0 1rem;
  height: calc(100vh - 80px);
`;

const TokenAddress = styled(Text).attrs({
  margin: true
})`
  margin-top: 12px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.37rem;
`;

const Property = styled.div`
  display: flex;
  gap: 4px;
`;

const BasePropertyText = styled(Text).attrs({
  noMargin: true
})`
  font-size: 1rem;
  font-weight: 500;
`;

const PropertyName = styled(BasePropertyText)``;

const PropertyValue = styled(BasePropertyText)`
  color: ${(props) => props.theme.primaryText};
`;
