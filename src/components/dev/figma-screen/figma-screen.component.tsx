import type { PropsWithChildren } from "react";
import styles from "./figma-screen.module.scss";
import { asArray } from "~utils/array";

export interface DevFigmaScreenProps extends PropsWithChildren {
  title: string;
  description?: string | string[];
  src: string;
  width?: number;
}

export function DevFigmaScreen({
  title,
  description,
  src,
  width = 420,
  children
}: DevFigmaScreenProps) {
  return (
    <div className={styles.root} style={{ width: `${width}px` }}>
      <h1 className={styles.title}>{title}</h1>

      {description
        ? asArray(description).map((descriptionLine, i) => {
            return (
              <p key={i} className={styles.p}>
                {descriptionLine}
              </p>
            );
          })
        : null}

      <img className={styles.img} src={src} />

      {children ? <div className={styles.children}>{children}</div> : null}
    </div>
  );
}
