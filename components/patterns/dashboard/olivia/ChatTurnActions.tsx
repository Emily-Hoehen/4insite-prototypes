"use client";

import { useState } from "react";
import { RotateLeftIcon, ThumbsDownIcon, ThumbsUpIcon } from "../../icons";
import styles from "./ChatTurnActions.module.css";

/**
 * The one action row every Olivia reply gets — Figma node 2255:46107
 * ("Post Response Suggestions"). "Reset Conversation" (icon + its own
 * visible label now, not an icon-only button with a hover tooltip),
 * left-aligned; "Rate this response" + thumbs, right-aligned. The
 * separate Copy action (and its own icon) from the row's previous
 * version is gone — Figma's own reference doesn't have one. Previously
 * each rich-content reply (report, stopped presentation, live
 * dashboard, page summary) grew its own slightly different version of
 * this row; this is the one version, used everywhere, so a reply's
 * kind no longer changes which actions are available or what they
 * look like.
 */
export function ChatTurnActions({ onReset }: { onReset: () => void }) {
  const [rating, setRating] = useState<"up" | "down" | null>(null);

  return (
    <div className={styles.row}>
      <button type="button" className={styles.resetButton} onClick={onReset}>
        <RotateLeftIcon className={styles.resetIcon} />
        Reset Conversation
      </button>

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
