"use client";

import { CheckCircleIcon, CloseIcon, InfoCircleIcon } from "../../icons";
import type { ReportFlowVariant } from "./OliviaPanel";
import type { ReportStatus } from "./useOliviaSession";
import styles from "./ReportToast.module.css";

/**
 * Surfaces report generation outside the panel itself — the whole
 * point of moving generation into session state (see useOliviaSession)
 * is that it keeps running after the user closes the panel or switches
 * to another tab within it, so there has to be *something* that tells
 * them it's still working, and later, that it's done. Fixed to the
 * viewport (not nested inside .panel, whose own open/close `transform`
 * would otherwise clip or reposition it — see OliviaPanel), so it's
 * visible regardless of the panel's own open state.
 *
 * `variant` adjusts copy/action for which flow produced this report:
 * "chat" points back at the finished chat message; "external" never
 * puts anything in the chat, so its action re-opens the report tab
 * instead, and it gets an extra "downloading" beat "chat" never has
 * (see REPORT_DOWNLOAD_MS on useOliviaSession).
 */
export function ReportToast({
  status,
  variant,
  onDismiss,
  onView,
}: {
  status: Exclude<ReportStatus, "idle">;
  variant: ReportFlowVariant;
  onDismiss: () => void;
  /** "Preview"/"Open again" — ready state only. */
  onView: () => void;
}) {
  const isReady = status === "ready";
  const isDownloading = status === "downloading";

  const title = isReady
    ? variant === "external"
      ? "Report downloaded"
      : "Report ready"
    : isDownloading
    ? "Downloading report"
    : "Offline report";

  const message = isReady
    ? variant === "external"
      ? "Your offline report has been downloaded and opened in a new tab."
      : "Your offline report has been generated."
    : isDownloading
    ? "Saving your report for offline use…"
    : "Generating your report — this can take up to 30 seconds.";

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <span className={[styles.icon, isReady ? styles.iconReady : styles.iconPending].join(" ")} aria-hidden="true">
        {isReady ? <CheckCircleIcon /> : <InfoCircleIcon />}
      </span>

      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        <p className={styles.message}>{message}</p>
        {isReady && (
          <button type="button" className={styles.action} onClick={onView}>
            {variant === "external" ? "Open report again" : "Preview report"}
          </button>
        )}
      </div>

      <button type="button" className={styles.closeButton} onClick={onDismiss} aria-label="Dismiss">
        <CloseIcon />
      </button>
    </div>
  );
}
