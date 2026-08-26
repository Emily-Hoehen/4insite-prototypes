"use client";

import { SparkleIcon } from "../../icons";
import { PERSONALIZED_SUGGESTIONS, type PersonalizedSuggestion } from "./oliviaContent";
import styles from "./OliviaSuggestionsPreview.module.css";

/**
 * A floating preview of Olivia's personalized suggestions, stacked
 * above the FAB before she's ever been opened — the same content
 * that's waiting in the zero state's own "Suggested Prompts" list
 * (see HomeGreeting/PersonalizedSuggestionButton), surfaced a beat
 * earlier so the FAB's own notification dot isn't the only hint
 * something's there. Picking one opens Olivia straight to that
 * exchange (see OliviaDashboard's openOliviaWithSuggestion) instead of
 * the zero state — same "ask it" behavior as clicking the same row
 * inside the panel.
 *
 * Only rendered alongside the FAB itself ("fab"/"fabPanel" variants —
 * see OliviaDashboard), and only while there's something unseen to
 * preview (hasUnseenSuggestions) — once Olivia's opened once, this
 * disappears the same way the notification dot does.
 */
export function OliviaSuggestionsPreview({
  onPick,
  suggestions = PERSONALIZED_SUGGESTIONS,
}: {
  onPick: (suggestion: PersonalizedSuggestion) => void;
  suggestions?: PersonalizedSuggestion[];
}) {
  if (suggestions.length === 0) return null;

  return (
    <div className={styles.stack}>
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.id}
          type="button"
          className={styles.chip}
          onClick={() => onPick(suggestion)}
          aria-label={`${suggestion.category}: ${suggestion.question}`}
        >
          <SparkleIcon className={styles.chipSparkle} />
          <span className={styles.chipText}>{suggestion.question}</span>
        </button>
      ))}
    </div>
  );
}
