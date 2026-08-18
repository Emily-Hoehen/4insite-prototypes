"use client";

import { useEffect } from "react";
import { CloseIcon } from "../../icons";
import { LIVE_DASHBOARD_IMAGE_SRC } from "./LiveDashboardChatCard";
import styles from "./LiveDashboardFullScreen.module.css";

/**
 * "View Full Screen" from the live-dashboard chat card (Figma node
 * 2209:35003) — a real screenshot of the dashboard stands in for a
 * rebuilt live page here (per the reference this was built from,
 * rather than re-implementing every metric/chart a second time as its
 * own full-screen component). Same overlay pattern as
 * ExternalPresenterView — a position: fixed sibling of .panel so it
 * outlives the side panel's own open/close transform, Escape-to-close,
 * a real close button since the screenshot's own baked-in one isn't
 * clickable.
 */
export function LiveDashboardFullScreen({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Live dashboard, full screen">
      <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close full screen dashboard">
        <CloseIcon />
      </button>
      <div className={styles.scroll}>
        <img src={LIVE_DASHBOARD_IMAGE_SRC} alt="LGA-LaGuardia Site Performance Dashboard" className={styles.image} />
      </div>
    </div>
  );
}
