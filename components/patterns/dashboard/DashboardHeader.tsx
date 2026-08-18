import { Button } from "../../ui/Button";
import { ArrowLeftIcon } from "../icons";
import styles from "./DashboardHeader.module.css";

export type DashboardHeaderProps = {
  siteName: string;
  greeting: string;
};

/**
 * Header — Figma node 2006:981. Gradient identity panel (site logo
 * + name + greeting) beside a 3-photo strip, with a skrim and
 * "View All Photos" button along the bottom edge.
 */
export function DashboardHeader({ siteName, greeting }: DashboardHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.gradientPanel}>
        <div className={styles.gradientContent}>
          <div className={styles.logo}>
            <img src="/dashboard/delta-logo.png" alt="" className={styles.logoImg} />
          </div>
          <div className={styles.label}>
            <p className={styles.siteName}>{siteName}</p>
            <p className={styles.greeting}>{greeting}</p>
          </div>
        </div>
      </div>

      <div className={styles.photos}>
        <div className={styles.photoMain}>
          <img src="/dashboard/header-photo-1.png" alt="" />
        </div>
        <div className={styles.photo}>
          <img src="/dashboard/header-photo-2.png" alt="" />
        </div>
        <div className={styles.photo}>
          <img src="/dashboard/header-photo-3.png" alt="" />
        </div>
      </div>

      <div className={styles.skrim} />

      <Button
        variant="secondary"
        theme="dark"
        icon={<ArrowLeftIcon />}
        className={styles.photosButton}
      >
        View All Photos
      </Button>
    </header>
  );
}
