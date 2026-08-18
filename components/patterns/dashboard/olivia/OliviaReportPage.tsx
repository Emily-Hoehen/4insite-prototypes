"use client";

import { useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDownIcon, DownloadIcon } from "../../icons";
import {
  downloadReportAsText,
  getReportContent,
  OfflineReportFeature,
  OliviaTopic,
  reportingWindowLabel,
  SITE_LABEL,
  TOPIC_LABEL,
} from "./oliviaContent";
import { OliviaAvatar } from "./OliviaAvatar";
import styles from "./OliviaReportPage.module.css";
// Reused for the report content itself (title/meta/summary/bullets/
// download button) so this page can't visually drift from the same
// report shown in-panel — see ReportChatCard, which owns that look.
import viewStyles from "./OliviaViews.module.css";

const VALID_TOPICS: readonly OliviaTopic[] = ["safety", "complaint", "audit"];

function parseTopic(value: string | null): OliviaTopic | null {
  return VALID_TOPICS.includes(value as OliviaTopic) ? (value as OliviaTopic) : null;
}

/**
 * The "open in a new tab" destination behind the in-chat report
 * card's "Download Report" action — a standalone, mobile-ready page
 * (Olivia's existing production behavior) rather than another panel
 * view, so it reads naturally when opened on its own, shared, or
 * printed. Reads `topic`/
 * `features` off the URL so it shows the same report ReportView was
 * looking at, not a generic default.
 */
export function OliviaReportPage() {
  const searchParams = useSearchParams();
  const topic = parseTopic(searchParams.get("topic"));
  const featuresParam = searchParams.get("features");
  const features = (featuresParam ? featuresParam.split(",") : []) as OfflineReportFeature[];

  const reportSectionRef = useRef<HTMLDivElement>(null);
  const report = getReportContent(topic, "page");

  const scrollToReport = () => {
    reportSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDownload = () => downloadReportAsText(report, features);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.hero}>
          <OliviaAvatar size={64} alt="Olivia" />

          <h1 className={styles.heroTitle}>
            Hello, I&rsquo;m Olivia,
            <br />
            SBM&rsquo;s AI Assistant
          </h1>
          <p className={styles.heroBody}>
            I&rsquo;ve analyzed activity across <strong>1 Site</strong> in Delta.
          </p>
          <p className={styles.heroRange}>{reportingWindowLabel()}</p>

          <div className={styles.infoSection}>
            <p className={styles.infoLabel}>Your Portfolio</p>
            <div className={styles.portfolioRow}>
              <img src="/dashboard/delta-logo.png" alt="" className={styles.portfolioLogo} />
              <div>
                <p className={styles.portfolioName}>Delta</p>
                <p className={styles.portfolioMeta}>1 Site</p>
              </div>
            </div>
          </div>

          <div className={styles.infoSection}>
            <p className={styles.infoLabel}>Sites</p>
            <span className={styles.sitePill}>{SITE_LABEL}</span>
          </div>

          <button type="button" className={styles.scrollCue} onClick={scrollToReport}>
            Scroll down · View your report
            <ChevronDownIcon />
          </button>
        </div>

        <div ref={reportSectionRef} className={styles.reportSection}>
          <p className={styles.reportEyebrow}>Report</p>
          <h2 className={viewStyles.reportTitle}>{report.title}</h2>
          <p className={viewStyles.reportMeta}>
            Generated just now
            {features.length > 0 ? ` · Includes: ${features.join(", ")}` : ""}
            {topic ? ` · Focused on ${TOPIC_LABEL[topic]}` : ""}
          </p>
          <p className={viewStyles.reportSummary}>{report.summary}</p>
          <ul className={viewStyles.reportBullets}>
            {report.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>

          <button type="button" className={viewStyles.reportDownloadButton} onClick={handleDownload}>
            <DownloadIcon /> Download report
          </button>
        </div>
      </div>
    </main>
  );
}
