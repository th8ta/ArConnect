export interface WanderButtonStyles extends Partial<CSSStyleDeclaration> {}

export interface WanderButtonConfig {
  buttonStyles?: WanderButtonStyles;
  onClick?: () => void;
  buttonRef?: HTMLButtonElement;
}
