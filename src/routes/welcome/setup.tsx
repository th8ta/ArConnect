import { AnimatePresence, type Variants, motion } from "framer-motion";
import { createContext, useCallback, useEffect, useState } from "react";
import { Card, Spacer, useToasts } from "@arconnect/components";
import { Text } from "@arconnect/components-rebrand";
import type { JWKInterface } from "arweave/web/lib/wallet";
import { jwkFromMnemonic } from "~wallets/generator";
import browser from "webextension-polyfill";
import * as bip39 from "bip39-web-crypto";
import styled from "styled-components";
import Arweave from "arweave";
import { defaultGateway } from "~gateways/gateway";
import Pagination from "~components/Pagination";
import { getWalletKeyLength } from "~wallets";
import { useLocation } from "~wallets/router/router.utils";
import type { CommonRouteProps } from "~wallets/router/router.types";
import WanderIcon from "url:assets/icon.svg";
import WanderTextIcon from "url:assets/icon-text.svg";

// Shared:
import { PasswordWelcomeView } from "./load/password";
import { ThemeWelcomeView } from "./load/theme";

// Generate:
import { CreateAccountView } from "./generate/account";
import { BackupWelcomeView } from "./generate/backup";
import { ConfirmWelcomeView } from "./generate/confirm";
import { GenerateDoneWelcomeView } from "./generate/done";

// Load:
import { WalletsWelcomeView } from "./load/wallets";
import { LoadDoneWelcomeView } from "./load/done";
import { Redirect } from "~wallets/router/components/redirect/Redirect";
import StarIcons from "~components/welcome/StarIcons";
import { ArrowNarrowLeft } from "@untitled-ui/icons-react";
// Wallet generate pages:

// TODO: Use a nested router instead:
const ViewsBySetupMode = {
  generate: [
    CreateAccountView,
    PasswordWelcomeView,
    BackupWelcomeView,
    ConfirmWelcomeView,
    ThemeWelcomeView,
    GenerateDoneWelcomeView
  ],
  load: [
    PasswordWelcomeView,
    WalletsWelcomeView,
    ThemeWelcomeView,
    LoadDoneWelcomeView
  ]
} as const;

const VIEW_TITLES_BY_SETUP_MODE = {
  generate: "create_a_new_account",
  load: "import_an_account"
} as const;

const VIEW_SUBTITLES_BY_SETUP_MODE = {
  generate: [
    "name_your_account",
    "backup_your_account",
    "confirm_your_recovery_phrase",
    "create_a_password"
  ],
  load: []
};
export type WelcomeSetupMode = "generate" | "load";

export interface SetupWelcomeViewParams {
  setupMode: WelcomeSetupMode;
  page: string;
}

export type SetupWelcomeViewProps = CommonRouteProps<SetupWelcomeViewParams>;

