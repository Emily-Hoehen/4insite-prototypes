"use client";

import { useEffect, useState } from "react";
import type { RosterPerson } from "../../../lib/csv";
import {
  CalendarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClipboardCheckIcon,
  ClockIcon,
  CloseIcon,
  GridIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "../icons";
import { OliviaFab } from "./olivia/OliviaFab";
import type { ServiceAnalysis } from "./olivia/oliviaContent";
import type { ActivityCard, ActivityType } from "./QualityPageContent";
import { ACTIVITY_ICON } from "./QualityPageContent";
import styles from "./ServiceHistoryModal.module.css";

type HistoryEntry = {
  id: string;
  personOffset: number;
  type: ActivityType;
  rating: string;
  dateLabel: string;
  timeLabel: string;
  fullLabel: string;
  start: string;
  serviced: string;
  photo: string;
  votesUp?: number;
  votesDown?: number;
};

/** A plausible run of recent service events leading up to the clicked
 * card's own — same two-photo/three-type sample-data approach as
 * QualityPageContent's own ACTIVITY (see its doc comment): every
 * asset shows this same shape of history rather than 100+ unique
 * fabricated events, with the FIRST entry standing in for the exact
 * card that was clicked (its own type/rating/photo carry through).
 * Every string here is a literal display value, not computed from a
 * Date — this is decorative sample data, and formatting a real Date
 * through an explicit America/New_York Intl.DateTimeFormat would still
 * depend on the *viewer's own clock* for which calendar day "now" is,
 * which would drift from "today"'s date shown elsewhere in this
 * prototype and risk a server/client render mismatch besides. */
const ENTRY_TEMPLATE: Omit<HistoryEntry, "type" | "rating" | "photo">[] = [
  {
    id: "e0",
    personOffset: 0,
    dateLabel: "Aug 18, 2026",
    timeLabel: "12:23 PM EDT",
    fullLabel: "Tuesday, August 18, 2026 at 12:23 PM EDT",
    start: "12:19 PM EDT",
    serviced: "4m 53s",
    votesUp: 3,
  },
  {
    id: "e1",
    personOffset: 0,
    dateLabel: "Aug 18, 2026",
    timeLabel: "7:23 AM EDT",
    fullLabel: "Tuesday, August 18, 2026 at 7:23 AM EDT",
    start: "7:18 AM EDT",
    serviced: "4m 58s",
    votesUp: 2,
  },
  {
    id: "e2",
    personOffset: 1,
    dateLabel: "Aug 18, 2026",
    timeLabel: "5:59 AM EDT",
    fullLabel: "Tuesday, August 18, 2026 at 5:59 AM EDT",
    start: "5:52 AM EDT",
    serviced: "6m 41s",
    votesUp: 3,
  },
  {
    id: "e3",
    personOffset: 2,
    dateLabel: "Aug 18, 2026",
    timeLabel: "2:20 AM EDT",
    fullLabel: "Tuesday, August 18, 2026 at 2:20 AM EDT",
    start: "2:11 AM EDT",
    serviced: "8m 12s",
    votesDown: 1,
  },
  {
    id: "e4",
    personOffset: 1,
    dateLabel: "Aug 17, 2026",
    timeLabel: "9:47 PM EDT",
    fullLabel: "Monday, August 17, 2026 at 9:47 PM EDT",
    start: "9:41 PM EDT",
    serviced: "5m 30s",
    votesUp: 2,
  },
  {
    id: "e5",
    personOffset: 3,
    dateLabel: "Aug 17, 2026",
    timeLabel: "3:12 PM EDT",
    fullLabel: "Monday, August 17, 2026 at 3:12 PM EDT",
    start: "3:07 PM EDT",
    serviced: "4m 05s",
    votesUp: 4,
  },
];

const ALT_TYPE: Record<ActivityType, ActivityType> = {
  "Spot Clean": "Full Service",
  Periodic: "Spot Clean",
  "Full Service": "Periodic",
};

const OTHER_PHOTO: Record<string, string> = {
  "/dashboard/audit-photo-1.png": "/dashboard/audit-photo-2.png",
  "/dashboard/audit-photo-2.png": "/dashboard/audit-photo-1.png",
};

/** A small deterministic spread so every asset's stats look distinct
 * without wiring up real service-history counting — same "plausible,
 * not exhaustive" sample-data approach as the rest of this page. */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) % 1000;
  return hash;
}

/** "Break Room • Headhouse • 1 (Below Wing)" — the second/third
 * breadcrumb segments are a per-zone lookup keyed on the area code
 * prefix (e.g. "HH1"), since the sample ACTIVITY cards don't carry a
 * building/level of their own; unrecognized prefixes fall back to the
 * same zone the reference screenshot itself showed. */
