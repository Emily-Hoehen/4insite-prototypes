import { SparkleIcon } from "../../icons";
import styles from "./OliviaViews.module.css";

/**
 * Olivia's brand mark: the sparkle glyph + "Olivia" wordmark in her
 * signature purple. Applied to every surface she generates — slides,
 * reports (including the downloaded file), and the live dashboard —
 * so it's unambiguous which content came from her versus the
 * site's own UI, wherever that content ends up.
 */
export function OliviaMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={styles.oliviaMark}>
      <SparkleIcon className={styles.oliviaMarkIcon} />
      {!compact && "Olivia"}
    </span>
  );
}
