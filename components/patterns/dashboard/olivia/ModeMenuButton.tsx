"use client";

import { ReactNode } from "react";
import styles from "./OliviaPanel.module.css";

/**
 * One of the header's mode icons (Reports / Presentation, per
 * HEADER_MODE_ORDER) — a plain icon button with a hover/focus tooltip
 * carrying its name, since an icon-only toolbar means the name alone
 * isn't discoverable at a glance. Each one is a fixed, single action
 * now (see OliviaPanel's own call site) rather than opening a "this
 * page or the whole site?" menu first, so there's nothing here to
 * track open/closed — the tooltip is pure CSS (:hover/:focus-visible,
 * see .modeTooltip in OliviaPanel.module.css). No active/toggled state
 * either — Site Presentation used to highlight itself while `view`
 * was "presenter", but that read as a confusing, permanent "stuck
 * pressed" look for the whole presentation rather than a toggle, so
 * it was dropped; Report never could show one in the first place
 * (opens a modal, never actually becomes the view).
 */
export function ModeMenuButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <div className={styles.modeButtonWrap}>
      <button type="button" className={styles.modeButton} aria-label={label} onClick={onClick}>
        {icon}
      </button>

      <span className={styles.modeTooltip}>
        <span className={styles.modeTooltipLabel}>{label}</span>
      </span>
    </div>
  );
}
