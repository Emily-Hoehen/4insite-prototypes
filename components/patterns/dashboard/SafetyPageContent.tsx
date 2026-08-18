import type { RosterPerson } from "../../../lib/csv";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons";
import { BarChart } from "./charts";
import styles from "./SafetyPageContent.module.css";

export type SafetyPageContentProps = {
  /** Whoever logged the most recent Good Catch — pulled from the same
   * roster data as the rest of the app rather than an invented name. */
  reporter: RosterPerson;
};

/**
 * The "Safety" nav link's destination (app/safety/page.tsx). Built from
 * a provided screenshot rather than a Figma node — no Figma reference
 * existed for this specific page, so colors/spacing are reasoned from
 * the screenshot and this project's existing DS2 tokens/card
 * conventions (see SiteHealthSection.tsx), not pulled exactly.
 */
export function SafetyPageContent({ reporter }: SafetyPageContentProps) {
  return (
    <section className={styles.section}>
      <div className={styles.pageHead}>
        <div>
          <p className={styles.eyebrow}>Safety</p>
          <h1 className={styles.heading}>Here&rsquo;s how we manage Safety</h1>
        </div>
        <DateRangePicker range="Aug 01, 2026 - Aug 10, 2026" />
      </div>

      <div className={styles.cardRow}>
        <IncidentsCard />
        <RecordableFreeCard />
        <GoodCatchesCard />
        <LastGoodCatchCard reporter={reporter} />
      </div>
    </section>
  );
}

function DateRangePicker({ range }: { range: string }) {
  return (
    <div className={styles.dateRange}>
      <button type="button" className={styles.dateRangeArrow} aria-label="Previous period">
        <ChevronLeftIcon />
      </button>
      <span className={styles.dateRangeLabel}>{range}</span>
      <button type="button" className={styles.dateRangeArrow} aria-label="Next period">
        <ChevronRightIcon />
      </button>
    </div>
  );
}

const INCIDENT_DAYS = ["8/1", "8/2", "8/3", "8/4", "8/5", "8/6", "8/7", "8/8", "8/9", "8/10"];

function IncidentsCard() {
  return (
    <div className={styles.card}>
      <p className={styles.cardTitle}>Incidents</p>
      <div className={styles.statPairRow}>
        <div className={styles.statPair}>
          <span className={styles.statNumberBlue}>1</span>
          <span className={styles.statLabel}>Work Related</span>
        </div>
        <div className={styles.statPair}>
          <span className={styles.statNumberGreen}>1</span>
          <span className={styles.statLabel}>Non Work Related</span>
        </div>
      </div>
      <BarChart
        height={72}
        barWidth={14}
        groups={INCIDENT_DAYS.map((day, i) => ({
          label: day,
          bars: [
            {
              heightPct: i === 7 ? 62 : i === 9 ? 52 : 4,
              color:
                i === 7
                  ? "var(--color-primary-300)"
                  : i === 9
                    ? "var(--color-success-300)"
                    : "var(--color-neutral-700)",
            },
          ],
        }))}
      />
    </div>
  );
}

const RECORDABLE_MONTHS = [
  { label: "Jan", tone: "default" as const },
  { label: "Feb", tone: "marker" as const },
  { label: "Mar", tone: "default" as const },
  { label: "Apr", tone: "highlight" as const },
  { label: "May", tone: "default" as const },
  { label: "Jun", tone: "default" as const },
  { label: "Jul", tone: "highlight" as const },
  { label: "Aug", tone: "highlight" as const },
  { label: "Sep", tone: "default" as const },
  { label: "Oct", tone: "default" as const },
  { label: "Nov", tone: "default" as const },
  { label: "Dec", tone: "default" as const },
];

function RecordableFreeCard() {
  return (
    <div className={styles.card}>
      <p className={styles.cardTitleAmber}>183 days Recordable Free</p>
      <div className={styles.hr} />
      <div className={styles.legendRow}>
        <span className={styles.legendSwatch} />
        <span className={styles.legendText}>Last recordable Feb 10, 2026</span>
      </div>
      <div className={styles.monthGrid}>
        {RECORDABLE_MONTHS.map((month) => (
          <span
            key={month.label}
            className={[
              styles.monthChip,
              month.tone === "marker" ? styles.monthChipMarker : "",
              month.tone === "highlight" ? styles.monthChipHighlight : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {month.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function GoodCatchesCard() {
  return (
    <div className={styles.card}>
      <p className={styles.cardTitle}>Good Catches</p>
      <p className={styles.goodCatchesBody}>
        This month, <span className={styles.goodCatchesAccent}>8 Issues</span> were reported and
        identified as safety concerns that we call{" "}
        <span className={styles.goodCatchesAccent}>Good Catches</span>.
      </p>
      <BarChart
        height={64}
        barWidth={24}
        groups={[
          { label: "Mar", bars: [{ heightPct: 55, color: "var(--color-neutral-600)" }] },
          { label: "Apr", bars: [{ heightPct: 20, color: "var(--color-neutral-600)" }] },
          { label: "May", bars: [{ heightPct: 45, color: "var(--color-neutral-600)" }] },
          { label: "Jun", bars: [{ heightPct: 40, color: "var(--color-neutral-600)" }] },
          { label: "Jul", bars: [{ heightPct: 42, color: "var(--color-neutral-600)" }] },
          {
            label: "Aug",
            labelColor: "var(--color-text-dt-default)",
            bars: [{ heightPct: 100, color: "var(--color-datavis-pinkle-500)" }],
          },
        ]}
      />
    </div>
  );
}

function LastGoodCatchCard({ reporter }: { reporter: RosterPerson }) {
  return (
    <div className={[styles.card, styles.lastGoodCatchCard].join(" ")}>
      <div className={styles.lastGoodCatchHead}>
        <p className={styles.cardTitle}>Last Good Catch</p>
        <span className={styles.lastGoodCatchDate}>08/08/2026, 08:09 PM</span>
      </div>
      <div className={styles.reporterRow}>
        <img src={reporter.avatar} alt="" className={styles.reporterAvatar} />
        <span className={styles.reporterName}>{reporter.name}</span>
      </div>
      <img src="/dashboard/audit-photo-2.png" alt="" className={styles.goodCatchPhoto} />
    </div>
  );
}
