"use client";

import { SparkleIcon } from "../../icons";
import { PERSONALIZED_SUGGESTIONS, type PersonalizedSuggestion } from "./oliviaContent";
import outputStyles from "./OutputsAndPerformanceLists.module.css";
import styles from "./PersonalizedSuggestions.module.css";

/**
 * A single personalized-suggestion button — a leading sparkle marking
 * it as Olivia's own pick (not a generic prompt), then the full
 * question. Figma node 2364:32149's own treatment: no separate category
 * text (an earlier pass had one — see git history), sparkle leads
 * rather than trails per the user's own request. Shared by
 * HomeGreeting's own merged "Suggested Prompts" list (inlined directly
 * among the generic SUGGESTED_PROMPTS pills, sparkle-tagged ones first)
 * and OliviaSuggestionsPreview's floating chips above the FAB, so the
 * two surfaces can't visually drift apart.
 */
export function PersonalizedSuggestionButton({
  suggestion,
  onPick,
  className,
}: {
  suggestion: PersonalizedSuggestion;
  onPick?: (suggestion: PersonalizedSuggestion) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={[styles.card, className].filter(Boolean).join(" ")}
      onClick={() => onPick?.(suggestion)}
      aria-label={`${suggestion.category}: ${suggestion.question}`}
    >
      <SparkleIcon className={styles.cardSparkle} />
      <span className={styles.cardQuestion}>{suggestion.question}</span>
    </button>
  );
}

/**
 * The older standalone "Personalized Suggestions" section — its own
 * sparkle + label header above a list of PersonalizedSuggestionButtons
 * — kept for PanelContextGreeting/OliviaFabModal's FabGreeting (both
 * comparison-only surfaces, not migrated to HomeGreeting's newer merged
 * "Suggested Prompts" list; see that component's own doc comment for
 * why). Not used by HomeGreeting itself any more.
 */
export function PersonalizedSuggestions({
  onPick,
  suggestions = PERSONALIZED_SUGGESTIONS,
}: {
  onPick?: (suggestion: PersonalizedSuggestion) => void;
  suggestions?: PersonalizedSuggestion[];
}) {
  if (suggestions.length === 0) return null;

  return (
    <div className={outputStyles.section}>
      <div className={styles.head}>
        <SparkleIcon className={styles.headIcon} />
        <p className={outputStyles.sectionLabelBold}>Personalized Suggestions</p>
      </div>
      <div className={styles.cardList}>
        {suggestions.map((suggestion) => (
          <PersonalizedSuggestionButton key={suggestion.id} suggestion={suggestion} onPick={onPick} />
        ))}
      </div>
    </div>
  );
}
