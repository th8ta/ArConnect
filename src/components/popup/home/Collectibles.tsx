import { Heading, TokenCount, ViewAll } from "../Title";
import { Spacer, Text } from "@arconnect/components";
import { useTokens } from "~tokens";
import { useMemo } from "react";
import browser from "webextension-polyfill";
import Collectible from "../Collectible";
import styled from "styled-components";
import { useLocation } from "~wallets/router/router.utils";

export default function Collectibles() {
  const { navigate } = useLocation();

  // all tokens
  const tokens = useTokens();

  // collectibles
  const collectibles = useMemo(
    () => tokens.filter((token) => token.type === "collectible"),
    [tokens]
  );

  return (
    <>
      <Heading>
        <ViewAll
          onClick={() => {
            if (collectibles.length === 0) return;
            navigate("/collectibles");
          }}
        >
          {browser.i18n.getMessage("view_all")}
          <TokenCount>({collectibles.length})</TokenCount>
        </ViewAll>
      </Heading>
      <Spacer y={1} />
      {collectibles.length === 0 && (
        <NoAssets>{browser.i18n.getMessage("no_collectibles")}</NoAssets>
      )}
      <CollectiblesList>
        {collectibles.slice(0, 6).map((collectible, i) => (
          <Collectible
            id={collectible.id}
            name={collectible.name || collectible.ticker}
            balance={collectible.balance}
            divisibility={collectible.divisibility}
            decimals={collectible.decimals}
            onClick={() => navigate(`/collectible/${collectible.id}`)}
            key={i}
          />
        ))}
      </CollectiblesList>
    </>
  );
}

const CollectiblesList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
`;

const NoAssets = styled(Text).attrs({
  noMargin: true
})`
  text-align: center;
`;
