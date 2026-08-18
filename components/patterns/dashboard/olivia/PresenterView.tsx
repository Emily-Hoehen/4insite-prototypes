"use client";

import { Dispatch, SetStateAction, useEffect } from "react";
import { PauseIcon, PlayCircleIcon, StopIcon } from "../../icons";
import { getPresenterSlides, OliviaScope, OliviaTopic, PRESENTER_INTRO_SLIDE, presenterNarration } from "./oliviaContent";
import { OliviaAvatar } from "./OliviaAvatar";
import styles from "./OliviaViews.module.css";

/** How long each narrated beat stays on screen before auto-advancing —
 * longer than the old chevron-driven deck (4500ms) since a slide is
 * now a full sentence read aloud (via the caption itself, see
 * presenterNarration in oliviaContent.ts), not a headline glanced at. */
export const SLIDE_DURATION_MS = 6000;

export function PresenterView({
  topic,
  isLoading,
  scope,
  onStop,
  index,
  setIndex,
  isPlaying,
  setIsPlaying,
}: {
  topic: OliviaTopic | null;
  /** Kept for parity with the other mode views (AskView passes the
   * same `isThinking` flag around) — this view doesn't currently use
   * it, since presenting doesn't wait on a canned reply the way
   * asking a question does. */
  isLoading: boolean;
  scope: OliviaScope;
  /** Ends the presentation and returns to the chat, where Olivia
   * confirms it in her own reply (see useOliviaSession's
   * stopPresentation) — distinct from pause, which just holds the
   * current slide without leaving this view. */
  onStop: () => void;
  /** Slide progress lives in useOliviaSession, not local state here —
   * see its own doc comment on presenterIndex/isPresenterPlaying for
   * why: OliviaPanel's mini presenter bar needs to read and control the
   * same play state once the panel is minimized, without a second copy
   * of it drifting out of sync. */
  index: number;
  setIndex: Dispatch<SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
}) {
  const slides = [PRESENTER_INTRO_SLIDE, ...getPresenterSlides(topic, scope)];

  useEffect(() => {
    setIndex(0);
    setIsPlaying(true);
  }, [topic, scope]);

  const isLastSlide = index === slides.length - 1;

  useEffect(() => {
    if (!isPlaying) return;
    if (isLastSlide) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setIndex((i) => i + 1), SLIDE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [isPlaying, index, isLastSlide]);

  const slide = slides[index];
  const echoText = scope === "site" ? "Present the entire site" : "Present this page";

  return (
    <div className={styles.askView}>
      <div className={styles.chatCard}>
        <div className={styles.presenterBody}>
          {/* The request that opened this view, echoed the same way any
              other turn is (Figma node 2188:13194) — not a separate
              "you asked for this" banner, just the ordinary user bubble. */}
          <div className={[styles.bubbleRow, styles.bubbleRowUser].join(" ")}>
            <div className={styles.userMessageHead}>
              <p className={styles.userMessageName}>Emily</p>
              <span className={styles.userAvatar} aria-hidden="true">
                EH
              </span>
            </div>
            <div className={[styles.bubble, styles.bubbleUser].join(" ")}>{echoText}</div>
          </div>

          <div className={styles.presenterStage}>
            <OliviaAvatar size={146} alt="Olivia" />
            <p className={styles.presenterNarration} aria-live="polite">
              {presenterNarration(slide)}
            </p>
            {/* Play/pause first, stop second — Figma node 2209:33376's own
                reading order (the primary transport control leads, stop
                trails as the secondary action). */}
            <div className={styles.presenterControls}>
              <button
                type="button"
                className={styles.presenterPlayButton}
                disabled={isLoading}
                onClick={() => {
                  if (isLastSlide && !isPlaying) setIndex(0);
                  setIsPlaying((p) => !p);
                }}
                aria-label={isPlaying ? "Pause presentation" : isLastSlide ? "Restart presentation" : "Play presentation"}
              >
                {isPlaying ? <PauseIcon /> : <PlayCircleIcon />}
              </button>
              <button
                type="button"
                className={styles.presenterStopButton}
                onClick={onStop}
                aria-label="Stop presentation"
              >
                <StopIcon />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.chatCardFooter}>
          <div className={styles.presenterFooterRow}>
            <button type="button" className={styles.reportDownloadButton} onClick={() => window.print()}>
              Download Presentation Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
