"use client";

import styles from "./ZeroStateSwitcher.module.css";

export type ZeroStateVariant = "v1" | "v2" | "v3";

const OPTIONS: { id: ZeroStateVariant; label: string }[] = [
  { id: "v1", label: "Zero State 1" },
  { id: "v2", label: "Zero State 2" },
  { id: "v3", label: "Zero State 3" },
];

/**
 * Dev/review control, not part of any Figma design — same reasoning
 * as PrototypeSwitcher (whose visual language this reuses, just a
 * single compact row instead of that one's category + variant pair):
 * lets whoever's looking at this compare HomeGreeting's three current
 * zero-state references (Figma nodes 2273:16012, 2273:15746,
 * 2297:22894) side by side without maintaining separate builds.
 * Previously had a fourth option — an earlier "Zero State 3" (Figma
 * node 2297:22469) was dropped per the user's own request, and what
 * was "Zero State 4" (2297:22141, later updated to 2297:22894)
 * renumbered down to take its place, rather than leaving a gap.
 * Rendered by OliviaDashboard on the home page itself, outside
 * Olivia's own panel — `variant` is owned there (see its own doc
 * comment) since, unlike a piece of state local to one component,
 * more than one caller (OliviaPanel, OliviaFabModal) needs to read it.
 */
export function ZeroStateSwitcher({
  variant,
  onChange,
}: {
  variant: ZeroStateVariant;
  onChange: (variant: ZeroStateVariant) => void;
}) {
  return (
    <div className={styles.switcher} role="radiogroup" aria-label="Zero state version">
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={variant === option.id}
          className={[styles.option, variant === option.id ? styles.optionActive : ""].join(" ")}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
