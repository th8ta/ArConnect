import { type MouseEventHandler } from "react";
import { concatGatewayURL } from "~gateways/utils";
import { FULL_HISTORY, useGateway } from "~gateways/wayfinder";
import { hoverEffect } from "~utils/theme";
import styled from "styled-components";
import placeholderUrl from "url:/assets/placeholder.png";

import Skeleton from "~components/Skeleton";
export default function Collectible({ id, onClick, ...props }: Props) {
  // gateway
  const gateway = useGateway(FULL_HISTORY);

  return (
    <Wrapper onClick={onClick}>
      <Image
        src={concatGatewayURL(gateway) + `/${id}`}
        fallback={placeholderUrl}
      >
        <NameAndQty>
          <Name>{props.name || ""}</Name>
          {props.balance === undefined ? (
            <Skeleton width="24px" height="20px" />
          ) : (
            <Qty>{props.balance || "0"}</Qty>
          )}
        </NameAndQty>
      </Image>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  cursor: pointer;
  transition: all 0.07s ease-in-out;

  ${hoverEffect}

  &::after {
    width: calc(100% + 15px);
    height: calc(100% + 15px);
    border-radius: 19.5px;
  }

  &:active {
    transform: scale(0.97);
  }
`;

const Image = styled.div<{ src: string; fallback: string }>`
  position: relative;
  background-image: url(${(props) => props.src}),
    url(${(props) => props.fallback});
  background-size: cover;
  background-position: center;
  padding-top: 100%;
  border-radius: 12px;
  overflow: hidden;
`;

const NameAndQty = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0.1rem 0.35rem;
  justify-content: space-between;
  background-color: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(5px);
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
`;

const Name = styled.span`
  flex: 0 1 auto;
  min-width: 0;
  font-size: 0.85rem;
  color: #fff;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Qty = styled(Name)`
  flex: 1 0 auto;
  color: #a0a0a0;
`;

interface Props {
  id: string;
  name: string;
  balance: string;
  divisibility?: number;
  decimals?: number;
  onClick?: MouseEventHandler<HTMLDivElement>;
}
