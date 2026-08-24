"use client";

import { BullhornIcon, FinancialsIcon, ListIcon, PdfIcon, VolumeIcon } from "../../icons";
import {
  PersonalizedSuggestion,
  SUGGESTED_PROMPTS,
  type OliviaScope,
  type OliviaTopic,
  type SuggestedPrompt,
} from "./oliviaContent";
import type { OliviaView } from "./OliviaPanel";
import { OliviaAvatar } from "./OliviaAvatar";
import { PersonalizedSuggestions } from "./PersonalizedSuggestions";
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
 * Site-level is a 2-up card grid, left-aligned content, each card
 * carrying its own plain icon color (teal/yellow-orange, no tinted
 * well behind it — see OutputsAndPerformanceLists.module.css's own
 * .outputIconPlain doc comment) per this reference — reading "Generate
 * an Offline Report" (two lines) / "Start a Site Presentation" (two
 * lines). (A third card, "Live Site
 * Dashboard", used to sit here — removed per the decided direction:
 * site-wide dashboard access now only lives in the header's own mode
 * icons... except that's gone too, see HEADER_MODE_ORDER's own doc
 * comment — page-scoped dashboard access is the only one kept, via the
 * pill just below.) Page-level is a vertical stack of tight,
 * per-item-colored pills, reading "Summarize this page" / "View live
 * dashboard of page" / "Present this page".
 *
 * Figma node 2279:16662 is this screen's own base state — the generic
 * "Or start with a suggested prompt" pill row at the bottom. Node
 * 2360:30996 is the same screen with Personalized Suggestions
 * (PersonalizedSuggestions) inserted above "Generate site level
 * outputs" instead — see showPersonalizedSuggestions below for which
 * one replaces which and why.
 */
export function HomeGreeting({
  onPickTopic,
  onOpenMode,
  onSummarizePage,
  onPickSuggestion,
  showPersonalizedSuggestions = true,
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
  /** Picking one of PersonalizedSuggestions' own rows — see
   * useOliviaSession's askPersonalizedSuggestion. */
  onPickSuggestion?: (suggestion: PersonalizedSuggestion) => void;
  /** Personalized Suggestions is a *home*-level read on the user (see
   * PERSONALIZED_SUGGESTIONS) — it doesn't make sense once Olivia's
   * already scoped to one topic (e.g. opened from the Safety page), so
   * AskView only passes true for the general "home" entry context;
   * topic-scoped opens keep the generic suggested-prompt row instead
   * (Figma node 2279:16662), same as before Personalized Suggestions
   * existed. Swaps which of the two bottom sections renders, per Figma
   * node 2360:30996 — never both at once. */
  showPersonalizedSuggestions?: boolean;
  /** Defaults to the mixed safety/complaint/audit set; the Safety page
   * passes SAFETY_SUGGESTED_PROMPTS instead, once Olivia already knows
   * that's the context she opened into. */
  promptSet?: SuggestedPrompt[];
  /** Optional override for the suggested-prompts label (page-specific). */
  performanceLabel?: string;
}) {
  return (
    <div className={[styles.homeGreeting, showPersonalizedSuggestions ? styles.homeGreetingGapTight : ""].join(" ")}>
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

      <div
        className={[
          outputStyles.listsGroup,
          showPersonalizedSuggestions ? outputStyles.listsGroupTight : outputStyles.listsGroupWide,
        ].join(" ")}
      >
        {showPersonalizedSuggestions && <PersonalizedSuggestions onPick={onPickSuggestion} />}

        <div className={outputStyles.section}>
          <p className={outputStyles.sectionLabelBold}>Site level outputs</p>
          <div className={outputStyles.outputGrid}>
            <button type="button" className={outputStyles.outputCard} onClick={() => onOpenMode("report", "site")}>
              <span className={outputStyles.outputIconTealPlain}>
                <PdfIcon />
              </span>
              <span className={outputStyles.outputCardLabel}>
                Generate an
                <br />
                Offline Report
              </span>
            </button>
            <button type="button" className={outputStyles.outputCard} onClick={() => onOpenMode("presenter", "site")}>
              <span className={outputStyles.outputIconYellowOrangePlain}>
                <BullhornIcon />
              </span>
              <span className={outputStyles.outputCardLabel}>
                Start a
                <br />
                Site Presentation
              </span>
            </button>
          </div>
        </div>

        <div className={outputStyles.section}>
          <p className={outputStyles.sectionLabelBold}>Page level insights</p>
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

        {!showPersonalizedSuggestions && (
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
        )}
      </div>
    </div>
  );
}
