import {
  getSettings,
  loadTokenLogo,
  tokenTypeRegistry,
  type TokenState,
  type TokenType
} from "~tokens/token";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { usePrice, usePriceHistory } from "~lib/redstone";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "~utils/theme";
import { addToken, getDreForToken } from "~tokens";
import {
  ButtonV2,
  Section,
  Spacer,
  Text,
  useToasts
} from "@arconnect/components";
import PeriodPicker from "~components/popup/asset/PeriodPicker";
import PriceChart from "~components/popup/asset/PriceChart";
import { DREContract, DRENode } from "@arconnect/warp-dre";
import Thumbnail from "~components/popup/asset/Thumbnail";
import Wrapper from "~components/auth/Wrapper";
import * as viewblock from "~lib/viewblock";
import browser from "webextension-polyfill";
import Title from "~components/popup/Title";
import Head from "~components/popup/Head";
import styled from "styled-components";
import { concatGatewayURL } from "~gateways/utils";
import { findGateway, FULL_HISTORY, useGateway } from "~gateways/wayfinder";
import { useCurrentAuthRequest } from "~utils/auth/auth.hooks";
import { HeadAuth } from "~components/HeadAuth";
import { AuthButtons } from "~components/auth/AuthButtons";

export function TokenAuthRequestView() {
  const { authRequest, acceptRequest, rejectRequest } =
    useCurrentAuthRequest("token");

  const {
    url,
    tokenID,
    dre: dreRequestParam,
    tokenType: tokenTypeParam
  } = authRequest;

  // price period
  const [period, setPeriod] = useState("Day");

  // load state
  const [state, setState] = useState<TokenState>();

  useEffect(() => {
    (async () => {
      if (!tokenID) return;

      let dre = dreRequestParam;

      if (!dre) dre = await getDreForToken(tokenID);

      const contract = new DREContract(tokenID, new DRENode(dre));
      const { state } = await contract.getState<TokenState>();

      setState(state);
    })();
  }, [tokenID, dreRequestParam]);

  // token settings
  const settings = useMemo(() => getSettings(state), [state]);

  // toasts
  const { setToast } = useToasts();

  // loading
  const [loading, setLoading] = useState(false);

  // load type
  const [tokenType, setTokenType] = useState<TokenType>();

  useEffect(() => {
    (async () => {
      if (!tokenID) return;

      const gw = await findGateway({ startBlock: 0 });

      let type = tokenTypeParam;

      if (!type) {
        if (tokenTypeRegistry[tokenID]) {
          // manual override
          type = tokenTypeRegistry[tokenID];
        } else {
          // fetch data
          const data = await fetch(`${concatGatewayURL(gw)}/${tokenID}`);

          type = data.headers.get("content-type").includes("application/json")
            ? "asset"
            : "collectible";
        }
      }

      setTokenType(type);
    })();
  }, [tokenID, tokenTypeParam]);

  // add the token
  async function done() {
    if (!tokenID || !tokenType || !state) {
      return;
    }

    setLoading(true);

    try {
      // add the token
      await addToken(tokenID, tokenType, dreRequestParam);

      acceptRequest();
    } catch (e) {
      console.log("Failed to add token", e);

      setToast({
        type: "error",
        content: browser.i18n.getMessage("token_add_failure"),
        duration: 2200
      });
    }

    setLoading(false);
  }

  // token price
  const { price } = usePrice(state?.ticker);

  // token historical prices
  const { prices: historicalPrices, loading: loadingHistoricalPrices } =
    usePriceHistory(period, state?.ticker);

  // display theme
  const theme = useTheme();

  // token logo
  const [logo, setLogo] = useState<string>();

  useEffect(() => {
    (async () => {
      if (!tokenID) return;

      setLogo(viewblock.getTokenLogo(tokenID));

      if (!state) return;

      const settings = getSettings(state);

      setLogo(
        await loadTokenLogo(tokenID, settings.get("communityLogo"), theme)
      );
    })();
  }, [tokenID, state, theme]);

  // listen for enter to add
  useEffect(() => {
    const listener = async (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;

      await done();
    };

    window.addEventListener("keydown", listener);

    return () => window.removeEventListener("keydown", listener);
  }, [done]);

  const gateway = useGateway(FULL_HISTORY);

  return (
    <Wrapper>
      <div>
        <HeadAuth title={browser.i18n.getMessage("addToken")} />
        <Spacer y={0.75} />
        <Section>
          <Text noMargin>
            {browser.i18n.getMessage("addTokenParagraph", url)}
          </Text>
        </Section>
        <AnimatePresence>
          {state && tokenType && (
            <motion.div
              variants={chartAnimation}
              initial="hidden"
              animate="shown"
              exit="hidden"
            >
              {(tokenType === "asset" && (
                <PriceChart
                  token={{
                    name: state.name || state.ticker || "",
                    ticker: state.ticker || "",
                    logo
                  }}
                  priceData={historicalPrices}
                  latestPrice={+price}
                  loading={loadingHistoricalPrices}
                >
                  <PeriodPicker
                    period={period}
                    onChange={(p) => setPeriod(p)}
                  />
                </PriceChart>
              )) || (
                <>
                  <Thumbnail src={`${concatGatewayURL(gateway)}/${tokenID}`} />
                  <Section>
                    <TokenName noMargin>
                      {state.name || state.ticker}{" "}
                      {state.name && (
                        <Ticker>({state.ticker.toUpperCase()})</Ticker>
                      )}
                    </TokenName>
                    <Spacer y={0.7} />
                    <Description>
                      {(settings && settings.get("communityDescription")) ||
                        state.description ||
                        browser.i18n.getMessage("no_description")}
                    </Description>
                  </Section>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Section>
        <AuthButtons
          authRequest={authRequest}
          primaryButtonProps={{
            label: browser.i18n.getMessage("addToken"),
            loading,
            onClick: done
          }}
          secondaryButtonProps={{
            label: browser.i18n.getMessage("cancel"),
            onClick: () => rejectRequest()
          }}
        />
      </Section>
    </Wrapper>
  );
}

const chartAnimation: Variants = {
  hidden: { opacity: 0 },
  shown: { opacity: 1 }
};

const TokenName = styled(Title)`
  display: flex;
  gap: 0.3rem;
`;

const Ticker = styled.span`
  color: rgb(${(props) => props.theme.secondaryText});
`;

const Description = styled(Text).attrs({
  noMargin: true
})`
  font-size: 0.98rem;
  text-align: justify;
`;
