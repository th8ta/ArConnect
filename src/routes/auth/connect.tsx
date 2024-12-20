import {
  Card,
  InputV2,
  LabelV2,
  Section,
  Spacer,
  Text,
  TooltipV2,
  useInput,
  useToasts
} from "@arconnect/components";
import { permissionData, type PermissionType } from "~applications/permissions";
import { useCurrentAuthRequest } from "~utils/auth/auth.hooks";
import { CloseLayer } from "~components/popup/WalletHeader";
import { AnimatePresence, motion } from "framer-motion";
import { unlock as globalUnlock } from "~wallets/auth";
import { useEffect, useMemo, useState } from "react";
import { ChevronDownIcon } from "@iconicicons/react";
import { useStorage } from "~utils/storage";
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
import Application from "~applications/application";
import { defaultGateway } from "~gateways/gateway";
import { CheckIcon, CloseIcon } from "@iconicicons/react";
import {
  InfoCircle,
  ToggleSwitch
} from "~routes/popup/subscriptions/subscriptionDetails";
import { defaultAllowance } from "~applications/allowance";
import Arweave from "arweave";
import Permissions from "../../components/auth/Permissions";
import { Flex } from "~routes/popup/settings/apps/[url]";
import { HeadAuth } from "~components/HeadAuth";
import { AuthButtons } from "~components/auth/AuthButtons";
import type { CommonRouteProps } from "~wallets/router/router.types";

