"use client";

import { ClipboardCheckIcon, ClockIcon, GridIcon, PersonIcon, PlaneDepartureIcon } from "../../icons";
import styles from "./QualitySummaryCards.module.css";

/** One wedge of MultiDonut's ring — a single stroke-dasharray segment,
 * offset by the running total of everything before it. No existing
 * chart primitive (charts.tsx's DonutChart) supports more than one
 * segment, so this is its own small helper rather than an extension
 * of that component's single-percent API. */
function MultiDonut({
  segments,
  size = 148,
  strokeWidth = 22,
}: {
  segments: { value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  let cumulative = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((s, i) => {
        const fraction = s.value / total;
        const dash = c * fraction;
        const offset = c * (1 - cumulative / total);
        cumulative += s.value;
        return (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${c - dash}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
      })}
    </svg>
  );
}

/** A simple bottom-up stacked bar — charts.tsx's BarChart lays series
 * side by side, not stacked, so this is its own small helper too. */
function StackedBarChart({
  groups,
  targetPct,
}: {
  groups: { label: string; segments: { heightPct: number; color: string }[] }[];
  /** A horizontal target line, 0-100 from the bottom (Figma's amber line). */
  targetPct?: number;
}) {
  return (
    <div className={styles.stackedChart}>
      {targetPct !== undefined && (
        <div className={styles.stackedTargetLine} style={{ bottom: `${targetPct}%` }} aria-hidden="true" />
      )}
      {groups.map((group, i) => (
        <div key={i} className={styles.stackedCol}>
          <div className={styles.stackedBar}>
            {group.segments.map((seg, j) => (
              <span key={j} style={{ height: `${seg.heightPct}%`, backgroundColor: seg.color }} />
            ))}
          </div>
          <span className={styles.stackedLabel}>{group.label}</span>
        </div>
      ))}
    </div>
  );
}

const SERVICE_BREAKDOWN = [
  { label: "Full Service", count: 615, color: "#4aa8ff" },
  { label: "Spot Clean", count: 1370, color: "#734cff" },
  { label: "Detail Clean", count: 81, color: "#af99ff" },
  { label: "Additional Service", count: 45, color: "#e254c4" },
  { label: "Periodic", count: 22, color: "#ff8ac4" },
  { label: "Couldn't Service", count: 57, color: "#ff6a3d" },
  { label: "Manager Full Service", count: 0, color: "#ff9d19" },
];

const COMPLETION_GROUPS = [
  { hour: "6 AM", full: 85, spot: 45, other: 10 },
  { hour: "7 AM", full: 55, spot: 30, other: 5 },
  { hour: "8 AM", full: 12, spot: 8, other: 2 },
  { hour: "9 AM", full: 18, spot: 25, other: 4 },
  { hour: "10 AM", full: 10, spot: 8, other: 2 },
  { hour: "11 AM", full: 24, spot: 18, other: 4 },
  { hour: "12 PM", full: 30, spot: 22, other: 6 },
  { hour: "1 PM", full: 28, spot: 20, other: 5 },
  { hour: "2 PM", full: 32, spot: 20, other: 6 },
  { hour: "3 PM", full: 14, spot: 10, other: 2 },
  { hour: "4 PM", full: 20, spot: 16, other: 4 },
  { hour: "5 PM", full: 5, spot: 4, other: 1 },
];
const COMPLETION_MAX = 40;

/**
 * Olivia's richer, three-part instant summary of Quality's "Scope of
 * Work" — real charts instead of just a paragraph, per the screenshots
 * this was built from (no Figma node for these; card layout/spacing
 * reasoned from this project's existing card conventions). Numbers
 * are their own self-consistent canned dataset — a fuller "all
 * services" breakdown than QUALITY_PAGE_SUMMARY's own "Verifications
 * only" figure, same as how the real Quality page's own "All" vs.
 * "Verifications" filter chips would show different totals.
 */
export function QualitySummaryCards({ onPrint, onViewFullScreen }: { onPrint?: () => void; onViewFullScreen?: () => void }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.summaryIntro}>
        <p className={styles.summaryIntroText}>Hi Emily, Let's dive into today's service results for LGA-LaGuardia, NY</p>
      </div>
      <div className={styles.summaryStack}>
        {/* Card 1: departures + verification */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <PlaneDepartureIcon className={styles.cardHeadIcon} />
            <p className={styles.cardHeadTitle}>On-Time Departure Services</p>
          </div>
          <p className={styles.cardHeadline}>
            <span className={styles.accentGreen}>45.55% of Departures</span> serviced within 30 minutes of
            departure time
          </p>
          <div className={styles.progressRow}>
            <div className={styles.progressStat}>
              <span className={styles.progressLabel}>Serviced Departures</span>
              <span className={styles.progressValue}>118</span>
            </div>
            <div className={styles.progressStat}>
              <span className={styles.progressLabel}>Departures</span>
              <span className={styles.progressValue}>259</span>
            </div>
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFillGreen} style={{ width: "45.55%" }} />
          </div>

          <div className={styles.hr} />

          <div className={styles.cardHead}>
            <GridIcon className={styles.cardHeadIcon} />
            <p className={styles.cardHeadTitle}>Service Verification</p>
          </div>
          <p className={styles.cardHeadline}>
            <span className={styles.accentPurple}>2,158</span> of 2,884 Expected Services Performed by
            <span className={styles.accentPurple}> 95</span> team members
          </p>
          <div className={styles.donutRow}>
            <MultiDonut segments={SERVICE_BREAKDOWN.map((s) => ({ value: s.count || 0.001, color: s.color }))} />
            <div className={styles.legend}>
              {SERVICE_BREAKDOWN.map((s) => (
                <div key={s.label} className={styles.legendRow}>
                  <span className={styles.legendDot} style={{ backgroundColor: s.color }} />
                  <span className={styles.legendLabel}>{s.label}</span>
                  <span className={styles.legendCount}>{s.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: staffing & quality */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <PersonIcon className={styles.cardHeadIcon} />
            <p className={styles.cardHeadTitle}>Staffing &amp; hours</p>
          </div>
          <p className={styles.cardSub}>Today, we captured 82% of shift time</p>
          <p className={styles.cardBigStat}>
            <span className={styles.accentPurple}>523h 45m</span> captured
          </p>
          <div className={styles.progressTrackAmber}>
            <div className={styles.progressFillAmber} style={{ width: "82%" }}>
              523h 45m captured of 639h 14m shift time
            </div>
          </div>

          <div className={styles.hr} />

          <div className={styles.cardHead}>
            <ClipboardCheckIcon className={styles.cardHeadIcon} />
            <p className={styles.cardHeadTitle}>Quality Results</p>
          </div>
          <p className={styles.cardSub}>Today, Verification and Internal Audit scores aligned very closely.</p>
          <div className={styles.scoreRow}>
            <div className={styles.scoreBox}>
              <span className={styles.scoreValue}>4.88</span>
              <span className={styles.scoreLabel}>Average Verification</span>
            </div>
            <div className={styles.scoreBox}>
              <span className={styles.scoreValue}>4.77</span>
              <span className={styles.scoreLabel}>Average Internal Audit</span>
            </div>
            <div className={[styles.scoreBox, styles.scoreBoxMuted].join(" ")}>
              <span className={styles.scoreValueMuted}>N/A</span>
              <span className={styles.scoreLabel}>Average Customer Audit</span>
            </div>
          </div>
        </div>

        {/* Card 3: completion chart + times */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <p className={styles.cardHeadTitle}>
              Avg. Service Completion: <span className={styles.accentBlue}>75%</span>
            </p>
          </div>
          <StackedBarChart
            targetPct={65}
            groups={COMPLETION_GROUPS.map((g) => ({
              label: g.hour,
              segments: [
                { heightPct: (g.full / COMPLETION_MAX) * 100, color: "#4aa8ff" },
                { heightPct: (g.spot / COMPLETION_MAX) * 100, color: "#734cff" },
                { heightPct: (g.other / COMPLETION_MAX) * 100, color: "#ff6a3d" },
              ],
            }))}
          />

          <div className={styles.hr} />

          <div className={styles.cardHead}>
            <ClockIcon className={styles.cardHeadIcon} />
            <p className={styles.cardHeadTitle}>Service Times</p>
          </div>
          <div className={styles.scoreRow}>
            <div className={styles.scoreBox}>
              <span className={styles.scoreValuePurple}>10m 50s</span>
              <span className={styles.scoreLabel}>Avg Service Time</span>
            </div>
            <div className={styles.scoreBox}>
              <span className={styles.scoreValuePurple}>395h 26m</span>
              <span className={styles.scoreLabel}>Total Service Time</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.afterSummary}>
        <button type="button" className={styles.afterSummaryPill} onClick={() => onPrint?.()}>
          Print this summary
        </button>
        <button type="button" className={styles.afterSummaryPill} onClick={() => onViewFullScreen?.()}>
          View full screen
        </button>
      </div>
    </div>
  );
}
