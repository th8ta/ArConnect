import {
  Button,
  InputV2,
  Section,
  Spacer,
  Text,
  useInput,
  useToasts
} from "@arconnect/components";
import {
  permissionData,
  signPolicyOptions,
  type PermissionType
} from "~applications/permissions";
import { useCurrentAuthRequest } from "~utils/auth/auth.hooks";
import { AnimatePresence, motion } from "framer-motion";
import { unlock as globalUnlock } from "~wallets/auth";
import { useEffect, useMemo, useState } from "react";
import { InformationIcon } from "@iconicicons/react";
import { useStorage } from "@plasmohq/storage/hook";
import { ExtensionStorage } from "~utils/storage";
import { formatAddress } from "~utils/format";
import { addApp } from "~applications";
import WalletSwitcher from "~components/popup/WalletSwitcher";
import Wrapper from "~components/auth/Wrapper";
import browser from "webextension-polyfill";
import Label from "~components/auth/Label";
import App from "~components/auth/App";
import styled from "styled-components";
import { EventType, trackEvent } from "~utils/analytics";
import Application, { type SignPolicy } from "~applications/application";
import { defaultGateway } from "~gateways/gateway";
import { CheckIcon, CloseIcon } from "@iconicicons/react";
import { defaultAllowance } from "~applications/allowance";
import Arweave from "arweave";
import Permissions from "../../components/auth/Permissions";
import { HeadAuth } from "~components/HeadAuth";
import { AuthButtons } from "~components/auth/AuthButtons";
import arconnectLogo from "url:/assets/ecosystem/arconnect.svg";
import Squircle from "~components/Squircle";
import { useActiveWallet } from "~wallets/hooks";
import Checkbox from "~components/Checkbox";
import { Eye, EyeOff } from "@untitled-ui/icons-react";
import { CloseLayer } from "~components/popup/WalletHeader";

type Page = "unlock" | "connect" | "permissions" | "review" | "confirm";

