import { useLocation } from "~wallets/router/router.utils";
import { Section } from "@arconnect/components";
import { useTokens } from "~tokens";
import { useMemo } from "react";
import Collectible from "~components/popup/Collectible";
import browser from "webextension-polyfill";
import styled from "styled-components";
import HeadV2 from "~components/popup/HeadV2";

export function CollectiblesView() {
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
      <HeadV2 title={browser.i18n.getMessage("collectibles")} />
      <CollectiblesList>
        {collectibles.map((collectible, i) => (
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

const CollectiblesList = styled(Section)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
`;
