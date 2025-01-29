export interface ArConnectButtonStyles extends Partial<CSSStyleDeclaration> {}

export interface ArConnectButtonConfig {
  buttonStyles?: ArConnectButtonStyles | "none";
  onClick?: () => void;
  logo?: string;
  balance?: string;
}
