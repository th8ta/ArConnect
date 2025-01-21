import { ListItem } from "@arconnect/components-rebrand";
import type { Icon } from "~settings/setting";
import browser from "webextension-polyfill";
import type { HTMLProps } from "react";
import styled from "styled-components";

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
      titleStyle={{ fontWeight: 500 }}
      title={browser.i18n.getMessage(displayName)}
      active={active}
      hideSquircle
      icon={<ListItemIcon style={{ height: 24, width: 24 }} as={icon} />}
      {...props}
    />
  );
}

const ListItemIcon = styled.div`
  height: 24px;
  width: 24px;
  color: ${({ theme }) => theme.secondaryText};
`;
