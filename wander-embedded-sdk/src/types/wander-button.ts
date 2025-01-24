export interface WanderButtonStyles extends Partial<CSSStyleDeclaration> {}

export interface WanderButtonConfig {
  buttonStyles?: WanderButtonStyles;
  onClick?: () => void;
  logo?: string;
  balance?: string;
}
