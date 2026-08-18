"use client";

import { useState } from "react";
import { CopyIcon, RotateLeftIcon, ThumbsDownIcon, ThumbsUpIcon } from "../../icons";
import styles from "./ChatTurnActions.module.css";

/**
 * The one action row every Olivia reply gets, no matter what kind of
 * reply it is — Figma node 2212:43095. Copy + reset, left-aligned with
 * their own hover tooltips; "Rate this response" + thumbs, right-
 * aligned. Previously each rich-content reply (report, stopped
 * presentation, live dashboard, page summary) grew its own slightly
 * different version of this row — one with reset but no copy, one
 * with copy + sync instead of copy + reset, one folded inside the
 * bubble instead of after it — while plain replies got a bare reset
 * icon with no copy or rate at all. This is the one version, used
 * everywhere, so a reply's kind no longer changes which actions are
 * available or what they look like.
 */
export function ChatTurnActions({ onCopy, onReset }: { onCopy: () => void; onReset: () => void }) {
  const [rating, setRating] = useState<"up" | "down" | null>(null);

  return (
    <div className={styles.row}>
      <div className={styles.leftGroup}>
        <button type="button" className={styles.iconButton} onClick={onCopy} aria-label="Copy response">
          <CopyIcon />
          <span className={styles.tooltip} role="tooltip">
            Copy
          </span>
        </button>
        <button type="button" className={styles.iconButton} onClick={onReset} aria-label="Reset conversation">
          <RotateLeftIcon />
          <span className={styles.tooltip} role="tooltip">
            Reset conversation
          </span>
        </button>
      </div>

      <div className={styles.rateGroup}>
        <span className={styles.rateLabel}>Rate this response</span>
        <button
          type="button"
          className={[styles.rateButton, rating === "up" ? styles.rateButtonActive : ""].filter(Boolean).join(" ")}
          aria-pressed={rating === "up"}
          aria-label="Helpful"
          onClick={() => setRating((r) => (r === "up" ? null : "up"))}
        >
          <ThumbsUpIcon />
        </button>
        <button
          type="button"
          className={[styles.rateButton, rating === "down" ? styles.rateButtonActive : ""].filter(Boolean).join(" ")}
          aria-pressed={rating === "down"}
          aria-label="Not helpful"
          onClick={() => setRating((r) => (r === "down" ? null : "down"))}
        >
          <ThumbsDownIcon />
        </button>
      </div>
    </div>
  );
}
