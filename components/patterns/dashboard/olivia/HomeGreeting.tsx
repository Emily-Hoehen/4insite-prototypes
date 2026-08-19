"use client";

import { BullhornIcon, FinancialsIcon, ListIcon, PdfIcon, VolumeIcon } from "../../icons";
import { SUGGESTED_PROMPTS, type OliviaScope, type OliviaTopic, type SuggestedPrompt } from "./oliviaContent";
import type { OliviaView } from "./OliviaPanel";
import { OliviaAvatar } from "./OliviaAvatar";
import type { ZeroStateVariant } from "./ZeroStateSwitcher";
import styles from "./OliviaViews.module.css";
import outputStyles from "./OutputsAndPerformanceLists.module.css";

/**
 * "panelIcons"'s zero-state — a hero row (avatar + greeting), then
 * three sections: site-level outputs, page-level outputs (summarize,
 * live dashboard, present — all scoped to *this* page), and the usual
 * suggested-prompts pill list. Each mode/scope pair gets its own
 * dedicated row/card here rather than one button plus a "this page or
 * the whole site?" menu — the explicit split doesn't fit
 * OutputsAndPerformanceLists' one-list-of-modes shape (used by
 * PanelContextGreeting, unchanged), so this screen's markup is
 * bespoke; it reuses that file's own row/grid/pill CSS classes
 * directly rather than duplicating the same visual language in a
 * second stylesheet — see OutputsAndPerformanceLists.module.css's own
 * doc comment on those classes.
 *
 * Three Figma references exist for this screen, all current, so
 * `variant` (ZeroStateSwitcher, rendered by OliviaDashboard on the
 * home page itself — not part of any of these designs, and not this
 * component's own concern) picks between them rather than one
 * replacing the others:
 *  - "v1" (Figma node 2273:16012): row hero (70px avatar beside the
 *    text, left-aligned). Site-level is a 3-up card grid reading
 *    "Offline Report" (two lines) / "Site Presentation" / "Site Live
 *    Dashboard" (two lines) under a bold white left-aligned header.
 *    Page-level pills each carry their own icon + accent color and
 *    read "Summarize this page" / "View live Dashboard of Page" /
 *    "Present Page" — exact casing per that reference's own copy.
 *  - "v2" (Figma node 2273:15746, latest revision): same row hero.
 *    Site-level is a vertical list of full-width icon-left rows
 *    instead, reading "Generate Offline Report" / "Begin Site
 *    Presentation" / "View Live Dashboard of Site". Page-level pills
 *    drop the icon and per-item color, sharing one plain
 *    uniform-purple pill instead, reading "Summarize this Page" /
 *    "View Live Dashboard of Page" / "Present this Page".
 *  - "v3" (Figma node 2297:22894 — an earlier "Zero State 3" reference,
 *    2297:22469, was dropped per the user's own request, and this one
 *    renumbered down from "Zero State 4" to take its place): a
 *    stacked, centered hero (101px avatar above the text) — a third
 *    hero treatment, not a reuse of PanelContextGreeting's own stacked
 *    one (different gap and text size; see .homeGreetingHeroCentered).
 *    Site-level is the same 3-up card grid shape as v1, reading
 *    "Download Offline Report" (two lines) / "Begin a Site
 *    Presentation" / "View Site Dashboard". Drops every section header
 *    entirely, and moves the page-level pills out of the centered
 *    stack altogether — they pin to the bottom of the panel instead,
 *    in one full-bleed-bordered, horizontally-scrolling row (see
 *    .pillRowScrollFullBleed's own comment on why it needs a modifier
 *    of its own rather than just .pillRowScroll directly) — same
 *    treatment and copy/order AskView's own post-reply suggested-
 *    prompts row now shares (see its own comment on why), reading
 *    "Summarize Page" / "Present Page" / "View Page Dashboard" in
 *    that order.
 */
