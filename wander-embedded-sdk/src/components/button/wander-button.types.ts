export interface WanderButtonStyles extends Partial<CSSStyleDeclaration> {}

export interface WanderButtonConfig {
  buttonStyles?: WanderButtonStyles | "none";
  onClick?: () => void;
  logo?: string;
  balance?: string;
}
