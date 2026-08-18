"use client";

import { PauseIcon, PlayCircleIcon, StopIcon } from "../../icons";
import { OliviaAvatar } from "./OliviaAvatar";
import styles from "./PresenterMiniBar.module.css";

/**
 * What's left of the in-chat presenter once its side panel is
 * minimized (see OliviaPanel's own "Minimize" header button) — the
 * presentation itself keeps running (PresenterView never unmounts;
 * only .panelSlot's width collapses), so this is that same play state
 * surfaced somewhere still reachable: Olivia's avatar standing in for
 * the FAB most variants don't otherwise show, with the current
 * narration line and transport controls beside it. Rendered by
 * OliviaPanel outside .panelSlot, same reasoning as ReportToast (its
 * own doc comment covers why — overflow: hidden would clip a
 * position: fixed descendant the moment the panel collapses).
 */
export function PresenterMiniBar({
  narrationText,
  isPlaying,
  onTogglePlay,
  onStop,
  onExpand,
}: {
  narrationText: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStop: () => void;
  onExpand: () => void;
}) {
  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.card} onClick={onExpand}>
        <span className={styles.label}>Presenting</span>
        <span className={styles.narration}>{narrationText}</span>
      </button>

      <button
        type="button"
        className={styles.controlButton}
        onClick={onTogglePlay}
        aria-label={isPlaying ? "Pause presentation" : "Resume presentation"}
      >
        {isPlaying ? <PauseIcon /> : <PlayCircleIcon />}
      </button>

      <button type="button" className={styles.controlButton} onClick={onStop} aria-label="Stop presentation">
        <StopIcon />
      </button>

      <button type="button" className={styles.avatarButton} onClick={onExpand} aria-label="Expand Olivia's presentation">
        <OliviaAvatar size={56} alt="Olivia" />
      </button>
    </div>
  );
}
