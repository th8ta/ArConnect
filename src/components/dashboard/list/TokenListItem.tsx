import { type Token } from "~tokens/token";
import { Reorder, useDragControls } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { ListItem } from "@arconnect/components";
import { formatAddress } from "~utils/format";
import { useTheme } from "~utils/theme";
import styled from "styled-components";
import { FULL_HISTORY, useGateway } from "~gateways/wayfinder";
import { concatGatewayURL } from "~gateways/utils";
import aoLogo from "url:/assets/ecosystem/ao-logo.svg";
import arLogoDark from "url:/assets/ar/logo_dark.png";
import { getUserAvatar } from "~lib/avatar";
import { useLocation } from "~wallets/router/router.utils";

export default function TokenListItem({ token, active, onClick }: Props) {
  const { navigate } = useLocation();

  // format address
  const formattedAddress = useMemo(
    () => formatAddress(token.id, 8),
    [token.id]
  );

  // allow dragging with the drag icon
  const dragControls = useDragControls();

  // display theme
  const theme = useTheme();

  // token logo
  const [image, setImage] = useState(arLogoDark);

  // gateway
  const gateway = useGateway(FULL_HISTORY);

  useEffect(() => {
    (async () => {
      try {
        // if it is a collectible, we don't need to determinate the logo
        if (token.type === "collectible") {
          return setImage(`${concatGatewayURL(gateway)}/${token.id}`);
        }

        if (token.defaultLogo) {
          const logo = await getUserAvatar(token.defaultLogo);
          return setImage(logo);
        } else {
          return setImage(arLogoDark);
        }
      } catch {
        setImage(arLogoDark);
      }
    })();
  }, [token, theme, gateway]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/tokens/${token.id}`);
    }
  };

  return (
    <Reorder.Item
      as="div"
      value={token}
      id={token.id}
      dragListener={false}
      dragControls={dragControls}
      onClick={handleClick}
    >
      <ListItem
        title={`${token.name} (${token.ticker})`}
        description={
          <DescriptionWrapper>
            {formattedAddress}
            <Image src={aoLogo} alt="ao logo" />
          </DescriptionWrapper>
        }
        active={active}
        dragControls={null}
      >
        <TokenLogo src={image} />
      </ListItem>
    </Reorder.Item>
  );
}

const Image = styled.img`
  width: 16px;
  padding: 0 8px;
  border: 1px solid rgb(${(props) => props.theme.cardBorder});
  border-radius: 2px;
`;

const DescriptionWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

const TokenLogo = styled.img.attrs({
  alt: "token-logo",
  draggable: false
})`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1.7rem;
  height: 1.7rem;
  user-select: none;
  transform: translate(-50%, -50%);
`;

interface Props {
  token: Token;
  ao?: boolean;
  active: boolean;
  onClick?: () => void;
}