function zoneBreadcrumb(areaName: string): string {
  const prefix = areaName.split(/[\s-]/)[0];
  if (prefix.startsWith("HH1")) return "Headhouse • 1 (Below Wing)";
  if (prefix.startsWith("HH3")) return "Headhouse • 3";
  if (prefix.startsWith("E2")) return "Concourse E • Level 2";
  if (prefix.startsWith("MU")) return "Make-Up Carousel • Baggage Level";
  return "Headhouse • 1 (Below Wing)";
}

function buildEntries(card: ActivityCard): HistoryEntry[] {
  return ENTRY_TEMPLATE.map((template, i) => {
    const isClickedCard = i === 0;
    return {
      ...template,
      type: isClickedCard ? card.type : i % 2 === 0 ? card.type : ALT_TYPE[card.type],
      rating: isClickedCard ? card.rating : i % 3 === 0 ? "5" : "4.9",
      photo: isClickedCard || i % 2 === 0 ? card.photo : OTHER_PHOTO[card.photo] ?? card.photo,
    };
  });
}

/** Every entry beyond the clicked card's own (offset 0, always
 * `clickedPerson`) attributes to a different roster person, cycling
 * through `people` starting just after `clickedPerson`'s own spot —
 * same "real names, not one person doing everything" intent as
 * QualityPageContent's own person={people[i % people.length]}. */
function personForOffset(offset: number, clickedPerson: RosterPerson, people: RosterPerson[]): RosterPerson {
  if (offset === 0) return clickedPerson;
  if (people.length === 0) return clickedPerson;
  return people[(people.indexOf(clickedPerson) + offset) % people.length] ?? clickedPerson;
}

/** Builds the payload for onAnalyzeService/showServiceAnalysis (Figma
 * node 2209:42714) out of one HistoryEntry — the flagged/low-vote
 * entry (see ENTRY_TEMPLATE's own votesDown) gets a summary that
 * actually matches its thumbs-down badge instead of a generic
 * "everything's clean" paragraph for every entry regardless of its
 * own rating. */
function buildServiceAnalysis(entry: HistoryEntry, card: ActivityCard, person: RosterPerson): ServiceAnalysis {
  const isToday = entry.dateLabel === ENTRY_TEMPLATE[0].dateLabel;
  const summary =
    entry.votesDown !== undefined
      ? `${card.areaName} is mostly clean, but one area needs attention — a section shows visible buildup that wasn't fully addressed during this ${entry.type.toLowerCase()}, and should be flagged for a follow-up pass.`
      : `${card.areaName} is in strong shape after this ${entry.type.toLowerCase()}. Floors, seating, and high-touch surfaces are free of visible dirt, stains, and clutter, consistent with the ${entry.rating} rating logged for this visit.`;
  return {
    areaName: card.areaName,
    type: entry.type,
    timeLabel: isToday ? `Today at ${entry.timeLabel}` : `${entry.dateLabel} at ${entry.timeLabel}`,
    personName: person.name,
    personRole: person.position || "Custodian",
    personAvatar: person.avatar,
    summary,
  };
}

/** The analysis for the exact card that was clicked — entries[0] (see
 * buildEntries above) always stands in for it (personOffset 0, and
 * its own type/rating/photo carried straight through). Exported so
 * QualityPageContent can post it the moment the Recent Activity photo
 * itself is clicked, before this modal (or any of its own timeline/
 * filmstrip rows) is ever opened — see QualityPageContent's own
 * activityPhotoButton. */
export function buildClickedServiceAnalysis(card: ActivityCard, clickedPerson: RosterPerson): ServiceAnalysis {
  return buildServiceAnalysis(buildEntries(card)[0], card, clickedPerson);
}

/**
 * "History of [asset]" — opened from clicking a Recent Activity photo
 * on the Quality page (see QualityPageContent). A full-screen overlay
 * (position: fixed, over the current page, not a route change) rather
 * than the app's other full-screen views' opaque background
 * (LiveDashboardFullScreen/ExternalPresenterView) — this one keeps the
 * dimmed/blurred page visible behind it, matching the reference
 * screenshot's lightbox feel, since it's opened mid-browse rather than
 * as a dedicated destination.
 *
 * Olivia's own FAB rides on top of this overlay, in her usual
 * bottom-right spot (same OliviaFab this whole prototype uses
 * elsewhere) — this view already fills the screen and would otherwise
 * bury her normal entry point along with the rest of the page
 * underneath it, so she's resurfaced here with a notification ping
 * flagging that she has something to say about what's on screen (the
 * flagged/low-rated photo in this history, same "proactive, unread
 * thing ready" meaning as every other Olivia notification dot in this
 * prototype).
 *
 * Clicking her keeps this overlay open and docks her real side panel
 * beside it (narrowing the overlay by the panel's own width, in sync
 * with its own open/close transition) rather than closing one to show
 * the other — same reasoning as OliviaPanel pushing the page instead
 * of overlaying it (see appShell's own doc comment): this history view
 * and Olivia's answer about it are both worth having on screen at
 * once. If she was ALREADY open before this overlay opened (its own
 * fixed positioning would otherwise just bury her, unlike the rest of
 * the page which OliviaPanel visibly pushes), `isOliviaSidePanelOpen`
 * starts the overlay already narrowed instead of covering her.
 * `oliviaDocksBeside` is false for the two variants without a
 * dockable, layout-pushing surface of her own ("fab"'s own small
 * floating modal, "commsCenter"'s panel — both `position: fixed`, so
 * there's no page-edge space to share) — there, opening her still
 * closes this overlay instead, same as before this docking behavior
 * existed, so she isn't left invisible underneath it.
 */
