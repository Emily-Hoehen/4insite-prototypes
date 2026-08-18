"use client";

import { ExternalLinkIcon } from "../../icons";
import { OfflineReportFeature, OliviaTopic, reportingWindowLabel, reportPageUrl, SITE_LABEL } from "./oliviaContent";
import { OliviaAvatar } from "./OliviaAvatar";
import styles from "./ReportChatCard.module.css";

/**
 * The compact "report's ready" visual that lives inside Olivia's own
 * chat bubble (Figma node 2189:13896) — a shrunk echo of the
 * standalone report page's hero (same gradient background, same
 * copy), faded out at the bottom rather than trying to fit everything
 * in, since it's a preview/teaser, not the report itself. Download
 * opens the real thing (OliviaReportPage) in a new tab.
 */
export function ReportPreviewCard({
  topic,
  features,
}: {
  topic: OliviaTopic | null;
  features: OfflineReportFeature[];
}) {
  const handleOpenFullReport = () => {
    window.open(reportPageUrl(topic, features), "_blank", "noopener,noreferrer");
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.preview}>
        <OliviaAvatar size={44} alt="Olivia" />
        <p className={styles.previewTitle}>
          Hello, I&rsquo;m Olivia,
          <br />
          SBM&rsquo;s AI Assistant
        </p>
        <p className={styles.previewBody}>
          I&rsquo;ve analyzed activity across <strong>1 Site</strong> in Delta.
        </p>
        <p className={styles.previewRange}>{reportingWindowLabel()}</p>

        <p className={styles.previewLabel}>Your Portfolio</p>
        <div className={styles.previewPortfolio}>
          <img src="/dashboard/delta-logo.png" alt="" className={styles.previewLogo} />
          <div>
            <p className={styles.previewPortfolioName}>Delta</p>
            <p className={styles.previewPortfolioMeta}>1 Site</p>
          </div>
        </div>

        <p className={styles.previewLabel}>Sites</p>
        <span className={styles.previewSitePill}>{SITE_LABEL}</span>

        <div className={styles.previewFade} aria-hidden="true" />
      </div>

      <button type="button" className={styles.downloadButton} onClick={handleOpenFullReport}>
        Download Report
        <ExternalLinkIcon />
      </button>
    </div>
  );
}