export function ConnectAuthRequestView() {
  // active address
  const [activeAddress] = useStorage<string>({
    key: "active_address",
    instance: ExtensionStorage
  });

  const [signPolicy, setSignPolicy] = useState<SignPolicy>("always_ask");

  // permissions to add
  const [permissions, setPermissions] = useState<PermissionType[]>([]);

  const wallet = useActiveWallet();

  const arweave = new Arweave(defaultGateway);

  const { authRequest, acceptRequest, rejectRequest } =
    useCurrentAuthRequest("connect");

  const {
    url = "",
    permissions: authRequestPermissions = [],
    appInfo = {},
    gateway
  } = authRequest;

  // wallet switcher open
  const [switcherOpen, setSwitcherOpen] = useState(false);

  // page
  const [page, setPage] = useState<Page>("connect");

  const allowanceInput = useInput();

  // password input
  const passwordInput = useInput();

  // toasts
  const { setToast } = useToasts();

  // requested permissions
  const [requestedPermissions, setRequestedPermissions] = useState<
    PermissionType[]
  >([]);

  const [requestedPermCopy, setRequestedPermCopy] = useState<PermissionType[]>(
    []
  );

  const [showPassword, setShowPassword] = useState(false);

  const isCustomPermissions = useMemo(() => {
    if (requestedPermissions.length !== requestedPermCopy.length) return true;

    // Create sorted copies to ensure order doesn't matter
    const sortedRequested = [...requestedPermissions].sort();
    const sortedInitial = [...requestedPermCopy].sort();

    // Compare each element
    return sortedRequested.some(
      (permission, index) => permission !== sortedInitial[index]
    );
  }, [requestedPermissions, requestedPermCopy]);

  // connect
  async function connect() {
    if (!url) return;

    const unlockRes = await globalUnlock(passwordInput.state);

    if (!unlockRes) {
      passwordInput.setStatus("error");
      return setToast({
        type: "error",
        content: browser.i18n.getMessage("invalidPassword"),
        duration: 2200
      });
    }

    // get existing permissions
    const app = new Application(url);
    const isAppPresent = await app.isAppPresent();

    if (!isAppPresent) {
      // add the app
      await addApp({
        url,
        permissions,
        name: appInfo.name,
        logo: appInfo.logo,
        signPolicy,
        // alwaysAsk,
        allowance: {
          enabled: false,
          limit: "0",
          spent: "0" // in winstons
        },
        // TODO: wayfinder
        gateway: gateway || defaultGateway
      });
    } else {
      // update existing permissions, if the app
      // has already been added

      await app.updateSettings({
        signPolicy,
        permissions,
        // alwaysAsk,
        allowance: {
          enabled: false,
          limit: "0",
          spent: "0" // in winstons
        }
      });
    }

    // track connected app.
    await trackEvent(EventType.CONNECTED_APP, {
      appName: appInfo.name,
      appUrl: url
    });

    acceptRequest();
  }

  async function handleBack() {
    if (page === "review") {
      setPage("connect");
    } else if (page === "confirm") {
      setPage("review");
    } else if (page === "permissions") {
      setPage("confirm");
    }
  }

  async function handlePrimaryOnClick() {
    if (page === "connect") {
      setPage("review");
    } else if (page === "review") {
      setPage("confirm");
    } else if (page === "confirm") {
      setPage("unlock");
    } else if (page === "unlock") {
      await connect();
    }
  }

  useEffect(() => {
    (async () => {
      const requested: PermissionType[] = authRequestPermissions;

      // add existing permissions
      if (url) {
        const app = new Application(url);
        const existing = await app.getPermissions();

        for (const existingP of existing) {
          if (requested.includes(existingP)) continue;
          requested.push(existingP);
        }
      }

      setRequestedPermissions(
        requested.filter((p) => Object.keys(permissionData).includes(p))
      );

      setRequestedPermCopy(
        requested.filter((p) => Object.keys(permissionData).includes(p))
      );
    })();
  }, [url, authRequestPermissions]);

  useEffect(() => setPermissions(requestedPermissions), [requestedPermissions]);

  useEffect(() => {
    allowanceInput.setState(arweave.ar.winstonToAr(defaultAllowance.limit));
  }, []);

  const UnlockPage = () => (
    <UnlockWrapper>
      <Section
        style={{ display: "flex", flexDirection: "column", gap: "32px" }}
      >
        <div
          style={{
            textAlign: "center",
            height: "200px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end"
          }}
        >
          <AppIconsWrapper>
            <IconWrapper src={appInfo.logo} alt={appInfo.name} />
            <IconWrapper
              src={arconnectLogo}
              style={{ marginLeft: "-4px" }}
              alt="Arconnect Logo"
            />
          </AppIconsWrapper>
          <Spacer y={1} />
          <div style={{ textAlign: "center" }}>
            <ConnectToApp>
              {browser.i18n.getMessage("enter_your_password")}
            </ConnectToApp>
            <Gateway>
              {browser.i18n.getMessage("gateway")}:{" "}
              {(gateway || defaultGateway)?.host || ""}
            </Gateway>
          </div>
        </div>
        <InputV2
          type={showPassword ? "text" : "password"}
          placeholder={browser.i18n.getMessage("enter_your_password")}
          icon={
            showPassword ? (
              <EyeOff
                height={22}
                width={22}
                onClick={() => setShowPassword(false)}
              />
            ) : (
              <Eye
                height={22}
                width={22}
                onClick={() => setShowPassword(true)}
              />
            )
          }
          fullWidth
          {...passwordInput.bindings}
          autoFocus
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            connect();
          }}
        />
      </Section>
    </UnlockWrapper>
  );

  const PermissionsPage = () => (
    <Permissions
      connectAuthRequest={authRequest}
      requestedPermissions={requestedPermissions}
      update={setRequestedPermissions}
      closeEdit={() => setPage("confirm")}
    />
  );

  const ConnectPage = () => (
    <ConnectPageContent>
      <ConnectPageSection>
        <ConnectPageSectionHeader>
          <AppIconsWrapper>
            <IconWrapper src={appInfo.logo} alt={appInfo.name} />
            <IconWrapper
              src={arconnectLogo}
              style={{ marginLeft: "-4px" }}
              alt="Arconnect Logo"
            />
          </AppIconsWrapper>
          <Spacer y={1} />
          <div style={{ textAlign: "center" }}>
            <ConnectToApp>
              {browser.i18n.getMessage("connect_to_app", [appInfo.name || url])}
            </ConnectToApp>
            <Gateway>
              {browser.i18n.getMessage("gateway")}:{" "}
              {(gateway || defaultGateway)?.host || ""}
            </Gateway>
          </div>
        </ConnectPageSectionHeader>
        <div>
          <SecondaryText>
            {browser.i18n.getMessage("select_account", [appInfo.name || url])}:
          </SecondaryText>
          <Spacer y={0.5} />
          <ConnectWalletWrapper>
            <div style={{ display: "flex", flexDirection: "row", gap: "12px" }}>
              <AccountSquircle>
                <AccountInitial>
                  {wallet?.nickname?.charAt(0) || "A"}
                </AccountInitial>
              </AccountSquircle>
              <div>
                <WalletName>{wallet?.nickname}</WalletName>
                <SecondaryText>
                  {formatAddress(activeAddress || "", 4)}
                </SecondaryText>
              </div>
            </div>
            <ChangeText onClick={() => setSwitcherOpen((prev) => !prev)}>
              {browser.i18n.getMessage("change")}
            </ChangeText>
            <WalletSwitcher
              open={switcherOpen}
              close={() => setSwitcherOpen(false)}
              showOptions={false}
              exactTop={true}
              noPadding={true}
              maxHeight={180}
            />
            {switcherOpen && (
              <CloseLayer onClick={() => setSwitcherOpen(false)} />
            )}
          </ConnectWalletWrapper>
        </div>
      </ConnectPageSection>
    </ConnectPageContent>
  );

  const ReviewPage = () => (
    <ConnectPageContent>
      <Section
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        <SecondaryText fontSize={16}>
          {browser.i18n.getMessage("connect_request_1", [appInfo.name || url])}
          <PrimaryText fontSize={16}>
            {wallet?.nickname} ({formatAddress(activeAddress || "", 4)})
          </PrimaryText>
          {browser.i18n.getMessage("connect_request_2")}
        </SecondaryText>
        <SecondaryText>{url}</SecondaryText>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}
        >
          {requestedPermissions.map((permission, i) => (
            <Permission key={i}>
              <StyledCheckIcon />
              <PermissionItem>
                {browser.i18n.getMessage(
                  permissionData[permission.toUpperCase()]
                )}
              </PermissionItem>
            </Permission>
          ))}
          {requestedPermCopy
            .filter((permission) => !requestedPermissions.includes(permission))
            .map((permission, i) => (
              <Permission key={i}>
                <StyledCloseIcon />
                <PermissionItem>
                  {browser.i18n.getMessage(
                    permissionData[permission.toUpperCase()]
                  )}
                </PermissionItem>
              </Permission>
            ))}
        </div>
      </Section>
    </ConnectPageContent>
  );

  const ConfirmPage = () => (
    <ConnectPageContent>
      <Section
        style={{ display: "flex", flexDirection: "column", gap: "24px" }}
      >
        <div style={{ textAlign: "center" }}>
          <PrimaryText fontSize={20} fontWeight={600}>
            {browser.i18n.getMessage("confirm_permissions", [
              appInfo.name || url
            ])}
          </PrimaryText>
          <SecondaryText>{url}</SecondaryText>
        </div>
        <PolicyOptionContainer>
          {signPolicyOptions.map((option) => (
            <PolicyOption key={option} onClick={() => setSignPolicy(option)}>
              <Checkbox
                size={16}
                onChange={() => setSignPolicy(option)}
                checked={signPolicy === option}
              />
              <div>
                <PrimaryText fontSize={16}>
                  {browser.i18n.getMessage(option)}
                </PrimaryText>
              </div>
            </PolicyOption>
          ))}
        </PolicyOptionContainer>
        <CustomPermissionsButton onClick={() => setPage("permissions")}>
          <PrimaryText fontSize={16}>
            {browser.i18n.getMessage(
              isCustomPermissions
                ? "custom_permissions"
                : "set_custom_permissions"
            )}
          </PrimaryText>
        </CustomPermissionsButton>
        <CustomPermissionsInfo>
          <div>
            <InformationIcon height={24} width={24} />
          </div>
          <SecondaryText fontSize={14}>
            {browser.i18n.getMessage(`${signPolicy}_description`)}
          </SecondaryText>
        </CustomPermissionsInfo>
      </Section>
    </ConnectPageContent>
  );

  return (
    <Wrapper>
      <div>
        <HeadAuth
          showHead={!["connect", "unlock"].includes(page)}
          title={browser.i18n.getMessage(page)}
          back={handleBack}
          appInfo={appInfo}
        />

        {!["connect", "unlock"].includes(page) && (
          <App
            appName={appInfo.name || url}
            appUrl={url}
            showTitle={false}
            // TODO: wayfinder
            gateway={gateway || defaultGateway}
            appIcon={appInfo.logo}
          />
        )}

        <ContentWrapper style={{ flex: 1 }}>
          <AnimatePresence initial={false}>
            {page === "connect" && <ConnectPage />}
            {page === "review" && <ReviewPage />}
            {page === "confirm" && <ConfirmPage />}
            {page === "unlock" && <UnlockPage />}
            {page === "permissions" && <PermissionsPage />}
          </AnimatePresence>
        </ContentWrapper>
      </div>

      {page !== "permissions" && (
        <Section>
          <AuthButtons
            authRequest={authRequest}
            primaryButtonProps={{
              label: browser.i18n.getMessage(
                page === "unlock"
                  ? "connect"
                  : page !== "confirm"
                  ? "next"
                  : "confirm"
              ),
              onClick: handlePrimaryOnClick
            }}
            secondaryButtonProps={{
              label: browser.i18n.getMessage("cancel"),
              onClick: () => rejectRequest()
            }}
          />
        </Section>
      )}
    </Wrapper>
  );
}

