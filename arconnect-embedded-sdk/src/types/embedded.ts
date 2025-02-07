import { type ArConnectButton } from "../components/ArConnectButton";
import { type ArConnectIframe } from "../components/ArConnectIframe";

export interface UIComponents {
  container?: HTMLDivElement;
  button?: ArConnectButton;
  iframe: ArConnectIframe;
}