export function SetupWelcomeView({ params }: SetupWelcomeViewProps) {
  const { navigate } = useLocation();
  const { setupMode, page: pageParam } = params;
  const page = Number(pageParam);

  const pageTitle = VIEW_TITLES_BY_SETUP_MODE[setupMode];
  const pageSubtitle = VIEW_SUBTITLES_BY_SETUP_MODE[setupMode][page - 1];
  const pageCount = ViewsBySetupMode[setupMode].length;

  // temporarily stored password
  const [password, setPassword] = useState("");

  // toasts
  const { setToast } = useToasts();

  // generate wallet in the background
  const [generatedWallet, setGeneratedWallet] = useState<GeneratedWallet>({});

  const navigateToPreviousPage = () => {
    if (page === 1) {
      navigate("/");
    } else {
      navigate(`/${setupMode}/${page - 1}`);
    }
  };

  async function generateWallet() {
    // only generate wallet if the
    // setup mode is wallet generation
    if (setupMode !== "generate" || generatedWallet.address) return;

    // prevent user from closing the window
    // while ArConnect is generating a wallet
    window.onbeforeunload = () =>
      browser.i18n.getMessage("close_tab_generate_wallet_message");

    try {
      const arweave = new Arweave(defaultGateway);

      // generate seed
      const seed = await bip39.generateMnemonic();

      setGeneratedWallet({ mnemonic: seed });

      // generate wallet from seedphrase
      let generatedKeyfile = await jwkFromMnemonic(seed);

      let { actualLength, expectedLength } = await getWalletKeyLength(
        generatedKeyfile
      );
      while (expectedLength !== actualLength) {
        generatedKeyfile = await jwkFromMnemonic(seed);
        ({ actualLength, expectedLength } = await getWalletKeyLength(
          generatedKeyfile
        ));
      }

      setGeneratedWallet((val) => ({ ...val, jwk: generatedKeyfile }));

      // get address
      const address = await arweave.wallets.jwkToAddress(generatedKeyfile);

      setGeneratedWallet((val) => ({ ...val, address }));

      return generatedWallet;
    } catch (e) {
      console.log("Error generating wallet", e);
      setToast({
        type: "error",
        content: browser.i18n.getMessage("error_generating_wallet"),
        duration: 2300
      });
    }

    return {};
  }

  function setAccountName(name: string) {
    setGeneratedWallet((val) => ({ ...val, nickname: name }));
  }

  useEffect(() => {
    generateWallet();
  }, [setupMode]);

  // animate content sice
  const [contentSize, setContentSize] = useState<number>(0);

  const contentRef = useCallback<(el: HTMLDivElement) => void>((el) => {
    if (!el) return;

    const obs = new ResizeObserver(() => {
      if (!el || el.clientHeight <= 0) return;
      setContentSize(el.clientHeight);
    });

    obs.observe(el);
  }, []);

  if (
    isNaN(page) ||
    page < 1 ||
    page > pageCount
    // || (page !== 1 && password === "")
  ) {
    return <Redirect to={`/${setupMode}/1`} />;
  }

  if (setupMode !== "generate" && setupMode !== "load") {
    return <Redirect to="/" />;
  }

  const CurrentView = ViewsBySetupMode[setupMode][page - 1];

  return (
    <Wrapper>
      <Header>
        <HeaderIconWrapper>
          <Image
            width="57.61px"
            height="27px"
            src={WanderIcon}
            alt="Wander Icon"
          />
          <Image
            width="116.759px"
            height="24.111px"
            src={WanderTextIcon}
            alt="Wander Text Icon"
          />
        </HeaderIconWrapper>
        <Text variant="secondary" size="base" weight="medium">
          {browser.i18n.getMessage("need_help")}
        </Text>
      </Header>
      <StarIcons screen="setup" />
      <Spacer y={2} />
      <SetupCard>
        <HeaderContainer>
          <CardHeader>
            <BackButton onClick={navigateToPreviousPage} />
            <Text style={{ fontSize: 22, margin: "auto" }} weight="bold">
              {browser.i18n.getMessage(pageTitle)}
            </Text>
            <Spacer x={1.75} />
          </CardHeader>
          <PaginationContainer>
            <Pagination
              currentPage={page}
              totalPages={pageCount}
              subtitle={pageSubtitle}
            />
          </PaginationContainer>
        </HeaderContainer>
        <PasswordContext.Provider value={{ password, setPassword }}>
          <WalletContext.Provider
            value={{ wallet: generatedWallet, generateWallet, setAccountName }}
          >
            <Content>
              <PageWrapper style={{ height: contentSize }}>
                <AnimatePresence initial={false}>
                  <Page key={page} ref={contentRef}>
                    <CurrentView params={params} />
                  </Page>
                </AnimatePresence>
              </PageWrapper>
            </Content>
          </WalletContext.Provider>
        </PasswordContext.Provider>
      </SetupCard>
      <Spacer y={2} />
    </Wrapper>
  );
}

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 64px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
`;

const HeaderIconWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 9.65px;
`;

const Content = styled.div`
  overflow: hidden;
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const PageWrapper = styled.div`
  position: relative;
  transition: height 0.17s ease;
  height: 100%;
  display: flex;
  flex: 1;
`;

const pageAnimation: Variants = {
  init: {
    opacity: 1
  },
  exit: {
    opacity: 0
  }
};

const Page = styled(motion.div).attrs({
  variants: pageAnimation,
  initial: "exit",
  animate: "init"
})`
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5em;
`;

const BackButton = styled(ArrowNarrowLeft)<{ hidden?: boolean }>`
  font-size: 1.6rem;
  display: ${(props) => props.hidden && "none"}
  width: 1.5em;
  height: 1.5em;
  color: ${(props) => props.theme.secondaryText};
  z-index: 2;

  &:hover {
    cursor: pointer;
  }

  path {
    stroke-width: 1.75 !important;
  }
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  min-height: 100vh;
  flex-direction: column;
  position: relative;
  background: radial-gradient(50% 50% at 50% 50%, #26126f 0%, #1c1c1d 86.5%);
`;

const Image = styled.img``;

const SetupCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  background: #121212;
  width: 377.5px;
  height: 600px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
`;

export const PasswordContext = createContext({
  setPassword: (password: string) => {},
  password: ""
});

export const WalletContext = createContext<WalletContextValue>({
  wallet: {},
  generateWallet: (retry?: boolean) => Promise.resolve({}),
  setAccountName: (name: string) => {}
});

interface WalletContextValue {
  wallet: GeneratedWallet;
  generateWallet: (retry?: boolean) => Promise<GeneratedWallet>;
  setAccountName: (name: string) => void;
}

interface GeneratedWallet {
  address?: string;
  mnemonic?: string;
  jwk?: JWKInterface;
  nickname?: string;
}
