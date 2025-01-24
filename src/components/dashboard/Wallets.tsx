import { concatGatewayURL } from "~gateways/utils";
import { ButtonV2, Spacer, useInput } from "@arconnect/components";
import { useEffect, useMemo, useState } from "react";
import { useStorage } from "~utils/storage";
import { type AnsUser, getAnsProfile } from "~lib/ans";
import { ExtensionStorage } from "~utils/storage";
import { useRoute } from "wouter";
import type { StoredWallet } from "~wallets";
import { Reorder } from "framer-motion";
import WalletListItem from "./list/WalletListItem";
import browser from "webextension-polyfill";
import SearchInput from "./SearchInput";
import styled from "styled-components";
import { FULL_HISTORY, useGateway } from "~gateways/wayfinder";
import { useLocation } from "~wallets/router/router.utils";

export function WalletsDashboardView() {
  const { navigate } = useLocation();
  // TODO: Replace with useParams:
  const [matches, params] = useRoute<{ address?: string }>(
    "/wallets/:address?"
  );

  // wallets
  const [wallets, setWallets] = useStorage<StoredWallet[]>(
    {
      key: "wallets",
      instance: ExtensionStorage
    },
    []
  );

  // active subsetting val
  const activeWalletSetting = useMemo(
    () => (params?.address ? params.address : undefined),
    [params]
  );

  useEffect(() => {
    if (!matches) return;

    const firstWallet = wallets?.[0];

    // return if there is a wallet present in params
    if (
      !firstWallet ||
      (!!activeWalletSetting &&
        !!wallets.find((w) => w.address == activeWalletSetting))
    ) {
      return;
    }

    // return if the new wallet page is open
    if (activeWalletSetting === "new") return;

    navigate(`/wallets/${firstWallet.address}`);
  }, [wallets, activeWalletSetting]);

  // ans data
  const [ansProfiles, setAnsProfiles] = useState<AnsUser[]>([]);

  useEffect(() => {
    (async () => {
      if (!wallets) return;

      // fetch profiles
      const profiles = await getAnsProfile(wallets.map((w) => w.address));

      setAnsProfiles(profiles as AnsUser[]);
    })();
  }, [wallets]);

  // ans shortcuts
  const findProfile = (address: string) =>
    ansProfiles.find((profile) => profile.user === address);

  const gateway = useGateway(FULL_HISTORY);

  function findAvatar(address: string) {
    const avatar = findProfile(address)?.avatar;
    const gatewayUrl = concatGatewayURL(gateway);

    if (!avatar) return undefined;
    return gatewayUrl + "/" + avatar;
  }

  function findLabel(address: string) {
    const label = findProfile(address)?.currentLabel;

    if (!label) return undefined;
    return label + ".ar";
  }

  // search
  const searchInput = useInput();

  // search filter function
  function filterSearchResults(wallet: StoredWallet) {
    const query = searchInput.state;

    if (query === "" || !query) {
      return true;
    }

    return (
      wallet.address.toLowerCase().includes(query.toLowerCase()) ||
      wallet.nickname.toLowerCase().includes(query.toLowerCase()) ||
      findLabel(wallet.address)?.includes(query.toLowerCase())
    );
  }

  return (
    <>
      <Wrapper>
        <SearchWrapper>
          <SearchInput
            placeholder={browser.i18n.getMessage("search_wallets")}
            {...searchInput.bindings}
          />
          <AddWalletButton onClick={() => navigate("/wallets/new")}>
            {browser.i18n.getMessage("add_wallet")}
          </AddWalletButton>
        </SearchWrapper>
        <Spacer y={1} />
        {wallets && (
          <Reorder.Group
            as="div"
            axis="y"
            onReorder={setWallets}
            values={wallets}
            style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}
          >
            {wallets.filter(filterSearchResults).map((wallet) => (
              <WalletListItem
                wallet={wallet}
                name={findLabel(wallet.address) || wallet.nickname}
                address={wallet.address}
                avatar={findAvatar(wallet.address)}
                active={activeWalletSetting === wallet.address}
                onClick={() => navigate(`/wallets/${wallet.address}`)}
                key={wallet.address}
              />
            ))}
          </Reorder.Group>
        )}
      </Wrapper>
    </>
  );
}

const Wrapper = styled.div`
  position: relative;
`;

const SearchWrapper = styled.div`
  position: sticky;
  display: grid;
  gap: 8px;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  grid-template-columns: auto auto;
  background-color: rgb(${(props) => props.theme.cardBackground});
`;

const AddWalletButton = styled(ButtonV2).attrs({
  secondary: false
})`
  width: 100%;
  height: 100%;
`;
