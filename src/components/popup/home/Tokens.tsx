import { Text } from "@arconnect/components-rebrand";
import browser from "webextension-polyfill";
import styled from "styled-components";
import Token, { ArToken } from "../Token";
import { useAoTokens } from "~tokens/aoTokens/ao";
import { useLocation } from "~wallets/router/router.utils";
import { Settings04 } from "@untitled-ui/icons-react";
import { ManageAssets } from "./ManageAssets";
import { useState } from "react";
import { useBotegaPrices } from "~tokens/hooks";

export default function Tokens() {
  const { navigate } = useLocation();
  const [open, setOpen] = useState(false);
  // all tokens
  const { tokens: aoTokens } = useAoTokens({ type: "asset", hidden: false });
  const { prices } = useBotegaPrices(aoTokens.map((t) => t.id));

  // handle aoClick
  function handleTokenClick(tokenId: string) {
    navigate(`/send/transfer/${tokenId}`);
  }

  return (
    <Cointainer>
      {aoTokens.length === 0 && (
        <NoTokens>{browser.i18n.getMessage("no_assets")}</NoTokens>
      )}
      <TokensList>
        <ArToken onClick={() => handleTokenClick("AR")} />
        {aoTokens.map((token) => (
          <Token
            key={token.id}
            divisibility={token.Denomination}
            ao={true}
            type={"asset"}
            defaultLogo={token?.Logo}
            id={token.id}
            ticker={token.Ticker}
            fiatPrice={prices[token.id]}
            onClick={() => handleTokenClick(token.id)}
          />
        ))}
      </TokensList>
      <ManageAssetList onClick={() => setOpen(true)}>
        <Settings04 height={20} width={20} />
        <Text variant="secondary" weight="semibold" size="sm" noMargin>
          {browser.i18n.getMessage("manage_asset_list")}
        </Text>
      </ManageAssetList>
      <ManageAssets open={open} close={() => setOpen(false)} />
    </Cointainer>
  );
}

const Cointainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TokensList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ManageAssetList = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0px;
  gap: 0.5rem;
  cursor: pointer;
`;

const NoTokens = styled(Text).attrs({
  noMargin: true
})`
  text-align: center;
`;
