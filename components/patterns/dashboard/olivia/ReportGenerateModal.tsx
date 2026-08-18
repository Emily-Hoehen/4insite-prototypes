"use client";

import { useEffect, useState } from "react";
import { Button } from "../../../ui/Button";
import { CloseIcon } from "../../icons";
import { OFFLINE_REPORT_FEATURES, type OfflineReportFeature } from "./oliviaContent";
import { OliviaAvatar } from "./OliviaAvatar";
import sharedStyles from "./OliviaViews.module.css";
import styles from "./ReportGenerateModal.module.css";

/**
 * The Offline Report feature checklist — a floating dialog over the
 * whole page (Figma node 2189:14364), shared by both report flows now
 * (see useOliviaSession's pickMode/openMode). What "Generate Report"
 * does next is the only thing that still differs by flow: the caller
 * passes either confirmReportModal ("external" — a toast, then a new
 * tab) or confirmReportModalInline ("chat" — lands in the conversation
 * itself) as `onGenerate`. Rendered as a sibling of .panel/.modal,
 * same reasoning as ReportToast: those elements' own open/close
 * `transform`/`overflow: hidden` would otherwise clip or reposition a
 * `position: fixed` descendant.
 */
export function ReportGenerateModal({
  onCancel,
  onGenerate,
}: {
  onCancel: () => void;
  onGenerate: (features: OfflineReportFeature[]) => void;
}) {
  const [selected, setSelected] = useState<OfflineReportFeature[]>([...OFFLINE_REPORT_FEATURES]);

  const toggleFeature = (feature: OfflineReportFeature) => {
    setSelected((prev) => (prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]));
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label="Generate an Offline Report"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.head}>
          <OliviaAvatar size={36} />
          <p className={styles.title}>Generate an Offline Report</p>
          <button type="button" className={styles.closeButton} onClick={onCancel} aria-label="Cancel">
            <CloseIcon />
          </button>
        </div>
        <p className={styles.subtitle}>Select what you want me to include in your mobile friendly offline report</p>

        <div className={sharedStyles.featureList} role="group" aria-label="Report features">
          {OFFLINE_REPORT_FEATURES.map((feature) => (
            <label key={feature} className={sharedStyles.featureRow}>
              <input
                type="checkbox"
                className={sharedStyles.checkbox}
                checked={selected.includes(feature)}
                onChange={() => toggleFeature(feature)}
              />
              {feature}
            </label>
          ))}
        </div>

        <div className={styles.actions}>
          <Button variant="textLink" theme="dark" className={sharedStyles.oliviaTextLinkButton} onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            theme="dark"
            className={sharedStyles.oliviaFlatPrimaryButton}
            disabled={selected.length === 0}
            onClick={() => onGenerate(selected)}
          >
            Generate Report
          </Button>
        </div>
      </div>
    </div>
  );
}
