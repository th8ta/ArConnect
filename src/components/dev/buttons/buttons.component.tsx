import { Link } from "~wallets/router/components/link/Link";
import type React from "react";

import styles from "./buttons.module.scss";
import type { ArConnectRoutePath } from "~wallets/router/router.types";

export interface DevButtonProps {
  label: string;
  to?: ArConnectRoutePath;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "primary" | "secondary" | "dev";
  isLoading?: boolean;
  isDisabled?: boolean;
}

function DevButton({
  label,
  to,
  onClick,
  variant = "primary",
  isLoading,
  isDisabled
}: DevButtonProps) {
  const buttonElement = (
    <button
      className={`${styles.button} ${styles[variant]}`}
      onClick={onClick}
      disabled={isDisabled || isLoading}
    >
      {label}
    </button>
  );

  return to ? <Link to={to}>{buttonElement}</Link> : buttonElement;
}

export interface DevButtonsProps {
  config: DevButtonProps[];
  variant?: "primary" | "secondary" | "dev";
  isLoading?: boolean;
  isDisabled?: boolean;
}

export function DevButtons({
  config,
  variant,
  isLoading,
  isDisabled
}: DevButtonsProps) {
  return (
    <ul className={styles.root}>
      {config.map((buttonConfig, i) => {
        return (
          <li key={i} className={styles.li}>
            <DevButton
              {...buttonConfig}
              variant={buttonConfig.variant || variant}
              isLoading={buttonConfig.isLoading || isLoading}
              isDisabled={buttonConfig.isDisabled || isDisabled}
            />
          </li>
        );
      })}
    </ul>
  );
}