const Permission = styled.div`
  margin: 0;
  align-items: center;
  display: flex;
  gap: 8px;
`;

const StyledCheckIcon = styled(CheckIcon)`
  width: 17px;
  height: 17px;
  min-width: 17px;
  min-height: 17px;
  flex-shrink: 0;
  color: rgba(20, 209, 16, 1);
`;

const StyledCloseIcon = styled(CloseIcon)`
  width: 17px;
  height: 17px;
  min-width: 17px;
  min-height: 17px;
  flex-shrink: 0;
  color: ${(props) => props.theme.fail};
`;

const PermissionItem = styled(Text)`
  color: ${(props) => props.theme.primaryTextv2};
  margin: 0;
  font-size: 14px;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
  width: max-content;
`;

const UnlockWrapper = styled(motion.div).attrs({
  exit: { opacity: 0 },
  transition: {
    type: "easeInOut",
    duration: 0.2
  }
})`
  width: 100vw;

  ${Label} {
    font-weight: 500;
  }
`;

const IconWrapper = styled.img`
  height: 48px;
  width: 48px;
  overflow: hidden;
  border-radius: 48px;
`;

const AppIconsWrapper = styled.div``;

const ConnectPageContent = styled.div`
  width: 100vw;
`;

const ConnectToApp = styled(Text).attrs({
  noMargin: true
})`
  font-size: 22px;
  font-weight: 600;
  color: ${(props) => props.theme.primaryTextv2};
`;

