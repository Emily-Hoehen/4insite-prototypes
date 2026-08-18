"use client";

import { OliviaAvatar } from "./OliviaAvatar";
import styles from "./OliviaFab.module.css";

/**
 * Option 1's "Global Persistent Entry" FAB variant — Olivia's avatar
 * floats over the page, bottom-right, instead of living in the navbar
 * (see OliviaDashboard: the nav's Olivia avatar is omitted entirely
 * for this variant). Per Figma node 2085:1497, a plain 56px circular
 * avatar with no extra chrome — the modal it opens (OliviaFabModal)
 * carries all of the "this is Olivia" framing on its own.
 */
export function OliviaFab({
  onClick,
  isOpen,
  hasNotification = false,
}: {
  onClick: () => void;
  isOpen: boolean;
  /** A proactive, unread thing Olivia has ready (e.g. an instant page
   * summary) — same purple dot + pulse ring treatment as the nav
   * avatar's oliviaHasNotification (see Nav.tsx). */
  hasNotification?: boolean;
}) {
  return (
    <span className={[styles.wrap, hasNotification ? styles.pulse : ""].filter(Boolean).join(" ")}>
      <button
        type="button"
        className={styles.fab}
        onClick={onClick}
        aria-label={isOpen ? "Close Olivia" : hasNotification ? "Open Olivia — new summary ready" : "Open Olivia"}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <OliviaAvatar size={56} alt="Olivia" />
      </button>
      {hasNotification && <span className={styles.notificationDot} aria-hidden="true" />}
    </span>
  );
}
