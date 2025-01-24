import { ButtonV2, Section, TooltipV2, useToasts } from "@arconnect/components";
import { useStorage } from "~utils/storage";
import { ExtensionStorage } from "~utils/storage";
import { CheckIcon, CopyIcon } from "@iconicicons/react";
import { formatAddress } from "~utils/format";
import { QRCodeSVG } from "qrcode.react";
import browser from "webextension-polyfill";
import styled from "styled-components";
import copy from "copy-to-clipboard";
import { useEffect, type MouseEventHandler, useState, useMemo } from "react";
import { PageType, trackPage } from "~utils/analytics";
import HeadV2 from "~components/popup/HeadV2";
import type { CommonRouteProps } from "~wallets/router/router.types";
import { useLocation } from "~wallets/router/router.utils";

interface ReceiveViewProps extends CommonRouteProps {
  walletName?: string;
  walletAddress?: string;
}

export function ReceiveView({ walletName, walletAddress }: ReceiveViewProps) {
  const { navigate } = useLocation();

  // active address
  const [activeAddress] = useStorage<string>({
    key: "active_address",
    instance: ExtensionStorage
  });
  const [copied, setCopied] = useState(false);

  const effectiveAddress = useMemo(
    () => walletAddress || activeAddress,
    [walletAddress, activeAddress]
  );

  //segment
  useEffect(() => {
    if (!walletName && !walletAddress) {
      trackPage(PageType.RECEIVE);
    }
  }, []);

  const { setToast } = useToasts();

  const copyAddress: MouseEventHandler = (e) => {
    e.stopPropagation();
    copy(effectiveAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
    setToast({
      type: "success",
      duration: 2000,
      content: `${formatAddress(effectiveAddress, 3)} ${browser.i18n.getMessage(
        "copied_address_2"
      )}`
    });
  };

  return (
    <Wrapper>
      <div>
        <HeadV2
          title={walletName || browser.i18n.getMessage("receive")}
          back={() => {
            if (walletName && walletAddress) {
              navigate(`/quick-settings/wallets/${walletAddress}`);
            } else {
              navigate("/");
            }
          }}
        />
      </div>
      <div>
        <ContentWrapper>
          <Section style={{ padding: "8px 15px 0 15px" }}>
            <QRCodeWrapper>
              <QRCodeSVG
                fgColor="#fff"
                bgColor="transparent"
                size={275}
                value={effectiveAddress ?? ""}
              />
            </QRCodeWrapper>
          </Section>
          <Section style={{ padding: "8px 15px 0 15px" }}>
            <AddressField fullWidth onClick={copyAddress}>
              {formatAddress(effectiveAddress ?? "", 6)}
              <TooltipV2
                content={browser.i18n.getMessage("copy_address")}
                position="bottom"
              >
                <CopyAction as={copied ? CheckIcon : CopyIcon} />
              </TooltipV2>
            </AddressField>
          </Section>
        </ContentWrapper>
      </div>
    </Wrapper>
  );
}

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 72px);
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const AddressField = styled(ButtonV2)`
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
`;

export const CopyAction = styled(CopyIcon)`
  font-size: 1.25rem;
  width: 1em;
  height: 1em;
  color: #fff;
  cursor: pointer;
  transition: all 0.23s ease-in-out;

  &:hover {
    opacity: 0.85;
  }

  &:active {
    transform: scale(0.92);
  }
`;

export const QRCodeWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.theme.primary};
  border-radius: 21.44px;
  padding: 25.83px 0px;
`;
