"use client";

import { useEffect, useRef, useState } from "react";
import { GlobeIcon, PageIcon } from "../../icons";
import { SUGGESTED_PROMPTS, TOPIC_SWATCH, type OliviaScope, type OliviaTopic, type SuggestedPrompt } from "./oliviaContent";
import { MODES, TOOLS_MENU_ORDER } from "./OliviaPanel";
import type { OliviaView } from "./OliviaPanel";
import { TopicIcon } from "./TopicIcon";
import styles from "./OutputsAndPerformanceLists.module.css";

/**
 * Presenter/Dashboard's "this page or the whole site?" choice, asked
 * right at the output row itself — the same question the header's own
 * mode icons used to ask via ModeMenuButton's dropdown. Report skips
 * this entirely (see `handlePick` below — it has no scope of its own).
 */
function OutputScopeMenu({ onPick }: { onPick: (scope: OliviaScope) => void }) {
  return (
    <div className={styles.outputScopeMenu} role="menu" aria-label="Scope">
      <button type="button" role="menuitem" className={styles.outputScopeMenuItem} onClick={() => onPick("page")}>
        <PageIcon className={styles.outputScopeMenuIcon} />
        This Page
      </button>
      <button type="button" role="menuitem" className={styles.outputScopeMenuItem} onClick={() => onPick("site")}>
        <GlobeIcon className={styles.outputScopeMenuIcon} />
        All Sites
      </button>
    </div>
  );
}

/**
 * The paired "Generate an Output" / "Ask about your site performance"
 * lists shared by "panelIcons"'s zero-state (Figma node 2123:2012,
 * output first) and "panelContext"'s (node 2119:1922, performance
 * first) — same two lists, different order and different treatment
 * for the performance icons (uniform purple vs. per-topic color; see
 * `performanceSwatch`).
 *
 * HomeGreeting no longer uses this component for its own zero state —
 * that screen's "site level" vs. "page level" split doesn't fit this
 * component's one-list-of-modes shape, so it's bespoke there now (see
 * HomeGreeting.tsx, which imports this file's own CSS module directly
 * for the card/pill classes rather than duplicating them). This is
 * still exactly what PanelContextGreeting uses, unchanged. The FAB
 * modal has its own near-identical version (OliviaFabModal's
 * FabGreeting) predating this component and left as-is.
 */
export function OutputsAndPerformanceLists({
  order,
  performanceSwatch,
  performancePrompts = SUGGESTED_PROMPTS,
  performanceLabel = "Ask about your site performance",
  onPickMode,
  onPickPrompt,
}: {
  order: "outputFirst" | "performanceFirst";
  /** "panelIcons" (node 2123:2012): one uniform purple tint.
   * "panelContext" (node 2119:1922): a distinct color per topic. */
  performanceSwatch: "uniform" | "perTopic";
  /** Defaults to the mixed safety/complaint/audit set — overridden with
   * a single topic's own TOPIC_SUGGESTED_PROMPTS once Olivia already
   * knows that's the context she opened into (e.g. the Safety page). */
  performancePrompts?: SuggestedPrompt[];
  /** Only pass this to override the default (e.g. Safety's "Ask about safety"). */
  performanceLabel?: string;
  /** `scope` is only meaningful for presenter/dashboard — see
   * `handlePick` below, which asks it via `OutputScopeMenu` before
   * ever calling this; report always comes back with "page" since it
   * has no scope concept of its own. */
  onPickMode: (mode: Exclude<OliviaView, "ask">, scope: OliviaScope) => void;
  onPickPrompt: (topic: OliviaTopic, question: string) => void;
}) {
  // Presenter/Dashboard ask "this page or the whole site?" before
  // opening — the same question the header's mode icons used to ask
  // via their own dropdown (ModeMenuButton). Report skips straight
  // through: it has no scope of its own (see MODES/OliviaPanel).
  const [scopeMenuFor, setScopeMenuFor] = useState<Exclude<OliviaView, "ask"> | null>(null);
  const scopeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scopeMenuFor) return;
    const handleClick = (event: MouseEvent) => {
      if (!scopeMenuRef.current?.contains(event.target as Node)) setScopeMenuFor(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [scopeMenuFor]);

  const handlePick = (mode: Exclude<OliviaView, "ask">) => {
    if (mode === "report") {
      onPickMode(mode, "page");
      return;
    }
    setScopeMenuFor((prev) => (prev === mode ? null : mode));
  };

  const pickScope = (mode: Exclude<OliviaView, "ask">, scope: OliviaScope) => {
    setScopeMenuFor(null);
    onPickMode(mode, scope);
  };

  const outputSection = (
    // Its own bordered, tinted frame — not just a per-row accent — so
    // "Generate an output" reads as a distinct category at a glance,
    // not just three more rows in the same list as the prompts below.
    <div className={[styles.section, styles.outputSection].join(" ")}>
      <p className={[styles.sectionLabel, styles.outputSectionLabel].join(" ")}>Generate an output</p>
      <div className={styles.sectionList}>
        {TOOLS_MENU_ORDER.map((id) => {
          const mode = MODES.find((m) => m.id === id)!;
          const menuOpen = scopeMenuFor === mode.id;
          return (
            <div key={mode.id} className={styles.suggestItemWrap} ref={menuOpen ? scopeMenuRef : undefined}>
              <button
                type="button"
                className={styles.suggestItem}
                onClick={() => handlePick(mode.id)}
                aria-haspopup={mode.id !== "report" ? "menu" : undefined}
                aria-expanded={mode.id !== "report" ? menuOpen : undefined}
              >
                <span className={styles.suggestIcon} style={{ backgroundColor: mode.swatch.bg, color: mode.swatch.color }}>
                  {mode.icon}
                </span>
                {mode.toolsLabel}
              </button>
              {menuOpen && <OutputScopeMenu onPick={(scope) => pickScope(mode.id, scope)} />}
            </div>
          );
        })}
      </div>
    </div>
  );

  const performanceSection = (
    <div className={styles.section}>
      <p className={styles.sectionLabel}>{performanceLabel}</p>
      <div className={styles.sectionList}>
        {performancePrompts.map((prompt: SuggestedPrompt) => {
          const swatch = performanceSwatch === "perTopic" ? TOPIC_SWATCH[prompt.topic] : undefined;
          return (
            <button
              key={prompt.topic}
              type="button"
              className={styles.suggestItem}
              onClick={() => onPickPrompt(prompt.topic, prompt.question)}
            >
              <span
                className={swatch ? styles.suggestIcon : styles.suggestIconUniform}
                style={swatch ? { backgroundColor: swatch.bg, color: swatch.color } : undefined}
              >
                <TopicIcon topic={prompt.topic} />
              </span>
              {prompt.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={styles.listsGroup}>
      {order === "outputFirst" ? (
        <>
          {outputSection}
          {performanceSection}
        </>
      ) : (
        <>
          {performanceSection}
          {outputSection}
        </>
      )}
    </div>
  );
}
