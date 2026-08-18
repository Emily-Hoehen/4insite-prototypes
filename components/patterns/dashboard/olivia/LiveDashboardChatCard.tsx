"use client";

import { ExternalLinkIcon, FilePdfIcon } from "../../icons";
import styles from "./LiveDashboardChatCard.module.css";

/** Same asset the full-screen view opens (see LiveDashboardFullScreen)
 * — a real screenshot of the dashboard rather than a rebuilt live
 * table/chart, per the reference this was built from. Public assets
 * are served at their literal filename; the space has to be
 * percent-encoded for use in a URL. */
export const LIVE_DASHBOARD_IMAGE_SRC = "/dashboard/Live%20Dashboard.png";

/**
 * The "live dashboard's ready" reply that lives inside Olivia's own
 * chat bubble (Figma node 2209:35164) — Export/View Full Screen
 * actions up top, then a preview of the dashboard itself (title, date
 * range, description, and the dashboard image) underneath, same shape
 * as ReportPreviewCard's own report-ready card just above it in the
 * same file tree. Clicking the preview image itself also opens full
 * screen — Figma only wires the explicit button, but a screenshot
 * that looks like a live dashboard reads as clickable on its own.
 */
export function LiveDashboardPreviewCard({ onViewFullScreen }: { onViewFullScreen: () => void }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.actions}>
        <button type="button" className={styles.exportButton} onClick={() => window.print()}>
          Export
          <FilePdfIcon />
        </button>
        <button type="button" className={styles.viewFullScreenButton} onClick={onViewFullScreen}>
          View Full Screen
          <ExternalLinkIcon />
        </button>
      </div>

      <div className={styles.preview}>
        <p className={styles.previewTitle}>LGA-LaGuardia Site Performance Dashboard</p>
        <p className={styles.previewMeta}>Aug 1, 2026 – Aug 10, 2026</p>
        <p className={styles.previewDescription}>
          This page provides a comprehensive overview of people management, site performance, safety streaks, and
          audit results for the LaGuardia facility.
        </p>
        <button
          type="button"
          className={styles.previewImageButton}
          onClick={onViewFullScreen}
          aria-label="View full screen"
        >
          <img
            src={LIVE_DASHBOARD_IMAGE_SRC}
            alt="LGA-LaGuardia Site Performance Dashboard"
            className={styles.previewImage}
          />
        </button>
      </div>
    </div>
  );
}
