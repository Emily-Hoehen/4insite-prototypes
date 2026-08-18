"use client";

import { BriefcaseIcon, ChevronRightIcon, GridIcon, HandSparklesIcon, SprayCanIcon } from "../../icons";
import type { ServiceAnalysis } from "./oliviaContent";
import styles from "./ServiceAnalysisChatCard.module.css";

// Keyed on the plain display string ServiceAnalysis.type carries (see
// its own doc comment for why this lives here instead of importing
// QualityPageContent's ActivityType) — falls back to the spray-can
// glyph for anything unrecognized rather than rendering nothing.
const TYPE_ICON: Record<string, React.ReactNode> = {
  "Spot Clean": <SprayCanIcon />,
  Periodic: <BriefcaseIcon />,
  "Full Service": <HandSparklesIcon />,
};

/** ChatTurnActions' Copy action's plain-text fallback for this
 * richContent — same reasoning as PageSummaryChatCard's own
 * summaryAsText export. */
export function serviceAnalysisAsText(analysis: ServiceAnalysis): string {
  return [
    `I've analyzed this service. Here are the results for this ${analysis.type}.`,
    "",
    `${analysis.timeLabel} — ${analysis.type}`,
    `Serviced by ${analysis.personName}, ${analysis.personRole}`,
    "",
    "Summary",
    analysis.summary,
  ].join("\n");
}

/**
 * Olivia's unprompted, one-service read — Figma node 2209:42714
 * ("Unprompted Summary - Verification Details"). Lives inside her own
 * reply bubble, same placement as every other rich card (PageSummary-
 * ChatCard/QualitySummaryCards/ReportChatCard) — the surrounding
 * chrome (avatar/name, gradient header, composer, and the suggested-
 * prompts row after it) is already what AskView/OliviaPanel render
 * around any Olivia reply, so this only owns the content Figma's own
 * "Olivia Side Panel" frame wrapped around: everything between the
 * header and the footer. "View Verification"/"Edit"/"Full Area View"
 * have no real destination in this prototype (no verification system
 * exists to view or edit) — plain, inert rows, same as this app's
 * other decorative-but-plausible controls (e.g. QualityPageContent's
 * own "All Positions" filter).
 */
export function ServiceAnalysisChatCard({ analysis }: { analysis: ServiceAnalysis }) {
  return (
    <div className={styles.wrap}>
      <p className={styles.heading}>I’ve analyzed this service. Here are the results for this {analysis.type}</p>

      <div className={styles.section}>
        <p className={styles.timeLabel}>{analysis.timeLabel}</p>
        <p className={styles.typeRow}>
          <span className={styles.typeIcon}>{TYPE_ICON[analysis.type] ?? <SprayCanIcon />}</span>
          {analysis.type}
        </p>
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <p className={styles.label}>Serviced By</p>
        <div className={styles.personRow}>
          {analysis.personAvatar && <img src={analysis.personAvatar} alt="" className={styles.personAvatar} />}
          <div className={styles.personText}>
            <p className={styles.personName}>{analysis.personName}</p>
            <p className={styles.personRole}>{analysis.personRole}</p>
          </div>
          <ChevronRightIcon className={styles.personArrow} />
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <p className={styles.label}>Summary</p>
        <p className={styles.summaryText}>{analysis.summary}</p>
      </div>

      <div className={styles.divider} />

      <div className={styles.fullAreaRow}>
        <span className={styles.fullAreaIcon}>
          <GridIcon />
        </span>
        Full Area View
      </div>

      <button type="button" className={styles.verificationButton}>
        View Verification
      </button>

      <button type="button" className={styles.editLink}>
        Edit
      </button>
    </div>
  );
}
