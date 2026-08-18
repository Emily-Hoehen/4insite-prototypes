"use client";

import { useEffect, useState } from "react";
import { AreaSparkline } from "../charts";
import { BriefcaseIcon, CloseIcon, PauseIcon, PinIcon, PlayCircleIcon } from "../../icons";
import { getPresenterSlides, OliviaTopic, PRESENTER_INTRO_SLIDE, presenterNarration, SITE_LABEL } from "./oliviaContent";
import { OliviaAvatar } from "./OliviaAvatar";
import { OliviaMark } from "./OliviaMark";
import styles from "./ExternalPresenterView.module.css";

const SLIDE_DURATION_MS = 6000;

/** A steady, generally-upward trend line for the "device" mockup's
 * chart — decorative (it isn't tied to any one topic's real numbers,
 * since the stage is meant to evoke "a live dashboard," not repeat
 * the caption rail's own stat verbatim as a second chart). */
const TREND_POINTS = [38, 44, 41, 52, 58, 55, 64, 70, 66, 74, 80, 78];

/**
 * "Present the entire site," "external" flow — a full-viewport
 * cinematic experience (Figma's own reference screenshot: a tilted
 * dashboard "device" on a moody gradient stage, paired with a
 * talking-Olivia video rail and live captions) rather than the ordinary
 * in-chat PresenterView. Opened by useOliviaSession's pickMode/openMode
 * for that one specific combination — see ReportFlowVariant's doc
 * comment for what "external" means elsewhere (the Offline Report
 * flow it was originally built for).
 *
 * Rendered as a sibling of .panel/.modal (same reasoning as
 * ReportGenerateModal/ReportToast): a position: fixed overlay has to
 * outlive the panel's own open/close transform.
 *
 * "Read stats off the screen (don't use sound)" — there's no audio
 * here either; the caption rail is the narration, same approach as
 * PresenterView, just staged as a video call's closed captions
 * instead of a chat bubble's headline.
 */
export function ExternalPresenterView({ topic, onClose }: { topic: OliviaTopic | null; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const slides = [PRESENTER_INTRO_SLIDE, ...getPresenterSlides(topic, "site")];
  const isLastSlide = index === slides.length - 1;
  const slide = slides[index];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!isPlaying) return;
    if (isLastSlide) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setIndex((i) => i + 1), SLIDE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [isPlaying, index, isLastSlide]);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Site-wide presentation">
      <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close presentation">
        <CloseIcon />
      </button>

      <div className={styles.stage}>
        <span className={styles.stageTag}>Site-Wide Overview</span>

        <div className={styles.device}>
          <div className={styles.deviceHead}>
            <span className={styles.deviceHeadLabel}>Program Trend</span>
            <span className={styles.deviceHeadMeta}>{SITE_LABEL}</span>
          </div>
          <AreaSparkline points={TREND_POINTS} width={340} height={96} color="var(--color-datavis-purple-100)" />
        </div>

        <div className={styles.stageFooter}>
          <div className={styles.stageBrand}>
            <BriefcaseIcon className={styles.stageBrandIcon} />
            SBM
            <PinIcon className={styles.stageBrandIcon} />
            {SITE_LABEL}
          </div>
          <h2 className={styles.stageHeadline}>{slide.headline}</h2>
        </div>
      </div>

      <div className={styles.rail}>
        <div className={styles.videoFrame}>
          <OliviaAvatar size={180} alt="Olivia" />
        </div>

        <div className={styles.captionBox} aria-live="polite">
          <OliviaMark compact />
          <p className={styles.captionText}>{presenterNarration(slide)}</p>
        </div>

        <button
          type="button"
          className={styles.playButton}
          onClick={() => {
            if (isLastSlide && !isPlaying) setIndex(0);
            setIsPlaying((p) => !p);
          }}
          aria-label={isPlaying ? "Pause presentation" : isLastSlide ? "Restart presentation" : "Play presentation"}
        >
          {isPlaying ? <PauseIcon /> : <PlayCircleIcon />}
          {isPlaying ? "Pause" : isLastSlide ? "Restart" : "Play"}
        </button>
      </div>
    </div>
  );
}
