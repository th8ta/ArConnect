import { concatGatewayURL } from "~gateways/utils";
import { ButtonV2, Spacer, useInput } from "@arconnect/components";
import { useEffect, useState } from "react";
import { useStorage } from "~utils/storage";
import { ExtensionStorage } from "~utils/storage";
import type { StoredWallet } from "~wallets";
import { Reorder } from "framer-motion";
import browser from "webextension-polyfill";
import styled from "styled-components";
import { FULL_HISTORY, useGateway } from "~gateways/wayfinder";
import WalletListItem from "~components/dashboard/list/WalletListItem";
import SearchInput from "~components/dashboard/SearchInput";
import HeadV2 from "~components/popup/HeadV2";
import { useLocation } from "~wallets/router/router.utils";
import { getNameServiceProfiles } from "~lib/nameservice";
import type { NameServiceProfile } from "~lib/types";

export function WalletsView() {
  const { navigate } = useLocation();

  // wallets
  const [wallets, setWallets] = useStorage<StoredWallet[]>(
    {
      key: "wallets",
      instance: ExtensionStorage
    },
    []
  );

  // ans data
  const [nameServiceProfiles, setNameServiceProfiles] = useState<
    NameServiceProfile[]
  >([]);

  useEffect(() => {
    (async () => {
      if (!wallets) return;

      // fetch profiles
      const profiles = await getNameServiceProfiles(
        wallets.map((w) => w.address)
      );

      setNameServiceProfiles(profiles);
    })();
  }, [wallets]);

  // ans shortcuts
  const findProfile = (address: string) =>
    nameServiceProfiles.find((profile) => profile.address === address);

  const gateway = useGateway(FULL_HISTORY);

  function findAvatar(address: string) {
    return findProfile(address)?.logo;
  }

  function findLabel(address: string) {
    return findProfile(address)?.name;
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
      <HeadV2
        title={browser.i18n.getMessage("setting_wallets")}
        back={() => navigate("/quick-settings")}
      />
      <Wrapper>
        <div style={{ height: "100%" }}>
          <SearchInput
            small
            placeholder={browser.i18n.getMessage("search_wallets")}
            {...searchInput.bindings}
          />
          <Spacer y={1} />
          {wallets && (
            <WalletsWrapper>
              <Reorder.Group
                as="div"
                axis="y"
                onReorder={setWallets}
                values={wallets}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem"
                }}
              >
                {wallets.filter(filterSearchResults).map((wallet) => (
                  <WalletListItem
                    small={true}
                    wallet={wallet}
                    name={findLabel(wallet.address) || wallet.nickname}
                    address={wallet.address}
                    avatar={findAvatar(wallet.address)}
                    active={false}
                    onClick={() =>
                      navigate(`/quick-settings/wallets/${wallet.address}`)
                    }
                    key={wallet.address}
                  />
                ))}
              </Reorder.Group>
            </WalletsWrapper>
          )}
        </div>

        <ActionBar>
          <ButtonV2
            fullWidth
            onClick={() =>
              browser.tabs.create({
                url: browser.runtime.getURL("tabs/dashboard.html#/wallets/new")
              })
            }
          >
            {browser.i18n.getMessage("add_wallet")}
          </ButtonV2>
        </ActionBar>
      </Wrapper>
    </>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0 1rem;
  height: calc(100vh - 10px);
`;

const WalletsWrapper = styled.div`
  max-height: 80vh;
  overflow-y: auto;
  padding: 0;

  /* Hide Scrollbar */
  scrollbar-width: none; /* For Firefox */
  -ms-overflow-style: none; /* For Internet Explorer and Edge */
  &::-webkit-scrollbar {
    display: none; /* For Chrome, Safari, and Opera */
  }
`;

const ActionBar = styled.div`
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  background-color: rgb(${(props) => props.theme.background});
`;
