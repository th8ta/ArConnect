import { useEffect, useState } from "react";
import styled from "styled-components";
import { Text, useToasts } from "@arconnect/components-rebrand";
import browser from "webextension-polyfill";
import copy from "copy-to-clipboard";
import { Check, Copy01 } from "@untitled-ui/icons-react";

interface CopyToClipboardProps {
  text: string;
  copySuccess?: string;
  iconSize?: number;
  label?: string;
  labelStyle?: React.CSSProperties;
  labelAs?: React.ElementType;
}

const CopyButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  padding: 4px;
  border: none;
  background: none;
  gap: 4px;
`;

const Label = styled(Text).attrs({
  noMargin: true
})`
  overflow: hidden;
`;

export function CopyToClipboard({
  text,
  copySuccess,
  iconSize = 16,
  label,
  labelStyle,
  labelAs: LabelComponent = Label
}: CopyToClipboardProps) {
  const toast = useToasts();
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    setIsCopied(false);
    try {
      copy(text || "");
      toast.setToast({
        type: "success",
        content: copySuccess || browser.i18n.getMessage("copied"),
        duration: 2400
      });
      setIsCopied(true);
    } catch (err) {
      toast.setToast({
        type: "error",
        content: browser.i18n.getMessage("copy_failed"),
        duration: 2400
      });
    }
  };

  useEffect(() => {
    if (!isCopied) return;

    const timeout = setTimeout(() => {
      setIsCopied(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [isCopied]);

  return (
    <CopyButton onClick={copyToClipboard}>
      {label && <LabelComponent style={labelStyle}>{label}</LabelComponent>}
      <Icon
        as={isCopied ? Check : Copy01}
        height={iconSize}
        width={iconSize}
        color={isCopied ? "#56C980" : ""}
      />
    </CopyButton>
  );
}

const Icon = styled.div<{ height: number; width: number; color: string }>`
  height: ${(props) => props.height}px;
  width: ${(props) => props.width}px;
  ${(props) => `color: ${props.color || props.theme.primaryText};`}
`;
