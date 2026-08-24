"use client";

import { SparkleIcon, StarIcon, TrophyIcon, UserGroupIcon } from "../../icons";
import { PERSONALIZED_SUGGESTIONS, type PersonalizedSuggestion } from "./oliviaContent";
import outputStyles from "./OutputsAndPerformanceLists.module.css";
import styles from "./PersonalizedSuggestions.module.css";

/** Per-suggestion icon, keyed by id — kept here (not on the content
 * object itself) so oliviaContent.ts stays plain data with no JSX/
 * React import of its own, same separation OliviaPanel's MODES and
 * TOPIC_SWATCH already draw between copy and presentation. Matches
 * Figma node 2360:30996's own icon per card: user-group, star,
 * trophy-alt (fa-users renders identically to fa-user-group — Font
 * Awesome 6+ treats them as aliases of the same glyph — so this reuses
 * the existing UserGroupIcon rather than adding a second one). */
const SUGGESTION_ICON: Record<string, React.ReactNode> = {
  staffingDetails: <UserGroupIcon />,
  performanceAnalysis: <StarIcon />,
  siteScorecards: <TrophyIcon />,
};

/**
 * "Personalized Suggestions" (Figma node 2360:30996, latest pull) — a
 * white sparkle + label row, then one flat purple-tinted card per
 * suggestion: a purple icon beside its full purple question, one row,
 * no separate category text (an earlier pass stacked a category title
 * over the question instead — see git history — this pull drops it in
 * favor of an icon per suggestion). The card list carries its own
 * tighter 12px gap (.cardList), separate from the 16px between the
 * header row and that list. This is also what the nav avatar/FAB's
 * own notification badge (see Nav.tsx/OliviaFab.tsx) is counting
 * down — opening Olivia to this screen is what clears it.
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
          <button
            key={suggestion.id}
            type="button"
            className={styles.card}
            onClick={() => onPick?.(suggestion)}
            aria-label={`${suggestion.category}: ${suggestion.question}`}
          >
            <span className={styles.cardIcon} aria-hidden="true">
              {SUGGESTION_ICON[suggestion.id]}
            </span>
            <span className={styles.cardQuestion}>{suggestion.question}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
