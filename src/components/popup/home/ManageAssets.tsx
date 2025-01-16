import browser from "webextension-polyfill";
import { useLocation } from "~wallets/router/router.utils";
import SliderMenu from "~components/SliderMenu";
import {
  Button,
  Input,
  Section,
  useInput
} from "@arconnect/components-rebrand";
import Token from "~components/popup/Token";
import styled from "styled-components";
import { useAoTokens } from "~tokens/aoTokens/ao";
import { useMemo } from "react";

interface Props {
  open: boolean;
  close: () => any;
}

export function ManageAssets({ open, close }: Props) {
  const { navigate } = useLocation();
  const searchInput = useInput();

  // ao Tokens
  const { tokens: aoTokens, changeTokenVisibility } = useAoTokens({
    type: "asset"
  });

  const filteredTokens = useMemo(() => {
    if (!aoTokens) return [];
    if (!searchInput.state) return aoTokens;
    const searchValue = searchInput.state.toLowerCase();
    return aoTokens.filter((token) => {
      const ticker = token?.Ticker?.toLowerCase();
      const name = token?.Name?.toLowerCase();
      return ticker?.includes(searchValue) || name?.includes(searchValue);
    });
  }, [aoTokens, searchInput.state]);

  return (
    <SliderMenu
      hasHeader={true}
      title={browser.i18n.getMessage("manage_asset_list")}
      isOpen={open}
      onClose={close}
    >
      <Container>
        <Input
          fullWidth
          variant="search"
          placeholder="Search asset"
          {...searchInput.bindings}
        />
        <TokensList>
          {filteredTokens.map((token) => (
            <Token
              key={token.id}
              ao={true}
              type={"asset"}
              defaultLogo={token?.Logo}
              id={token.id}
              ticker={token.Ticker}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              hidden={token.hidden}
              onHideClick={(hidden) => {
                changeTokenVisibility(token.id, hidden);
              }}
              disableClickEffect
            />
          ))}
        </TokensList>
        <ManageButton
          as={Button}
          fullWidth
          // TODO: The base should be iframe.html for the extension and some domain for the iframe.
          href="#/quick-settings/tokens"
          onClick={(e) => {
            e.preventDefault();
            navigate("/quick-settings/tokens/new");
          }}
        >
          {browser.i18n.getMessage("import_assets")}
        </ManageButton>
      </Container>
    </SliderMenu>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1.5rem;
`;

const TokensList = styled(Section)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0;
`;

const ManageButton = styled.a.attrs({
  rel: "noopener noreferrer",
  target: "_blank"
})``;