export function ServiceHistoryModal({
  card,
  clickedPerson,
  people,
  onClose,
  onOpenOlivia,
  onAnalyzeService,
  isOliviaSidePanelOpen = false,
  oliviaDocksBeside = false,
}: {
  card: ActivityCard;
  clickedPerson: RosterPerson;
  people: RosterPerson[];
  onClose: () => void;
  onOpenOlivia: () => void;
  /** Clicking a service — a timeline entry or filmstrip thumbnail —
   * opens/docks Olivia (if not already open) and has her post an
   * unprompted read of THAT service (Figma node 2209:42714). Optional
   * only so this component doesn't hard-require a caller that hasn't
   * wired Olivia at all, same as onOpenOlivia. */
  onAnalyzeService?: (analysis: ServiceAnalysis) => void;
  isOliviaSidePanelOpen?: boolean;
  oliviaDocksBeside?: boolean;
}) {
  const entries = buildEntries(card);
  const [selectedId, setSelectedId] = useState(entries[0].id);
  const selected = entries.find((e) => e.id === selectedId) ?? entries[0];
  const selectedIndex = entries.findIndex((e) => e.id === selectedId);
  const selectedPerson = personForOffset(selected.personOffset, clickedPerson, people);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const seed = hashString(card.areaName);
  const servicesCount = 90 + (seed % 90);
  const servicesAvg = (4.6 + (seed % 40) / 100).toFixed(2);

  // Groups entries by their (already-sorted, newest-first) dateLabel
  // into the sidebar's own date headings, same grouping the reference
  // screenshot's "Aug 18, 2026" heading over multiple entries shows.
  const groups: { dateLabel: string; entries: HistoryEntry[] }[] = [];
  for (const entry of entries) {
    const group = groups[groups.length - 1];
    if (group && group.dateLabel === entry.dateLabel) {
      group.entries.push(entry);
    } else {
      groups.push({ dateLabel: entry.dateLabel, entries: [entry] });
    }
  }

  const goToOffset = (delta: number) => {
    const next = entries[selectedIndex + delta];
    if (next) setSelectedId(next.id);
  };

  /** Selects the entry AND has Olivia post her unprompted read of it
   * (see this component's own doc comment) — one click does both,
   * rather than needing a second dedicated "ask Olivia" affordance per
   * row. */
  const selectAndAnalyze = (entry: HistoryEntry) => {
    setSelectedId(entry.id);
    onAnalyzeService?.(buildServiceAnalysis(entry, card, personForOffset(entry.personOffset, clickedPerson, people)));
  };

  return (
    <div
      className={styles.overlay}
      // Leaves room for OliviaPanel's own width (min(420px, 100vw),
      // matching .panelSlotOpen exactly) instead of covering her —
      // see this component's own doc comment. A plain style override
      // rather than a second CSS class so there's no source-order
      // fight over which of two `right` declarations wins.
      style={isOliviaSidePanelOpen ? { right: "min(420px, 100vw)" } : undefined}
      role="dialog"
      aria-modal="true"
      aria-label={`History of ${card.areaName}`}
    >
      <button type="button" className={styles.closeButton} onClick={onClose}>
        <CloseIcon />
        Close
      </button>

      <aside className={styles.sidebar}>
        <div className={styles.sidebarHead}>
          <p className={styles.eyebrow}>History of</p>
          <h2 className={styles.title}>{card.areaName}</h2>
          <p className={styles.subtitle}>
            {card.areaCategory} • {zoneBreadcrumb(card.areaName)}
          </p>
        </div>

        <div className={styles.divider} />

        <div className={styles.scheduleBlock}>
          <div className={styles.scheduleHead}>
            <p className={styles.blockLabel}>Shift Schedule</p>
            <span className={styles.detailsLink}>
              <GridIcon />
              Details
            </span>
          </div>
          <p className={styles.scheduleRow}>
            <span className={styles.scheduleRowLabel}>Start:</span> July 19, 2026 12:28 PM EDT
          </p>
          <p className={styles.scheduleRow}>
            <span className={styles.scheduleRowLabel}>End:</span> August 19, 2026 02:59 AM EDT
          </p>
        </div>

        <div className={styles.divider} />

        <div className={styles.statsRow}>
          <div className={styles.statBlock}>
            <p className={styles.statLabel}>
              <CheckCircleIcon /> {servicesCount} Services
            </p>
            <span className={styles.statAvgGood}>{servicesAvg} Avg.</span>
          </div>
          <div className={styles.statBlock}>
            <p className={styles.statLabel}>
              <ClipboardCheckIcon /> 0 Audits
            </p>
            <span className={styles.statAvgMuted}>N/A Avg.</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.timeline}>
          {groups.map((group) => (
            <div key={group.dateLabel} className={styles.timelineGroup}>
              <p className={styles.timelineDate}>
                <CalendarIcon /> {group.dateLabel}
              </p>
              {group.entries.map((entry) => {
                const person = personForOffset(entry.personOffset, clickedPerson, people);
                const isSelected = entry.id === selectedId;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    className={[styles.timelineEntry, isSelected ? styles.timelineEntryActive : ""]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => selectAndAnalyze(entry)}
                    aria-pressed={isSelected}
                  >
                    <span className={styles.timelineEntryHead}>
                      <span className={styles.timelineEntryIcon}>{ACTIVITY_ICON[entry.type]}</span>
                      <span className={styles.timelineEntryName}>
                        {person.name} - {person.position || "Custodian"}
                      </span>
                    </span>
                    <span className={styles.timelineEntryMeta}>
                      {entry.type}
                      <span className={styles.timelineEntryRating}>{entry.rating}</span>
                    </span>
                    <span className={styles.timelineEntryTimes}>
                      <span>
                        <span className={styles.timelineEntryTimesLabel}>End</span> {entry.timeLabel}
                      </span>
                      <span>
                        <span className={styles.timelineEntryTimesLabel}>Serviced</span> {entry.serviced}
                      </span>
                      <span>
                        <span className={styles.timelineEntryTimesLabel}>Start</span> {entry.start}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      <div className={styles.main}>
        <div className={styles.viewer}>
          <img src={selected.photo} alt="" className={styles.viewerImage} />
          {selectedPerson?.avatar && (
            <img src={selectedPerson.avatar} alt={selectedPerson.name} className={styles.viewerAvatar} />
          )}
          <p className={styles.viewerCaption}>
            <span className={styles.viewerCaptionIcon} aria-hidden="true">
              <ClockIcon />
            </span>
            {selected.fullLabel}
          </p>
          {selectedIndex < entries.length - 1 && (
            <button
              type="button"
              className={styles.viewerNext}
              onClick={() => goToOffset(1)}
              aria-label="Older photo"
            >
              <ChevronRightIcon />
            </button>
          )}
        </div>

        <div className={styles.filmstrip}>
          {entries.map((entry) => {
            const isSelected = entry.id === selectedId;
            return (
              <button
                key={entry.id}
                type="button"
                className={[styles.filmstripItem, isSelected ? styles.filmstripItemActive : ""]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => selectAndAnalyze(entry)}
                aria-pressed={isSelected}
              >
                <span className={styles.filmstripTime}>
                  <span className={styles.filmstripIcon}>{ACTIVITY_ICON[entry.type]}</span>
                  {entry.timeLabel}
                </span>
                <span className={styles.filmstripThumbWrap}>
                  <img src={entry.photo} alt="" className={styles.filmstripThumb} />
                  {entry.votesUp !== undefined && (
                    <span className={styles.filmstripVoteUp}>
                      <ThumbsUpIcon /> {entry.votesUp}
                    </span>
                  )}
                  {entry.votesDown !== undefined && (
                    <span className={styles.filmstripVoteDown}>
                      <ThumbsDownIcon /> {entry.votesDown}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Once she's actually open and docked beside this overlay, her
          own panel (with its own close button) takes over — a second
          floating FAB here would just sit on top of her. Only relevant
          when oliviaDocksBeside is true in the first place; for "fab"/
          "commsCenter" this overlay always closes the moment she
          opens (see the click handler below), so there's never a
          docked state of hers to hide this FAB for. */}
      {!(oliviaDocksBeside && isOliviaSidePanelOpen) && (
        <OliviaFab
          onClick={() => {
            onOpenOlivia();
            // Only the two non-dockable variants close this overlay to
            // reveal her — everywhere else she docks beside it instead
            // (see this component's own doc comment).
            if (!oliviaDocksBeside) onClose();
          }}
          isOpen={false}
          hasNotification
        />
      )}
    </div>
  );
}
