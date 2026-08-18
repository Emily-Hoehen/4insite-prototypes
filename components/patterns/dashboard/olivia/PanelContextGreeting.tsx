"use client";

import type { OliviaScope, OliviaTopic, SuggestedPrompt } from "./oliviaContent";
import type { OliviaView } from "./OliviaPanel";
import { OliviaAvatar } from "./OliviaAvatar";
import { OutputsAndPerformanceLists } from "./OutputsAndPerformanceLists";
import styles from "./OliviaViews.module.css";

/**
 * "panelContext"'s zero-state, per Figma node 2119:1922 — same hero as
 * "panelIcons"'s HomeGreeting, but the two-section list below it runs
 * performance-first (not output-first) and the performance icons are
 * tinted per topic (not one uniform purple) — the inverse of
 * HomeGreeting's own OutputsAndPerformanceLists call. Kept as its own
 * component rather than a HomeGreeting prop since "which one leads"
 * and "which swatch" are both fixed per variant, not a runtime choice.
 */
export function PanelContextGreeting({
  onPickTopic,
  onOpenMode,
  promptSet,
  performanceLabel,
}: {
  onPickTopic: (topic: OliviaTopic, questionText?: string) => void;
  /** Presenter/Dashboard ask "this page or the whole site?" right at
   * the row itself (see OutputsAndPerformanceLists' scope menu) — the
   * chosen scope comes back here alongside the mode. */
  onOpenMode: (mode: Exclude<OliviaView, "ask">, scope: OliviaScope) => void;
  promptSet?: SuggestedPrompt[];
  performanceLabel?: string;
}) {
  return (
    <div className={styles.homeGreeting}>
      <div className={styles.homeGreetingHero}>
        <OliviaAvatar size={72} alt="Olivia" />

        <div className={styles.homeGreetingText}>
          <p className={styles.greetingHeadline}>Hi Emily, how can I help you today?</p>
        </div>
      </div>

      <OutputsAndPerformanceLists
        order="performanceFirst"
        performanceSwatch="perTopic"
        performancePrompts={promptSet}
        performanceLabel={performanceLabel}
        onPickMode={onOpenMode}
        onPickPrompt={onPickTopic}
      />
    </div>
  );
}
