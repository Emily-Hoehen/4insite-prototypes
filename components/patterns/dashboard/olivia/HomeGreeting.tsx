"use client";

import { BullhornIcon, FinancialsIcon, ListIcon, PdfIcon, VolumeIcon } from "../../icons";
import {
  PERSONALIZED_SUGGESTIONS,
  PersonalizedSuggestion,
  SUGGESTED_PROMPTS,
  type OliviaScope,
  type OliviaTopic,
  type SuggestedPrompt,
} from "./oliviaContent";
import { OliviaAvatar } from "./OliviaAvatar";
import type { OliviaView } from "./OliviaPanel";
import { PersonalizedSuggestionButton } from "./PersonalizedSuggestions";
import styles from "./OliviaViews.module.css";
import outputStyles from "./OutputsAndPerformanceLists.module.css";

/**
 * "panelIcons"'s zero-state — Figma node 2364:32149 ("Personalized
 * Suggestions"): a 70px avatar beside a two-line greeting (node
 * 2369:32700 — distinct from the header's own smaller 36px avatar
 * above it, see OliviaPanel), then three sections: site-level outputs,
 * page-level outputs (Summarize/Dashboard/Present, scoped to *this*
 * page), and one merged "Suggested Prompts" list. Each mode/scope pair
 * gets its own dedicated row/card here rather than one button plus a
 * "this page or the whole site?" menu — the explicit split doesn't fit
 * OutputsAndPerformanceLists' one-list-of-modes shape (used by
 * PanelContextGreeting, unchanged), so this screen's markup is
 * bespoke; it reuses that file's own grid/pill CSS classes directly
 * rather than duplicating the same visual language in a second
 * stylesheet — see OutputsAndPerformanceLists.module.css's own doc
 * comment on those classes.
 *
 * Site-level is a 2-up card grid, left-aligned content, each card
 * carrying its own plain icon color (teal/yellow-orange, no tinted
 * well behind it — see OutputsAndPerformanceLists.module.css's own
 * .outputIconPlain doc comment) per this reference — reading "Generate
 * an Offline Report" (two lines) / "Start a Site Presentation" (two
 * lines). (A third card, "Live Site Dashboard", used to sit here —
 * removed per the decided direction: site-wide dashboard access now
 * only lives in the header's own mode icons... except that's gone too,
 * see HEADER_MODE_ORDER's own doc comment — page-scoped dashboard
 * access is the only one kept, via the pill just below.) Page-level is
 * a vertical stack of tight, per-item-colored pills, reading
 * "Summarize this page" / "View live dashboard of page" / "Present
 * this page".
 *
 * "Suggested Prompts" used to split into two mutually-exclusive
 * screens — a standalone "Personalized Suggestions" section (Figma
 * node 2360:30996) swapped in for the generic prompt row on the Home
 * entry context — see git history. This pull folds them into one list
 * instead: PERSONALIZED_SUGGESTIONS first (sparkle-tagged, home
 * context only — see showPersonalizedSuggestions), then the ordinary
 * SUGGESTED_PROMPTS pills, one shared header. Section rhythm: 40px
 * between the three sections (plain .listsGroup), 16px from Site level
 * outputs' own header to its cards (plain .section), but a tighter 12px
 * from Page level insights'/Suggested Prompts' own headers to their
 * first pill (.sectionTight) — see OutputsAndPerformanceLists.module.css.
 */
export function HomeGreeting({
  onPickTopic,
  onOpenMode,
  onSummarizePage,
  onPickSuggestion,
  showPersonalizedSuggestions = true,
  promptSet = SUGGESTED_PROMPTS,
  performanceLabel = "Suggested Prompts",
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
  /** Picking one of PERSONALIZED_SUGGESTIONS' own rows — see
   * useOliviaSession's askPersonalizedSuggestion. */
  onPickSuggestion?: (suggestion: PersonalizedSuggestion) => void;
  /** Personalized suggestions are a *home*-level read on the user (see
   * PERSONALIZED_SUGGESTIONS) — they don't make sense once Olivia's
   * already scoped to one topic (e.g. opened from the Safety page), so
   * AskView only passes true for the general "home" entry context;
   * topic-scoped opens show only their own promptSet, same as before
   * personalized suggestions existed. */
  showPersonalizedSuggestions?: boolean;
  /** Defaults to the mixed safety/complaint/audit set; the Safety page
   * passes SAFETY_SUGGESTED_PROMPTS instead, once Olivia already knows
   * that's the context she opened into. */
  promptSet?: SuggestedPrompt[];
  /** Optional override for the suggested-prompts label (page-specific). */
  performanceLabel?: string;
}) {
  return (
    <div className={styles.homeGreeting}>
      <div className={styles.homeGreetingHeroRow}>
        <OliviaAvatar size={70} />
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

        <div className={[outputStyles.section, outputStyles.sectionTight].join(" ")}>
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

        <div className={[outputStyles.section, outputStyles.sectionTight].join(" ")}>
          <p className={outputStyles.sectionLabelBold}>{performanceLabel}</p>
          <div className={outputStyles.pillList}>
            {showPersonalizedSuggestions &&
              PERSONALIZED_SUGGESTIONS.map((suggestion) => (
                <PersonalizedSuggestionButton key={suggestion.id} suggestion={suggestion} onPick={onPickSuggestion} />
              ))}
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
