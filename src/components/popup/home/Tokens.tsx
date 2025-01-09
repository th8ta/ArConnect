import { Heading, TokenCount, ViewAll } from "../Title";
import { Spacer, Text } from "@arconnect/components";
import browser from "webextension-polyfill";
import styled from "styled-components";
import Token from "../Token";
import { useAoTokens } from "~tokens/aoTokens/ao";
import { useLocation } from "~wallets/router/router.utils";

export default function Tokens() {
  const { navigate } = useLocation();

  // all tokens
  const [aoTokens, loading] = useAoTokens({ type: "asset" });

  // handle aoClick
  function handleTokenClick(tokenId: string) {
    navigate(`/send/transfer/${tokenId}`);
  }

  return (
    <>
      <Heading>
        <ViewAll onClick={() => navigate("/tokens")}>
          {browser.i18n.getMessage("view_all")}
          <TokenCount>({aoTokens.length})</TokenCount>
        </ViewAll>
      </Heading>
      <Spacer y={1} />
      {aoTokens.length === 0 && (
        <NoTokens>{browser.i18n.getMessage("no_assets")}</NoTokens>
      )}
      <TokensList>
        {aoTokens.map((token) => (
          <Token
            loading={loading}
            key={token.id}
            error={token.balance === null}
            networkError={token.balance === ""}
            divisibility={token.Denomination}
            ao={true}
            type={"asset"}
            defaultLogo={token?.Logo}
            id={token.id}
            ticker={token.Ticker}
            balance={token.balance || "0"}
            onClick={() => handleTokenClick(token.id)}
          />
        ))}
      </TokensList>
    </>
  );
}

const TokensList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.82rem;
`;

const NoTokens = styled(Text).attrs({
  noMargin: true
})`
  text-align: center;
`;
