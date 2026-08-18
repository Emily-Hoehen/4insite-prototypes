"use client";

import { BullhornIcon, ChatIcon, FinancialsIcon, GlobeIcon, ListIcon, PageIcon, PdfIcon, PlayCircleIcon } from "../../icons";
import { SUGGESTED_PROMPTS, type OliviaScope, type OliviaTopic, type SuggestedPrompt } from "./oliviaContent";
import type { OliviaView } from "./OliviaPanel";
import { OliviaAvatar } from "./OliviaAvatar";
import { TopicIcon } from "./TopicIcon";
import styles from "./OliviaViews.module.css";
import outputStyles from "./OutputsAndPerformanceLists.module.css";

/**
 * "panelIcons"'s zero-state — a 108px avatar hero, then three
 * sections: two site-level outputs (offline report, site
 * presentation) as cards, three page-level outputs (summarize, live
 * dashboard, present — all scoped to *this* page) as a pill list, and
 * the usual suggested-prompts pill list. Each mode/scope pair gets
 * its own dedicated card or row here rather than one button plus a
 * "this page or the whole site?" menu — the explicit split doesn't
 * fit OutputsAndPerformanceLists' one-list-of-modes shape (used by
 * PanelContextGreeting, unchanged), so this screen's markup is
 * bespoke; it reuses that file's own card/pill CSS classes directly
 * rather than duplicating the same visual language in a second
 * stylesheet — see OutputsAndPerformanceLists.module.css's own doc
 * comment on those classes.
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
    <div className={styles.homeGreeting}>
      <div className={styles.homeGreetingHero}>
        <OliviaAvatar size={108} alt="Olivia" />

        <div className={styles.homeGreetingText}>
          <p className={styles.greetingHeadline}>Hi Emily, how can I help you today?</p>
        </div>
      </div>

      <div className={outputStyles.listsGroup}>
        <div className={outputStyles.section}>
          <p className={outputStyles.sectionLabelWithIcon}>
            <GlobeIcon /> Generate an output at the site level
          </p>
          <div className={outputStyles.outputGrid}>
            <button type="button" className={outputStyles.outputCard} onClick={() => onOpenMode("report", "site")}>
              <span className={outputStyles.outputCardIconUniform}>
                <PdfIcon />
              </span>
              <span className={outputStyles.outputCardLabel}>Generate an offline report</span>
            </button>
            <button type="button" className={outputStyles.outputCard} onClick={() => onOpenMode("presenter", "site")}>
              <span className={outputStyles.outputCardIconUniform}>
                <BullhornIcon />
              </span>
              <span className={outputStyles.outputCardLabel}>Begin an Olivia site presentation</span>
            </button>
          </div>
        </div>

        <div className={outputStyles.section}>
          <p className={outputStyles.sectionLabelWithIcon}>
            <PageIcon /> Generate page level outputs
          </p>
          <div className={outputStyles.pillList}>
            <button
              type="button"
              className={outputStyles.promptPill}
              onClick={() => onSummarizePage?.()}
            >
              <span className={outputStyles.promptPillIcon}>
                <ListIcon />
              </span>
              Summarize page view
            </button>
            <button type="button" className={outputStyles.promptPill} onClick={() => onOpenMode("dashboard", "page")}>
              <span className={outputStyles.promptPillIcon}>
                <FinancialsIcon />
              </span>
              Generate live dashboard of page view
            </button>
            <button type="button" className={outputStyles.promptPill} onClick={() => onOpenMode("presenter", "page")}>
              <span className={outputStyles.promptPillIcon}>
                <PlayCircleIcon />
              </span>
              Present this page
            </button>
          </div>
        </div>

        <div className={outputStyles.section}>
          <p className={outputStyles.sectionLabelWithIcon}>
            <ChatIcon /> {performanceLabel}
          </p>
          <div className={outputStyles.pillList}>
            {promptSet.map((prompt) => (
              <button
                key={prompt.topic}
                type="button"
                className={outputStyles.promptPill}
                onClick={() => onPickTopic(prompt.topic, prompt.question)}
              >
                <span className={outputStyles.promptPillIcon}>
                  <TopicIcon topic={prompt.topic} />
                </span>
                {prompt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
