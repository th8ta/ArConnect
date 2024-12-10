import { type SettingItemProps } from "~components/dashboard/list/SettingListItem";
import {
  GridIcon,
  InformationIcon,
  TrashIcon,
  WalletIcon,
  BellIcon
} from "@iconicicons/react";
import { Coins04, Settings01, Users01 } from "@untitled-ui/icons-react";
import settings, { getSetting } from "~settings";
import type Setting from "~settings/setting";

// Basic Settings:
import { WalletsDashboardView } from "~components/dashboard/Wallets";

import { ApplicationsDashboardView } from "~components/dashboard/Applications";
import { TokensDashboardView } from "~components/dashboard/Tokens";
import { ContactsDashboardView } from "~components/dashboard/Contacts";
import { NotificationSettingsDashboardView } from "~components/dashboard/NotificationSettings";
import { AboutDashboardView } from "~components/dashboard/About";

// Advance Settings:
import { SignSettingsDashboardView } from "~components/dashboard/SignSettings";
import { ResetDashboardView } from "~components/dashboard/Reset";

export interface DashboardRouteConfig extends Omit<SettingItemProps, "active"> {
  name: string;
  externalLink?: string;
  component?: (...args: any[]) => JSX.Element;
}

export function isDashboardRouteConfig(
  data: DashboardRouteConfig | Setting
): data is DashboardRouteConfig {
  return data.hasOwnProperty("component");
}

export const basicSettings: (DashboardRouteConfig | Setting)[] = [
  {
    name: "wallets",
    displayName: "setting_wallets",
    description: "setting_wallets_description",
    icon: WalletIcon,
    component: WalletsDashboardView
  },
  {
    name: "apps",
    displayName: "setting_apps",
    description: "setting_apps_description",
    icon: GridIcon,
    component: ApplicationsDashboardView
  },
  {
    name: "tokens",
    displayName: "setting_tokens",
    description: "setting_tokens_description",
    icon: Coins04,
    component: TokensDashboardView
  },
  {
    name: "contacts",
    displayName: "setting_contacts",
    description: "setting_contacts_description",
    icon: Users01,
    component: ContactsDashboardView
  },
  {
    name: "notifications",
    displayName: "setting_notifications",
    description: "setting_notifications_description",
    icon: BellIcon,
    component: NotificationSettingsDashboardView
  },
  getSetting("display_theme"),
  {
    name: "about",
    displayName: "setting_about",
    description: "setting_about_description",
    icon: InformationIcon,
    component: AboutDashboardView
  }
];

export const advancedSettings: (DashboardRouteConfig | Setting)[] = [
  {
    name: "sign_settings",
    displayName: "setting_sign_settings",
    description: "setting_sign_notification_description",
    icon: BellIcon,
    component: SignSettingsDashboardView
  },
  ...settings.filter((setting) => setting.name !== "display_theme"),
  // TODO
  /*{
    name: "config",
    displayName: "setting_config",
    description: "setting_config_description",
    icon: DownloadIcon
  },*/
  {
    name: "reset",
    displayName: "setting_reset",
    description: "setting_reset_description",
    icon: TrashIcon,
    component: ResetDashboardView
  }
];

export const allSettings: (DashboardRouteConfig | Setting)[] = [
  ...basicSettings,
  ...advancedSettings
];

// Menu items are: wallets, apps, tokens, contact, notifications and "All Settings":
export const quickSettingsMenuItems: DashboardRouteConfig[] = [
  ...(basicSettings.slice(0, 5) as DashboardRouteConfig[]),
  {
    name: "All Settings",
    displayName: "setting_all_settings",
    description: "setting_all_settings_description",
    icon: Settings01,
    externalLink: "tabs/dashboard.html"
  }
];
