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
  notificationCount,
}: {
  onClick: () => void;
  isOpen: boolean;
  /** A proactive, unread thing Olivia has ready (e.g. an instant page
   * summary) — same purple dot + pulse ring treatment as the nav
   * avatar's oliviaHasNotification (see Nav.tsx). */
  hasNotification?: boolean;
  /** When set (>0), shows a numbered badge instead of the plain dot —
   * e.g. how many personalized suggestions are waiting in the zero
   * state (see PERSONALIZED_SUGGESTIONS) — same "dot vs. count" split
   * as Nav's own oliviaNotificationCount. */
  notificationCount?: number;
}) {
  return (
    <span className={[styles.wrap, hasNotification ? styles.pulse : ""].filter(Boolean).join(" ")}>
      <button
        type="button"
        className={styles.fab}
        onClick={onClick}
        aria-label={
          isOpen
            ? "Close Olivia"
            : hasNotification
            ? notificationCount
              ? `Open Olivia — ${notificationCount} new suggestions ready`
              : "Open Olivia — new summary ready"
            : "Open Olivia"
        }
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <OliviaAvatar size={56} alt="Olivia" />
      </button>
      {hasNotification &&
        (notificationCount ? (
          <span className={styles.notificationBadge} aria-hidden="true">
            {notificationCount}
          </span>
        ) : (
          <span className={styles.notificationDot} aria-hidden="true" />
        ))}
    </span>
  );
}
