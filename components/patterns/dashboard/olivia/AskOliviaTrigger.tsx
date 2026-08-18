"use client";

import { useEffect, useRef, useState } from "react";
import { ChatIcon, SparkleIcon } from "../../icons";
import { TOPIC_LABEL, TOPIC_QUICK_QUESTIONS, type OliviaTopic } from "./oliviaContent";
import { OliviaAvatar } from "./OliviaAvatar";
import styles from "./AskOliviaTrigger.module.css";

/** How many of a topic's canned quick questions the popover offers —
 * a taste, not the full list (the full set shows once you're actually
 * in the panel via "Open Olivia", as the greeting's suggested prompts). */
const POPOVER_QUESTION_COUNT = 3;

/**
 * Contextual entry point into the Olivia panel, placed directly on
 * the dashboard cards her topics map to (see the placement writeup
 * in the project notes). Clicking it no longer jumps straight into
 * the panel — it opens a small popover right next to the trigger
 * with a few of that topic's suggested questions plus a way to open
 * Olivia generally, so you can see what she'd say without leaving
 * the page first. Styled per Figma node 2082:398 ("Olivia Trigger
 * Popover"): a mini version of the panel's own gradient identity
 * header, sitting directly on top of the question list instead of a
 * plain text label.
 */
export function AskOliviaTrigger({
  topic,
  label,
  className,
  onOpenOlivia,
  onAskQuestion,
}: {
  topic: OliviaTopic;
  label: string;
  className?: string;
  /** "Open Olivia" — lands on that topic's greeting, same as the old direct-click behavior. */
  onOpenOlivia: (topic: OliviaTopic) => void;
  /** Clicking one of the suggested questions — opens Olivia and asks it immediately. */
  onAskQuestion: (topic: OliviaTopic, questionText: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const questions = TOPIC_QUICK_QUESTIONS[topic].slice(0, POPOVER_QUESTION_COUNT);

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={[styles.trigger, className].filter(Boolean).join(" ")}
        onClick={() => setIsOpen((open) => !open)}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        title={label}
      >
        <SparkleIcon />
      </button>

      {isOpen && (
        <div className={styles.popover} role="dialog" aria-label={`Ask Olivia about ${TOPIC_LABEL[topic]}`}>
          <div className={styles.popoverHeader}>
            <OliviaAvatar size={36} alt="Olivia" />
            <div>
              <p className={styles.popoverHeaderTitle}>Olivia</p>
              <p className={styles.popoverHeaderSubtitle}>AI Assistant</p>
            </div>
          </div>

          <div className={styles.popoverBody}>
            <p className={styles.popoverHeading}>
              What would you like to know about {TOPIC_LABEL[topic].toLowerCase()}?
            </p>
            <div className={styles.popoverQuestions}>
              {questions.map((q) => (
                <button
                  key={q}
                  type="button"
                  className={styles.popoverQuestion}
                  onClick={() => {
                    setIsOpen(false);
                    onAskQuestion(topic, q);
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={styles.popoverOpen}
              onClick={() => {
                setIsOpen(false);
                onOpenOlivia(topic);
              }}
            >
              <ChatIcon className={styles.popoverOpenIcon} />
              Open Olivia
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
