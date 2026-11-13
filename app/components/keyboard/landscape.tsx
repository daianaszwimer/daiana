import type { ReactNode } from "react";
import styles from "./landscape.module.css";

/** Full-screen stage that stays horizontal, turning itself sideways on portrait phones. */
export function Landscape({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`${styles.stage} ${className}`}>{children}</div>;
}
