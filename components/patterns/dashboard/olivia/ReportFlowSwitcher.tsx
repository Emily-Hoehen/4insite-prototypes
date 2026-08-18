"use client";

import type { ReportFlowVariant } from "./OliviaPanel";
import styles from "./PrototypeSwitcher.module.css";

const OPTIONS: { id: ReportFlowVariant; label: string }[] = [
  { id: "chat", label: "In chat" },
  { id: "external", label: "External" },
];

/**
 * Dev/review control, same spirit as PrototypeSwitcher but for a
 * different axis entirely — which "Generate a Report" experience is
 * live (see ReportFlowVariant), independent of which entry-point
 * option is showing. Reuses PrototypeSwitcher's own styles (a single
 * row, not its full multi-row `.switcher` shell) so the two controls
 * read as one family stacked on the page rather than two different
 * designs. Not part of any Figma design — a comparison tool only.
 */
export function ReportFlowSwitcher({
  variant,
  onChange,
}: {
  variant: ReportFlowVariant;
  onChange: (variant: ReportFlowVariant) => void;
}) {
  return (
    <div className={styles.switcher}>
      <div className={styles.row}>
        <p className={styles.label}>Flow</p>
        <div className={styles.group} role="radiogroup" aria-label="Report generation flow">
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
      </div>
    </div>
  );
}
