"use client";

import { BullhornIcon, FinancialsIcon, ListIcon, PdfIcon, VolumeIcon } from "../../icons";
import { SUGGESTED_PROMPTS, type OliviaScope, type OliviaTopic, type SuggestedPrompt } from "./oliviaContent";
import type { OliviaView } from "./OliviaPanel";
import { OliviaAvatar } from "./OliviaAvatar";
import styles from "./OliviaViews.module.css";
import outputStyles from "./OutputsAndPerformanceLists.module.css";

/**
 * "panelIcons"'s zero-state — Figma node 2281:20356 ("Zero State"): a
 * row hero (avatar + greeting), then three sections: site-level outputs,
 * page-level outputs (Summarize/Dashboard/Present, scoped to *this*
 * page), and the usual suggested-prompts pill list. Each mode/scope
 * pair gets its own dedicated row/card here rather than one button plus
 * a "this page or the whole site?" menu — the explicit split doesn't
 * fit OutputsAndPerformanceLists' one-list-of-modes shape (used by
 * PanelContextGreeting, unchanged), so this screen's markup is bespoke;
 * it reuses that file's own grid/pill CSS classes directly rather than
 * duplicating the same visual language in a second stylesheet — see
 * OutputsAndPerformanceLists.module.css's own doc comment on those
 * classes.
 *
 * Site-level is a 3-up card grid, left-aligned content, each card
 * carrying its own icon-well color (teal/yellow-orange/red-orange) per
 * this reference — reading "Offline Report" (two lines) / "Site
 * Presentation" / "Live Site Dashboard". Page-level is a vertical stack
 * of tight, per-item-colored pills, reading "Summarize this page" /
 * "View live dashboard of page" / "Present this page".
 */
export function HomeGreeting({
  onPickTopic,
  onOpenMode,
  onSummarizePage,
  promptSet = SUGGESTED_PROMPTS,
  performanceLabel = "Or start with a suggested prompt",
}: {
  onPickTopic: (topic: OliviaTopic, questionText?: string) => void;
  /** Report always opens the checklist modal regardless of scope (see
   * useOliviaSession's pickMode/openMode) — the "page"/"site" passed
   * for it below is never actually read. */
  onOpenMode: (mode: Exclude<OliviaView, "ask">, scope: OliviaScope) => void;
  /** "Summarize page view" has no topic to route through onPickTopic
   * and isn't a mode switch either (see useOliviaSession's
   * generatePageSummary) — its own dedicated action. */
  onSummarizePage?: () => void;
  /** Defaults to the mixed safety/complaint/audit set; the Safety page
   * passes SAFETY_SUGGESTED_PROMPTS instead, once Olivia already knows
   * that's the context she opened into. */
  promptSet?: SuggestedPrompt[];
  /** Optional override for the suggested-prompts label (page-specific). */
  performanceLabel?: string;
}) {
  return (
    <div className={[styles.homeGreeting, styles.homeGreetingGap40].join(" ")}>
      <div className={styles.homeGreetingHeroRow}>
        <OliviaAvatar size={70} alt="Olivia" />
        <div className={styles.homeGreetingTextRow}>
          <p className={styles.greetingHeadline}>
            Hi Emily,
            <br />
            how can I help you today?
          </p>
        </div>
      </div>

      <div className={outputStyles.listsGroup}>
        <div className={outputStyles.section}>
          <p className={outputStyles.sectionLabelBold}>Generate site level outputs</p>
          <div className={outputStyles.outputGrid}>
            <button type="button" className={outputStyles.outputCard} onClick={() => onOpenMode("report", "site")}>
              <span className={outputStyles.outputIconTeal}>
                <PdfIcon />
              </span>
              <span className={outputStyles.outputCardLabel}>
                Offline
                <br />
                Report
              </span>
            </button>
            <button type="button" className={outputStyles.outputCard} onClick={() => onOpenMode("presenter", "site")}>
              <span className={outputStyles.outputIconYellowOrange}>
                <BullhornIcon />
              </span>
              <span className={outputStyles.outputCardLabel}>Site Presentation</span>
            </button>
            <button type="button" className={outputStyles.outputCard} onClick={() => onOpenMode("dashboard", "site")}>
              <span className={outputStyles.outputIconRedOrange}>
                <FinancialsIcon />
              </span>
              <span className={outputStyles.outputCardLabel}>Live Site Dashboard</span>
            </button>
          </div>
        </div>

        <div className={outputStyles.section}>
          <p className={outputStyles.sectionLabelBold}>View page level insights</p>
          <div className={outputStyles.pillList}>
            <button
              type="button"
              className={[outputStyles.promptPillPrimaryBlue, outputStyles.promptPillTight].join(" ")}
              onClick={() => onSummarizePage?.()}
            >
              <span className={outputStyles.promptPillIcon}>
                <ListIcon />
              </span>
              Summarize this page
            </button>
            <button
              type="button"
              className={[outputStyles.promptPillRedOrange, outputStyles.promptPillTight].join(" ")}
              onClick={() => onOpenMode("dashboard", "page")}
            >
              <span className={outputStyles.promptPillIcon}>
                <FinancialsIcon />
              </span>
              View live dashboard of page
            </button>
            <button
              type="button"
              className={[outputStyles.promptPillPinkle, outputStyles.promptPillTight].join(" ")}
              onClick={() => onOpenMode("presenter", "page")}
            >
              <span className={outputStyles.promptPillIcon}>
                <VolumeIcon />
              </span>
              Present this page
            </button>
          </div>
        </div>

        <div className={outputStyles.section}>
          <p className={outputStyles.sectionLabelBold}>{performanceLabel}</p>
          <div className={outputStyles.pillList}>
            {promptSet.map((prompt) => (
              <button
                key={prompt.topic}
                type="button"
                className={outputStyles.promptPill}
                onClick={() => onPickTopic(prompt.topic, prompt.question)}
              >
                {prompt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
