import { useState } from "react";
import type { RosterPerson } from "../../../lib/csv";
import {
  BriefcaseIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardCheckIcon,
  ClockIcon,
  GridIcon,
  HandSparklesIcon,
  SprayCanIcon,
  UserGroupIcon,
} from "../icons";
import styles from "./QualityPageContent.module.css";
import { PrototypeSwitcher } from "./olivia/PrototypeSwitcher";
import type { OliviaVariant } from "./olivia/OliviaPanel";
import type { ServiceAnalysis } from "./olivia/oliviaContent";
import { ServiceHistoryModal, buildClickedServiceAnalysis } from "./ServiceHistoryModal";

export type QualityPageContentProps = {
  /** A handful of real roster people to attribute Recent Activity cards
   * to, rather than inventing names. */
  people: RosterPerson[];
  variant?: OliviaVariant;
  onVariantChange?: (v: OliviaVariant) => void;
  /** ServiceHistoryModal's own Olivia FAB — whichever entry point this
   * page's active Olivia variant already uses; see OliviaDashboard's
   * openOliviaFromOverlay for what gets passed in. Optional only so
   * this component doesn't hard-require a caller that hasn't wired
   * Olivia at all. */
  onOpenOlivia?: () => void;
  /** Clicking a service in ServiceHistoryModal's own timeline/filmstrip
   * — see OliviaDashboard's analyzeServiceFromOverlay for what gets
   * passed in. Optional for the same reason onOpenOlivia is. */
  onAnalyzeService?: (analysis: ServiceAnalysis) => void;
  /** Passed straight through to ServiceHistoryModal — see its own doc
   * comment and OliviaDashboard's oliviaDocksBeside for what each
   * means. Both default to `false` so an unwired caller gets the
   * modal's original full-screen, FAB-visible behavior. */
  isOliviaSidePanelOpen?: boolean;
  oliviaDocksBeside?: boolean;
};

export type ActivityType = "Spot Clean" | "Periodic" | "Full Service";

export const ACTIVITY_ICON: Record<ActivityType, React.ReactNode> = {
  "Spot Clean": <SprayCanIcon />,
  Periodic: <BriefcaseIcon />,
  "Full Service": <HandSparklesIcon />,
};

export type ActivityCard = {
  type: ActivityType;
  minutesAgo: number;
  areaCategory: string;
  areaName: string;
  rating: string;
  photo: string;
};

const ACTIVITY: ActivityCard[] = [
  { type: "Spot Clean", minutesAgo: 1, areaCategory: "Restrooms (Passenger)", areaName: "E2-015 Women's North", rating: "5", photo: "/dashboard/audit-photo-2.png" },
  { type: "Periodic", minutesAgo: 1, areaCategory: "Curbside", areaName: "Passenger Pick Up - Doors 12-14", rating: "5", photo: "/dashboard/audit-photo-1.png" },
  { type: "Full Service", minutesAgo: 1, areaCategory: "Restrooms (Passenger)", areaName: "HH1-241 Men's", rating: "4.8", photo: "/dashboard/audit-photo-2.png" },
  { type: "Spot Clean", minutesAgo: 2, areaCategory: "Make-Up Carousel", areaName: "MU 4-5", rating: "5", photo: "/dashboard/audit-photo-1.png" },
  { type: "Full Service", minutesAgo: 2, areaCategory: "Restrooms (Passenger)", areaName: "HH3-229 Women's", rating: "4.87", photo: "/dashboard/audit-photo-2.png" },
];

/**
 * The "Quality" nav link's destination (app/(main)/quality, rendered by
 * OliviaDashboard from app/(main)/layout.tsx) — "Scope
 * of Work." Built from a provided screenshot rather than a Figma node:
 * the dark theme (this project's default, see CLAUDE.md) rather than
 * the screenshot's light variant, and a CSS gradient in place of the
 * screenshot's illustrated sky/plane hero — no such asset exists in
 * this project, and this page's point is Olivia's instant summary of
 * it (see OliviaDashboard/oliviaContent's QUALITY_SUMMARY), not a
 * pixel-exact clone. Recent Activity reuses the same two airport-
 * corridor photos already in public/dashboard/ (audit-photo-1/2)
 * rather than inventing new ones — real 4insite site photography,
 * just not one-per-card.
 */