const Gateway = styled(Text).attrs({
  noMargin: true
})`
  color: ${(props) => props.theme.secondaryTextv2};
  font-size: 14px;
  font-weight: 500;
`;

const ConnectWalletWrapper = styled.div`
  display: flex;
  padding: 8px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  border-radius: 10px;
  background: #333;
`;

export const AccountSquircle = styled(Squircle)`
  position: relative;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  color: rgba(${(props) => props.theme.theme});
`;

export const AccountInitial = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  text-align: center;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
`;

const WalletName = styled(Text).attrs({
  noMargin: true
})`
  font-size: 18px;
  font-weight: 500;
  color: ${(props) => props.theme.primaryTextv2};
`;

const SecondaryText = styled(Text).attrs({
  noMargin: true
})<{ fontSize?: number }>`
  color: ${(props) => props.theme.secondaryTextv2};
  font-size: ${(props) => props.fontSize || 14}px;
  font-weight: 500;
`;

const PrimaryText = styled(Text).attrs({
  noMargin: true
})<{ fontSize?: number; fontWeight?: number; textAlign?: string }>`
  color: ${(props) => props.theme.primaryTextv2};
  font-size: ${(props) => props.fontSize || 14}px;
  font-weight: ${(props) => props.fontWeight || 500};
  text-align: ${(props) => props.textAlign || "left"};
`;

const ChangeText = styled(Text).attrs({
  noMargin: true
})`
  color: ${(props) => props.theme.primary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
`;

const PolicyOptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PolicyOption = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const CustomPermissionsButton = styled(Button)`
  display: flex;
  padding: 8px;
  justify-content: center;
  align-items: center;
  align-self: stretch;
  border-radius: 8px;
  background: #333;
`;

const CustomPermissionsInfo = styled.div`
  display: flex;
  padding: 12px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  align-self: stretch;
  border: 1px solid #333;
  border-radius: 8px;
`;

const ConnectPageSection = styled(Section)`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 0px;
`;

const ConnectPageSectionHeader = styled.div`
  text-align: center;
  height: 320px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
