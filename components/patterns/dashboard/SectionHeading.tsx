import { ReactNode } from "react";
import styles from "./SectionHeading.module.css";

export function SectionHeading({
  icon,
  chipColor,
  chipBorder,
  iconColor = "var(--color-text-dt-default-inverted)",
  children,
}: {
  icon: ReactNode;
  chipColor: string;
  chipBorder: string;
  iconColor?: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.heading}>
      <span
        className={styles.chip}
        style={{ backgroundColor: chipColor, borderBottomColor: chipBorder, color: iconColor }}
      >
        {icon}
      </span>
      <h2 className={styles.title}>{children}</h2>
    </div>
  );
}
