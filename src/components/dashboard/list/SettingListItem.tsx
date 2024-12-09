import { ListItem, ListItemIcon } from "@arconnect/components";
import type { Icon } from "~settings/setting";
import browser from "webextension-polyfill";
import type { HTMLProps } from "react";

export interface SettingItemProps {
  icon: Icon;
  displayName: string;
  description: string;
  active: boolean;
}

export default function SettingListItem({
  displayName,
  description,
  icon,
  active,
  ...props
}: SettingItemProps & HTMLProps<HTMLDivElement>) {
  return (
    <ListItem
      title={browser.i18n.getMessage(displayName)}
      description={browser.i18n.getMessage(description)}
      active={active}
      {...props}
    >
      <ListItemIcon as={icon} />
    </ListItem>
  );
}
