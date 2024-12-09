import { ListItem, ListItemIcon } from "@arconnect/components";
import type { Icon } from "~settings/setting";
import type { HTMLProps, ReactNode } from "react";
import { LinkExternal02 } from "@untitled-ui/icons-react";
import browser from "webextension-polyfill";
import styled from "styled-components";

export interface SettingItemData {
  icon: Icon;
  displayName: string;
  description: string;
  active: boolean;
  isExternalLink?: boolean;
}

export function SettingListItem({
  displayName,
  description,
  icon,
  active,
  ...props
}: SettingItemData & HTMLProps<HTMLDivElement>) {
  return (
    <ListItem
      title={
        (
          <Title>
            {browser.i18n.getMessage(displayName)}{" "}
            {props.isExternalLink && <ExternalLinkIcon />}
          </Title>
        ) as ReactNode & string
      }
      description={browser.i18n.getMessage(description)}
      active={active}
      small={true}
      {...props}
    >
      <ListItemIcon as={icon} />
    </ListItem>
  );
}

const ExternalLinkIcon = styled(LinkExternal02)`
  height: 1rem;
  width: 1rem;
  color: ${(props) => props.theme.secondaryTextv2};
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  justify-items: center;
  gap: 8px;
`;
