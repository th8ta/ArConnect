import browser from "webextension-polyfill";
import styled, { useTheme } from "styled-components";
import type { CommonRouteProps } from "~wallets/router/router.types";
import { useLocation } from "~wallets/router/router.utils";
import { quickSettingsMenuItems } from "~routes/dashboard/dashboard.constants";
import { SettingListItem } from "~components/popup/list/SettingListItem";
import type { PopupRoutePath } from "~wallets/router/popup/popup.routes";
import {
  Button,
  ListItem,
  ListItemIcon,
  Section,
  Spacer,
  Text
} from "@arconnect/components-rebrand";
import { useActiveWallet } from "~wallets/hooks";
import { formatAddress } from "~utils/format";
import { Users01 } from "@untitled-ui/icons-react";
import { HorizontalLine } from "~components/HorizontalLine";
import SliderMenu from "~components/SliderMenu";
import { useEffect, useState } from "react";
import WanderIcon from "url:assets/icon.svg";
import { removeDecryptionKey } from "~wallets/auth";
import Online from "~components/Online";
import type { StoredWallet } from "~wallets";
import { useStorage } from "@plasmohq/storage/hook";
import { ExtensionStorage } from "~utils/storage";
import { svgie } from "~utils/svgies";

export interface QuickSettingsViewParams {
  setting?: string;
  subsetting?: string;
}

export type QuickSettingsViewProps = CommonRouteProps<QuickSettingsViewParams>;

export function MenuView({ params }: QuickSettingsViewProps) {
  const { navigate } = useLocation();
  const activeSetting = params.setting;

  const theme = useTheme();
  const wallet = useActiveWallet();
  const [open, setOpen] = useState(false);
  const [avatar, setAvatar] = useState("");

  const [wallets] = useStorage<StoredWallet[]>(
    {
      key: "wallets",
      instance: ExtensionStorage
    },
    []
  );

  useEffect(() => {
    if (!wallet?.address) return;

    setAvatar(svgie(wallet.address, { asDataURI: true }));
  }, [wallet]);

  return (
    <Section style={{ paddingBottom: 100 }}>
      <ListItem
        height={56}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {wallet?.nickname}
            <Online />
          </div>
        }
        titleStyle={{ fontWeight: 500 }}
        subtitle={formatAddress(wallet.address, 4)}
        squircleSize={40}
        showArrow
        onClick={() => {
          navigate(
            `/quick-settings/wallets/${wallet.address}` as PopupRoutePath
          );
        }}
        img={avatar}
      >
        {!avatar && (
          <ListItemIcon>
            <Text
              size="lg"
              weight="medium"
              noMargin
              style={{ textAlign: "center", color: "white" }}
            >
              {wallet?.nickname?.charAt(0)?.toUpperCase() || "A"}
            </Text>
          </ListItemIcon>
        )}
      </ListItem>
      <Spacer y={0.75} />
      <ListItem
        height={40}
        titleStyle={{ fontWeight: 500 }}
        title={browser.i18n.getMessage("manage_accounts")}
        subtitleExtra={wallets.length}
        hideSquircle
        showArrow
        onClick={() => {
          navigate("/quick-settings/wallets" as PopupRoutePath);
        }}
      >
        <Users01 height={24} width={24} color={theme.primaryText} />
      </ListItem>
      <HorizontalLine marginVertical={12} />
      <SettingsList>
        {quickSettingsMenuItems.map((setting, i) => (
          <SettingListItem
            displayName={setting.displayName}
            icon={setting.icon}
            active={activeSetting === setting.name}
            onClick={() => {
              if (setting.externalLink) {
                browser.tabs.create({
                  url: browser.runtime.getURL(setting.externalLink)
                });
              } else {
                if (setting.name === "subscriptions") {
                  return navigate(`/${setting.name}`);
                }
                navigate(`/quick-settings/${setting.name}` as PopupRoutePath);
              }
            }}
            key={i}
          />
        ))}
      </SettingsList>
      <Spacer y={1.5} />
      <Button variant="secondary" fullWidth onClick={() => setOpen(true)}>
        {browser.i18n.getMessage("sign_out")}
      </Button>
      <SliderMenu
        hasHeader={false}
        isOpen={open}
        onClose={() => setOpen(false)}
      >
        <Section
          showPaddingHorizontal={false}
          showPaddingVertical={false}
          style={{
            alignItems: "center",
            gap: 24,
            height: "60vh",
            justifyContent: "space-between",
            textAlign: "center"
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 24,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <img
              src={WanderIcon}
              alt="Wander Icon"
              width={102.418}
              height={48}
            />
            <Text size="xl" weight="semibold" lineHeight={1.3}>
              {browser.i18n.getMessage("sign_out_description")}
            </Text>
          </div>
          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <Button
              fullWidth
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              {browser.i18n.getMessage("cancel")}
            </Button>
            <Button fullWidth onClick={removeDecryptionKey}>
              {browser.i18n.getMessage("sign_out")}
            </Button>
          </div>
        </Section>
      </SliderMenu>
    </Section>
  );
}

const SettingsList = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
