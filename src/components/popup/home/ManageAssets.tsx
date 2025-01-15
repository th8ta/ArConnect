import browser from "webextension-polyfill";
import { useLocation } from "~wallets/router/router.utils";
import SliderMenu from "~components/SliderMenu";
import { Button, Section, Spacer } from "@arconnect/components-rebrand";
import Token from "~components/popup/Token";
import styled from "styled-components";
import { useAoTokens } from "~tokens/aoTokens/ao";

interface Props {
  open: boolean;
  close: () => any;
}

export function ManageAssets({ open, close }: Props) {
  const { navigate } = useLocation();

  // ao Tokens
  const [aoTokens] = useAoTokens({ type: "asset" });

  function handleTokenClick(tokenId: string) {
    navigate(`/send/transfer/${tokenId}`);
  }

  return (
    <SliderMenu
      hasHeader={true}
      title={browser.i18n.getMessage("manage_asset_list")}
      isOpen={open}
      onClose={close}
    >
      <Container>
        <TokensList>
          {aoTokens.map((token) => (
            <Token
              key={token.id}
              ao={true}
              type={"asset"}
              defaultLogo={token?.Logo}
              id={token.id}
              ticker={token.type === "collectible" ? token.Name : token.Ticker}
              balance={token.balance || "0"}
              onClick={(e) => {
                e.preventDefault();
                handleTokenClick(token.id);
              }}
            />
          ))}
        </TokensList>
        <Spacer y={1.5} />
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