export function HomeGreeting({
  variant,
  onPickTopic,
  onOpenMode,
  onSummarizePage,
  promptSet = SUGGESTED_PROMPTS,
  performanceLabel = "Or start with a suggested prompt",
}: {
  variant: ZeroStateVariant;
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
  const isV2 = variant === "v2";
  const isV3 = variant === "v3";

  const sectionLabelClass = outputStyles.sectionLabelBold;

  const hero = isV3 ? (
    <div className={styles.homeGreetingHeroCentered}>
      <OliviaAvatar size={101} alt="Olivia" />
      <p className={styles.greetingHeadline}>
        Hi Emily,
        <br />
        how can I help you today?
      </p>
    </div>
  ) : (
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
  );

  const siteLevelSection = (
    <div className={outputStyles.section}>
      {!isV3 && <p className={sectionLabelClass}>Generate site level outputs</p>}
      {isV2 ? (
        <div className={outputStyles.outputList}>
          <button type="button" className={outputStyles.outputRowV2} onClick={() => onOpenMode("report", "site")}>
            <span className={outputStyles.outputIconUniform}>
              <PdfIcon />
            </span>
            <span className={outputStyles.outputRowLabel}>Generate Offline Report</span>
          </button>
          <button type="button" className={outputStyles.outputRowV2} onClick={() => onOpenMode("presenter", "site")}>
            <span className={outputStyles.outputIconUniform}>
              <BullhornIcon />
            </span>
            <span className={outputStyles.outputRowLabel}>Begin Site Presentation</span>
          </button>
          <button type="button" className={outputStyles.outputRowV2} onClick={() => onOpenMode("dashboard", "site")}>
            <span className={outputStyles.outputIconUniform}>
              <FinancialsIcon />
            </span>
            <span className={outputStyles.outputRowLabel}>View Live Dashboard of Site</span>
          </button>
        </div>
      ) : (
        <div className={outputStyles.outputGrid}>
          <button type="button" className={outputStyles.outputCard} onClick={() => onOpenMode("report", "site")}>
            <span className={outputStyles.outputIconUniform}>
              <PdfIcon />
            </span>
            <span className={outputStyles.outputCardLabel}>
              {isV3 ? (
                <>
                  Download
                  <br />
                  Offline Report
                </>
              ) : (
                <>
                  Offline
                  <br />
                  Report
                </>
              )}
            </span>
          </button>
          <button type="button" className={outputStyles.outputCard} onClick={() => onOpenMode("presenter", "site")}>
            <span className={outputStyles.outputIconUniform}>
              <BullhornIcon />
            </span>
            <span className={outputStyles.outputCardLabel}>{isV3 ? "Begin a Site Presentation" : "Site Presentation"}</span>
          </button>
          <button type="button" className={outputStyles.outputCard} onClick={() => onOpenMode("dashboard", "site")}>
            <span className={outputStyles.outputIconUniform}>
              <FinancialsIcon />
            </span>
            <span className={outputStyles.outputCardLabel}>
              {isV3 ? (
                "View Site Dashboard"
              ) : (
                <>
                  Site Live
                  <br />
                  Dashboard
                </>
              )}
            </span>
          </button>
        </div>
      )}
    </div>
  );

  // The three page-level actions, one <button> each — shared across
  // every variant's own wrapper/order below rather than three separate
  // copies, since only copy/style/order differ, never the actions
  // themselves.
  const summarizeButton = (className: string, label: string) => (
    <button type="button" className={className} onClick={() => onSummarizePage?.()}>
      {className !== outputStyles.promptPill && (
        <span className={outputStyles.promptPillIcon}>
          <ListIcon />
        </span>
      )}
      {label}
    </button>
  );
  const dashboardButton = (className: string, label: string) => (
    <button type="button" className={className} onClick={() => onOpenMode("dashboard", "page")}>
      {className !== outputStyles.promptPill && (
        <span className={outputStyles.promptPillIcon}>
          <FinancialsIcon />
        </span>
      )}
      {label}
    </button>
  );
  const presentButton = (className: string, label: string) => (
    <button type="button" className={className} onClick={() => onOpenMode("presenter", "page")}>
      {className !== outputStyles.promptPill && (
        <span className={outputStyles.promptPillIcon}>
          <VolumeIcon />
        </span>
      )}
      {label}
    </button>
  );

  const tight = (base: string) => [base, outputStyles.promptPillTight].join(" ");

  let pageLevelPills: React.ReactNode;
  if (isV2) {
    pageLevelPills = (
      <>
        {summarizeButton(outputStyles.promptPill, "Summarize this Page")}
        {dashboardButton(outputStyles.promptPill, "View Live Dashboard of Page")}
        {presentButton(outputStyles.promptPill, "Present this Page")}
      </>
    );
  } else if (isV3) {
    pageLevelPills = (
      <>
        {summarizeButton(tight(outputStyles.promptPillPrimaryBlue), "Summarize Page")}
        {presentButton(tight(outputStyles.promptPillPinkle), "Present Page")}
        {dashboardButton(tight(outputStyles.promptPillRedOrange), "View Page Dashboard")}
      </>
    );
  } else {
    pageLevelPills = (
      <>
        {summarizeButton(outputStyles.promptPillPrimaryBlue, "Summarize this page")}
        {dashboardButton(outputStyles.promptPillRedOrange, "View live Dashboard of Page")}
        {presentButton(outputStyles.promptPillPinkle, "Present Page")}
      </>
    );
  }

  const suggestedPrompts = (
    <div className={outputStyles.section}>
      {!isV3 && <p className={sectionLabelClass}>{performanceLabel}</p>}
      <div className={isV3 ? outputStyles.pillListCentered : outputStyles.pillList}>
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
  );

  if (isV3) {
    return (
      <div className={[styles.homeGreeting, styles.homeGreetingGap40, styles.homeGreetingSplit].join(" ")}>
        <div className={styles.homeGreetingCenterGroup}>
          {hero}
          <div className={outputStyles.listsGroup}>
            {siteLevelSection}
            {suggestedPrompts}
          </div>
        </div>
        <div className={styles.pillRowScrollFullBleed}>{pageLevelPills}</div>
      </div>
    );
  }

  return (
    <div className={[styles.homeGreeting, styles.homeGreetingGap40].join(" ")}>
      {hero}
      <div className={outputStyles.listsGroup}>
        {siteLevelSection}
        <div className={outputStyles.section}>
          <p className={sectionLabelClass}>View page level insights</p>
          <div className={outputStyles.pillList}>{pageLevelPills}</div>
        </div>
        {suggestedPrompts}
      </div>
    </div>
  );
}