export function ConnectAuthRequestView() {
  // active address
  const [activeAddress] = useStorage<string>({
    key: "active_address",
    instance: ExtensionStorage
  });

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
  const [page, setPage] = useState<"unlock" | "permissions">("unlock");

  const allowanceInput = useInput();

  // requested permissions
  const [requestedPermissions, setRequestedPermissions] = useState<
    PermissionType[]
  >([]);

  const [requestedPermCopy, setRequestedPermCopy] = useState<PermissionType[]>(
    []
  );

  // allowance for permissions
  const [allowanceEnabled, setAllowanceEnabled] = useState(true);

  // state management for edit
  const [edit, setEdit] = useState(false);

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

  // permissions to add
  const [permissions, setPermissions] = useState<PermissionType[]>([]);

  useEffect(() => setPermissions(requestedPermissions), [requestedPermissions]);

  // password input
  const passwordInput = useInput();

  // toasts
  const { setToast } = useToasts();

  // unlock
  async function unlock() {
    const unlockRes = await globalUnlock(passwordInput.state);

    if (!unlockRes) {
      passwordInput.setStatus("error");
      return setToast({
        type: "error",
        content: browser.i18n.getMessage("invalidPassword"),
        duration: 2200
      });
    }

    setPage("permissions");

    // listen for enter to connect
    window.addEventListener("keydown", async (e) => {
      if (e.key !== "Enter") return;
      await connect();
    });
  }

  // connect
  async function connect(alwaysAsk: boolean = false) {
    if (!url) return;

    if (
      allowanceEnabled &&
      Number(allowanceInput.state) < 0.001 &&
      !alwaysAsk
    ) {
      return setToast({
        type: "error",
        content: browser.i18n.getMessage("invalid_qty_error"),
        duration: 2200
      });
    }

    // get existing permissions
    const app = new Application(url);
    const existingPermissions = await app.getPermissions();

    if (existingPermissions.length === 0) {
      // add the app
      await addApp({
        url,
        permissions,
        name: appInfo.name,
        logo: appInfo.logo,
        // alwaysAsk,
        allowance: {
          enabled: alwaysAsk || allowanceEnabled,
          limit: alwaysAsk // if it's always ask set the limit to 0
            ? "0"
            : allowanceEnabled
            ? arweave.ar.arToWinston(allowanceInput.state) // If allowance is enabled and a new limit is set, use the new limit
            : Number.MAX_SAFE_INTEGER.toString(), // If allowance is disabled set it to max number
          spent: "0" // in winstons
        },
        // TODO: wayfinder
        gateway: gateway || defaultGateway
      });
    } else {
      // update existing permissions, if the app
      // has already been added

      const allowance = await app.getAllowance();

      await app.updateSettings({
        permissions,
        // alwaysAsk,
        allowance: {
          enabled: alwaysAsk ?? allowanceEnabled,
          limit: alwaysAsk // if it's always ask set the limit to 0
            ? "0"
            : allowanceEnabled
            ? arweave.ar.arToWinston(allowanceInput.state) // If allowance is enabled and a new limit is set, use the new limit
            : Number.MAX_SAFE_INTEGER.toString(), // If allowance is disabled set it to max number
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

  useEffect(() => {
    allowanceInput.setState(arweave.ar.winstonToAr(defaultAllowance.limit));
  }, []);

  const removedPermissions = useMemo(() => {
    return requestedPermCopy.filter(
      (permission) => !requestedPermissions.includes(permission)
    );
  }, [requestedPermCopy, requestedPermissions]);

  return (
    <Wrapper>
      <div>
        <HeadAuth
          title={!edit ? browser.i18n.getMessage("sign_in") : "Permissions"}
          back={edit ? () => setEdit(false) : undefined}
          appInfo={appInfo}
        />

        <App
          appName={appInfo.name || url}
          appUrl={url}
          showTitle={false}
          // TODO: wayfinder
          gateway={gateway || defaultGateway}
          appIcon={appInfo.logo}
        />

        <ContentWrapper>
          <AnimatePresence initial={false}>
            {page === "unlock" && (
              <UnlockWrapper>
                <Section>
                  <LabelV2>{browser.i18n.getMessage("wallet")}</LabelV2>
                  <Spacer y={0.4} />
                  <WalletSelectWrapper>
                    <WalletSelect
                      onClick={() => setSwitcherOpen(true)}
                      open={switcherOpen}
                    >
                      <Address>
                        {formatAddress(activeAddress || "", 10)}
                      </Address>
                      <SelectIcon />
                    </WalletSelect>
                    {switcherOpen && (
                      <CloseLayer onClick={() => setSwitcherOpen(false)} />
                    )}
                    <WalletSwitcher
                      open={switcherOpen}
                      close={() => setSwitcherOpen(false)}
                      showOptions={false}
                      exactTop={true}
                      noPadding={true}
                    />
                  </WalletSelectWrapper>
                  <Spacer y={1} />
                  <InputV2
                    type="password"
                    placeholder={browser.i18n.getMessage("enter_your_password")}
                    label={browser.i18n.getMessage("password")}
                    fullWidth
                    {...passwordInput.bindings}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key !== "Enter") return;
                      unlock();
                    }}
                  />
                </Section>
              </UnlockWrapper>
            )}

            {page === "permissions" && (
              <>
                {!edit ? (
                  <PermissionsContent>
                    <Section>
                      <Description>
                        {browser.i18n.getMessage(
                          "allow_these_permissions",
                          appInfo.name || url
                        )}
                      </Description>
                      <Url>{url}</Url>
                      <StyledPermissions>
                        <PermissionsTitle>
                          <Description>
                            {browser.i18n.getMessage("app_permissions")}
                          </Description>
                          <Description
                            alt
                            onClick={() => {
                              setEdit(!edit);
                            }}
                          >
                            {browser.i18n.getMessage("edit_permissions")}
                          </Description>
                        </PermissionsTitle>
                      </StyledPermissions>
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
                        .filter(
                          (permission) =>
                            !requestedPermissions.includes(permission)
                        )
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

                      <AllowanceSection>
                        <Flex
                          alignItems="center"
                          justifyContent="space-between"
                          style={{ gap: "4px" }}
                        >
                          <div>{browser.i18n.getMessage("allowance")}</div>
                          <TooltipV2 content={InfoText} position="right">
                            <InfoCircle />
                          </TooltipV2>
                        </Flex>

                        <ToggleSwitch
                          checked={allowanceEnabled}
                          setChecked={setAllowanceEnabled}
                        />
                      </AllowanceSection>
                      {allowanceEnabled && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <AllowanceInput
                            label={browser.i18n.getMessage("limit")}
                            fullWidth
                            small
                            icon={<>AR</>}
                            type="number"
                            {...allowanceInput.bindings}
                          />
                        </motion.div>
                      )}
                    </Section>
                  </PermissionsContent>
                ) : (
                  <Permissions
                    connectAuthRequest={authRequest}
                    requestedPermissions={requestedPermissions}
                    update={setRequestedPermissions}
                    closeEdit={setEdit}
                  />
                )}
              </>
            )}
          </AnimatePresence>
        </ContentWrapper>
      </div>

      {!edit && (
        <Section>
          <AuthButtons
            authRequest={authRequest}
            primaryButtonProps={{
              label: browser.i18n.getMessage(
                page === "unlock"
                  ? "sign_in"
                  : removedPermissions.length > 0
                  ? "allow_selected_permissions"
                  : "always_allow"
              ),
              onClick: async () => {
                if (page === "unlock") {
                  await unlock();
                } else {
                  await connect();
                }
              }
            }}
            secondaryButtonProps={{
              label: browser.i18n.getMessage(
                page === "unlock" ? "cancel" : "always_ask_permission"
              ),
              onClick: () =>
                page === "unlock" ? rejectRequest() : connect(true)
            }}
          />
        </Section>
      )}
    </Wrapper>
  );
}

const InfoText: React.ReactNode = (
  <div style={{ fontSize: "10px", lineHeight: "14px", textAlign: "center" }}>
    Set the amount you want <br />
    ArConnect to automatically transfer
  </div>
);

const WalletSelectWrapper = styled.div`
  position: relative;
`;

const StyledPermissions = styled.div`
  padding-bottom: 1rem;
`;

const Permission = styled.div`
  margin: 0;
  align-items: center;
  display: flex;
  gap: 8px;
`;

const PermissionsTitle = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

const SelectIcon = styled(ChevronDownIcon)`
  font-size: 1rem;
  width: 1.375rem;
  height: 1.375 rem;
  color: ${(props) => props.theme.primaryTextv2};
  transition: all 0.23s ease-in-out;
`;

const Description = styled(Text)<{ alt?: boolean }>`
  color: ${(props) =>
    props.alt ? `rgb(${props.theme.theme})` : props.theme.primaryTextv2};
  margin-bottom: 4px;
  ${(props) =>
    props.alt &&
    `
    cursor: pointer;
  `}
`;
const Url = styled(Text)`
  color: ${(props) => props.theme.secondaryTextv2};
  font-size: 12px;
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

const AllowanceInput = styled(InputV2)`
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const PermissionItem = styled(Text)`
  color: ${(props) => props.theme.primaryTextv2};
  margin: 0;
  font-size: 14px;
`;

const AllowanceSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-top: 18px;
  div {
    color: ${(props) => props.theme.primaryTextv2};
    font-size: 18px;
    font-weight: 00;
  }
`;

const WalletSelect = styled(Card)<{ open: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  background-color: transparent;
  padding: 0.844rem 0.9375rem;
  border: 1.5px solid ${(props) => props.theme.inputField};
  border-radius: 10px;
  transition: all 0.23s ease-in-out;

  ${SelectIcon} {
    transform: ${(props) => (props.open ? "rotate(180deg)" : "rotate(0)")};
  }

  &:focus-within,
  &: hover {
    ${(props) => "border: 1.5px solid " + props.theme.primaryTextv2};
  }

  &:active {
    border-color: ${(props) => props.theme.inputField};
    color: rgb(${(props) => props.theme.theme});
  }
`;

const Address = styled(Text).attrs({
  noMargin: true,
  title: false
})`
  font-size: 16px;
  line-height: 22px;
  font-weight: 500;
  color: ${(props) => props.theme.primaryTextv2};
`;

const ContentWrapper = styled.div`
  display: flex;
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

const PermissionsContent = styled(motion.div).attrs({
  initial: {
    opacity: 0,
    y: 50
  },
  animate: {
    opacity: 1,
    y: 0
  },
  transition: {
    type: "easeInOut",
    duration: 0.2
  }
})`
  width: 100vw;
`;