export function QualityPageContent({
  people,
  variant,
  onVariantChange,
  onOpenOlivia,
  onAnalyzeService,
  isOliviaSidePanelOpen = false,
  oliviaDocksBeside = false,
}: QualityPageContentProps) {
  // Which Recent Activity card's photo opened ServiceHistoryModal, if
  // any — the card itself plus who logged it (the same person already
  // attributed on its own card, see the `person` lookup in the .map
  // below) is everything ServiceHistoryModal needs to build a full
  // history around it.
  const [openHistory, setOpenHistory] = useState<{ card: ActivityCard; person: RosterPerson } | null>(null);

  return (
    <section className={styles.section}>
      <div className={styles.hero}>
        <div className={styles.heroInner} />
      </div>

      {onVariantChange && variant !== undefined && (
        <div className={styles.prototypeRow}>
          <PrototypeSwitcher variant={variant} onChange={onVariantChange} />
        </div>
      )}

      <div className={styles.heroControls}>
        <div className={styles.filterRow}>
          <div className={styles.chipGroup}>
            <span className={styles.chip}>All</span>
            <span className={styles.chipActive}>
              <ClipboardCheckIcon className={styles.chipIcon} />
              Verifications
            </span>
            <span className={styles.chip}>Audits</span>
          </div>
        </div>

        <div className={styles.positionsWrap}>
          <button type="button" className={styles.positionsSelect}>
            All Positions
            <ChevronDownIcon className={styles.positionsSelectIcon} />
          </button>
        </div>
      </div>

      <div className={styles.activityHead}>
        <p className={styles.activityHeading}>Recent Activity</p>
        <div className={styles.activityArrows}>
          <button type="button" className={styles.activityArrow} aria-label="Previous">
            <ChevronLeftIcon />
          </button>
          <button type="button" className={styles.activityArrow} aria-label="Next">
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      <div className={styles.activityRow}>
        {ACTIVITY.map((card, i) => {
          const person = people[i % Math.max(people.length, 1)];
          return (
            <div key={i} className={styles.activityCard}>
              <div className={styles.activityCardHead}>
                {person?.avatar && <img src={person.avatar} alt="" className={styles.activityAvatar} />}
                <div className={styles.activityCardHeadText}>
                  <span className={styles.activityType}>
                    <span className={styles.activityTypeIcon}>{ACTIVITY_ICON[card.type]}</span>
                    {card.type}
                  </span>
                  <span className={styles.activityMeta}>
                    {card.minutesAgo} minute{card.minutesAgo === 1 ? "" : "s"} ago by {person?.name ?? "4insite"}
                  </span>
                </div>
              </div>
              <div className={styles.activityAreaRow}>
                <div>
                  <p className={styles.activityCategory}>{card.areaCategory}</p>
                  <p className={styles.activityArea}>{card.areaName}</p>
                </div>
                <span className={styles.activityRating}>{card.rating}</span>
              </div>
              {person ? (
                <button
                  type="button"
                  className={styles.activityPhotoButton}
                  onClick={() => {
                    setOpenHistory({ card, person });
                    // Olivia switches to this service's own summary the
                    // moment the photo is clicked — not only once the
                    // history modal is open and a timeline/filmstrip row
                    // is clicked inside it (see ServiceHistoryModal's own
                    // selectAndAnalyze, which still re-fires this for
                    // whichever entry the user browses to next).
                    onAnalyzeService?.(buildClickedServiceAnalysis(card, person));
                  }}
                  aria-label={`View service history for ${card.areaName}`}
                >
                  <img src={card.photo} alt="" className={styles.activityPhoto} />
                </button>
              ) : (
                <img src={card.photo} alt="" className={styles.activityPhoto} />
              )}
            </div>
          );
        })}
      </div>

      <p className={styles.statsLine}>
        Today, <span className={styles.statsAccent}>94 Team Members</span> completed{" "}
        <span className={styles.statsAccent}>1,775 Verifications</span> of 2,884 expected verifications across 39
        Area Types and captured <span className={styles.statsAccent}>423h 9m (85%)</span> of 496h 55m paid hours
        while supporting <span className={styles.statsAccent}>524 flights</span>.
      </p>

      {openHistory && (
        <ServiceHistoryModal
          card={openHistory.card}
          clickedPerson={openHistory.person}
          people={people}
          onClose={() => setOpenHistory(null)}
          onOpenOlivia={() => onOpenOlivia?.()}
          onAnalyzeService={(analysis) => onAnalyzeService?.(analysis)}
          isOliviaSidePanelOpen={isOliviaSidePanelOpen}
          oliviaDocksBeside={oliviaDocksBeside}
        />
      )}
    </section>
  );
}
