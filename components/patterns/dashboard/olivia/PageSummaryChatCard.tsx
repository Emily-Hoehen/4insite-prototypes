"use client";

import { DownloadIcon, PlusIcon } from "../../icons";
import { PAGE_SUMMARY_SECTIONS, SummaryPageId } from "./oliviaContent";
import styles from "./PageSummaryChatCard.module.css";

/** Plain-text render of the given sections — shared by ChatTurnActions'
 * Copy button (AskView, clipboard) and Download Summary (same text,
 * saved as a file) so neither has to re-walk the section/group/bullet
 * structure on its own. Exported rather than kept private since both
 * live in different files now that copy/reset/rate moved out to the
 * one shared action row every reply gets (see ChatTurnActions). */
export function summaryAsText(pageIds: SummaryPageId[]): string {
  return pageIds
    .map((id) => {
      const section = PAGE_SUMMARY_SECTIONS[id];
      const lines = [section.heading];
      if (section.meta) lines.push(section.meta);
      for (const group of section.groups) {
        lines.push("", group.label, ...group.bullets.map((b) => `- ${b}`));
      }
      return lines.join("\n");
    })
    .join("\n\n");
}

/**
 * "Summarize page view" (Figma nodes 2209:36698 / 2209:36788 — the
 * same card, the second just scrolled to its own footer) — a
 * text-level summary of the current page, living inside Olivia's own
 * reply bubble like every other rich reply in this file tree. One
 * section per page in `summaryPageIds`; "Add current view to summary"
 * (see useOliviaSession) is what grows that list past one. Copy/reset/
 * rate live outside this card now (AskView renders ChatTurnActions
 * after every reply, this one included) — this only owns the content
 * and its own two actions (Download, Add current view).
 */
export function PageSummaryChatCard({
  summaryPageIds,
  currentSummaryPageId,
  onAddCurrentView,
}: {
  summaryPageIds: SummaryPageId[];
  /** Which page this session is actually on right now — used only to
   * tell whether "Add current view to summary" would add anything new. */
  currentSummaryPageId: SummaryPageId;
  onAddCurrentView: () => void;
}) {
  const alreadyIncludesCurrentView = summaryPageIds.includes(currentSummaryPageId);

  const handleDownload = () => {
    const text = summaryAsText(summaryPageIds);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "page-summary.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.wrap}>
      {summaryPageIds.map((pageId) => {
        const section = PAGE_SUMMARY_SECTIONS[pageId];
        return (
          <div key={pageId} className={styles.section}>
            <p className={styles.heading}>{section.heading}</p>
            {section.meta && <p className={styles.meta}>{section.meta}</p>}
            {section.groups.map((group) => (
              <div key={group.label} className={styles.group}>
                <p className={styles.groupLabel}>{group.label}</p>
                <ul className={styles.bulletList}>
                  {group.bullets.map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );
      })}

      <div className={styles.actions}>
        <button type="button" className={styles.actionButton} onClick={handleDownload}>
          <DownloadIcon />
          Download Summary
        </button>
        <button
          type="button"
          className={styles.actionButton}
          onClick={onAddCurrentView}
          disabled={alreadyIncludesCurrentView}
        >
          <PlusIcon />
          {alreadyIncludesCurrentView ? "Current view already in summary" : "Add current view to summary"}
        </button>
      </div>
    </div>
  );
}
