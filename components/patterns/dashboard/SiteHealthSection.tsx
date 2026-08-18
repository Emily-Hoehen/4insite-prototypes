import type { RosterPerson } from "../../../lib/csv";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  FrownIcon,
  PinIcon,
} from "../icons";
import { SectionHeading } from "./SectionHeading";
import { BarChart, DonutChart, DotHeatmap, StarRow } from "./charts";
import { AskOliviaTrigger } from "./olivia/AskOliviaTrigger";
import type { OliviaTopic } from "./olivia/oliviaContent";
import styles from "./SiteHealthSection.module.css";

const CHART_MONTHS = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];

export type SiteHealthSectionProps = {
  auditor: RosterPerson;
  /** "Open Olivia" from a trigger's popover — lands on that topic's greeting. */
  onAskOlivia?: (topic: OliviaTopic) => void;
  /** Clicking one of a trigger's popover questions — opens Olivia and asks it immediately. */
  onAskQuestion?: (topic: OliviaTopic, questionText: string) => void;
};

export function SiteHealthSection({ auditor, onAskOlivia, onAskQuestion }: SiteHealthSectionProps) {
  return (
    <section className={styles.section}>
      <SectionHeading
        icon={<ChartBarIcon />}
        chipColor="var(--color-datavis-yellow-100)"
        chipBorder="var(--color-datavis-yellow-700)"
        iconColor="var(--color-neutral-800)"
      >
        Site Performance
      </SectionHeading>

      <div className={styles.grid}>
        <div className={styles.leftCol}>
          <div className={styles.rowFlex}>
            <ComplaintsDailyCard onAskOlivia={onAskOlivia} onAskQuestion={onAskQuestion} />
            <RecordablesCard onAskOlivia={onAskOlivia} onAskQuestion={onAskQuestion} />
            <div className={styles.stackCol}>
              <WorkOrdersCard />
              <ServiceValidationCard />
            </div>
          </div>

          <div className={styles.rowFlex}>
            <LastAuditCard auditor={auditor} onAskOlivia={onAskOlivia} onAskQuestion={onAskQuestion} />
            <SOWAuditCard />
          </div>

          <DetailsCard />

          <div className={styles.rowFlex}>
            <ReportItsCard auditor={auditor} />
            <MapCard />
          </div>
        </div>

        <div className={styles.rightCol}>
          <SurveyCard auditor={auditor} />
          <SiteScorecardCard />
        </div>
      </div>
    </section>
  );
}

function ComplaintsDailyCard({
  onAskOlivia,
  onAskQuestion,
}: {
  onAskOlivia?: (topic: OliviaTopic) => void;
  onAskQuestion?: (topic: OliviaTopic, questionText: string) => void;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.cardTitleRow}>
        <p className={styles.cardTitleAmber}>12 days since last Complaint</p>
        {onAskOlivia && onAskQuestion && (
          <AskOliviaTrigger
            topic="complaint"
            label="Ask Olivia about complaints"
            onOpenOlivia={onAskOlivia}
            onAskQuestion={onAskQuestion}
          />
        )}
      </div>
      <div className={styles.mostRecent}>
        <img src={"https://cdn.4insite.com/assets/6d8af4de2aaf4830b4afeeb317868995_AliciaPrimus_t.jpg"} alt="" className={styles.mostRecentAvatar} />
        <div className={styles.mostRecentText}>
          <span>Last Complaint</span>
          <span>May 2, 2023</span>
        </div>
        <ChevronRightIcon className={styles.chevronIcon} />
      </div>
      <div className={styles.hr} />
      <div className={styles.complaintsStat}>
        <p className={styles.h3White}>6 complaints this month</p>
        <div className={styles.emojiRow}>
          {Array.from({ length: 6 }).map((_, i) => (
            <FrownIcon key={i} className={styles.emojiIcon} />
          ))}
        </div>
      </div>
      <div className={styles.trendRow}>
        <ArrowUpIcon className={styles.trendIconDanger} />
        <span className={styles.trendText}>Increase of 1 from last month</span>
      </div>
      <BarChart
        height={58}
        barWidth={20}
        groups={[
          { label: "Dec", bars: [{ heightPct: 100, color: "var(--color-neutral-600)" }] },
          { label: "Jan", bars: [{ heightPct: 68, color: "var(--color-neutral-600)" }] },
          { label: "Feb", bars: [{ heightPct: 34, color: "var(--color-neutral-600)" }] },
          { label: "Mar", bars: [{ heightPct: 34, color: "var(--color-neutral-600)" }] },
          { label: "Apr", bars: [{ heightPct: 25, color: "var(--color-neutral-600)" }] },
          { label: "May", labelColor: "var(--color-text-dt-default)", bars: [{ heightPct: 28, color: "var(--color-datavis-yellow-orange-100)" }] },
        ]}
      />
    </div>
  );
}

function RecordablesCard({
  onAskOlivia,
  onAskQuestion,
}: {
  onAskOlivia?: (topic: OliviaTopic) => void;
  onAskQuestion?: (topic: OliviaTopic, questionText: string) => void;
}) {
  const fullOn: boolean[][] = Array.from({ length: 5 }, () => Array(7).fill(true));
  const decGrid = fullOn.map((row, ri) => (ri === 0 ? row.map(() => false) : row));
  const mayGrid = Array.from({ length: 5 }, (_, ri) => Array(7).fill(ri === 0 || ri === 2));

  return (
    <div className={[styles.card, styles.cardTight].join(" ")}>
      <div className={styles.cardTitleRow}>
        <p className={styles.cardTitleAmber}>150 days Recordable Free</p>
        {onAskOlivia && onAskQuestion && (
          <AskOliviaTrigger
            topic="safety"
            label="Ask Olivia about safety"
            onOpenOlivia={onAskOlivia}
            onAskQuestion={onAskQuestion}
          />
        )}
      </div>
      <div className={styles.hr} />
      <div className={styles.legendRow}>
        <span className={styles.legendSwatch} />
        <span className={styles.h4White}>Last recordable Dec 6, 2021</span>
      </div>
      <div className={styles.dotHeatmapRows}>
        <DotHeatmap
          months={[
            { label: "Dec", grid: decGrid, marker: [0, 3], color: "var(--color-datavis-yellow-orange-100)" },
            { label: "Jan", full: true, color: "var(--color-datavis-yellow-orange-100)" },
            { label: "Feb", full: true, color: "var(--color-datavis-yellow-orange-100)" },
          ]}
        />
        <DotHeatmap
          months={[
            { label: "Mar", full: true, color: "var(--color-datavis-yellow-orange-100)" },
            { label: "Apr", full: true, color: "var(--color-datavis-yellow-orange-100)" },
            { label: "May", grid: mayGrid, color: "var(--color-datavis-yellow-orange-100)" },
          ]}
        />
      </div>
    </div>
  );
}

function WorkOrdersCard() {
  return (
    <div className={styles.smallCard}>
      <div>
        <p className={styles.h2White}>Work Orders</p>
        <p className={styles.h3Teal}>82% completed on time</p>
        <p className={styles.h3Grey}>165 total &nbsp;•&nbsp; 27 past due</p>
      </div>
      <DonutChart percent={82} size={72} strokeWidth={8} color="var(--color-datavis-teal-100)" label="82%" />
    </div>
  );
}

function ServiceValidationCard() {
  return (
    <div className={[styles.smallCard, styles.smallCardStack].join(" ")}>
      <div>
        <p className={styles.h2White}>Service Validation</p>
        <p className={styles.h2SkyBlue}>43% areas verified today</p>
      </div>
      <div className={styles.progressBlock}>
        <div className={styles.trackNeutral}>
          <div className={styles.fillSkyBlue} style={{ width: "16%" }} />
        </div>
        <div className={styles.progressLabels}>
          <span>1234 scans</span>
          <span>7799 expected</span>
        </div>
      </div>
    </div>
  );
}

function SurveyCard({ auditor }: { auditor: RosterPerson }) {
  return (
    <div className={styles.surveyCard}>
      <img src="/dashboard/survey-stars-bg.svg" alt="" className={styles.surveyStarsBg} />
      <div className={styles.surveyHeader}>
        <p className={styles.h2Dark}>Last Survey Score</p>
        <p className={styles.h4Dark}>Apr 29, 2023</p>
      </div>
      <div className={styles.surveyScoreRow}>
        <p className={styles.h2Dark}>4.67</p>
        <StarRow score={4.67} size={20} />
      </div>
      <div className={styles.associateTile}>
        <img src={auditor.avatar} alt="" className={styles.associateAvatarSm} />
        <div className={styles.associateInfoDark}>
          <span className={styles.associateNameDark}>{auditor.name}</span>
          <span className={styles.associateMetaDark}>Custodian &middot; Day</span>
        </div>
      </div>
    </div>
  );
}

function LastAuditCard({
  auditor,
  onAskOlivia,
  onAskQuestion,
}: {
  auditor: RosterPerson;
  onAskOlivia?: (topic: OliviaTopic) => void;
  onAskQuestion?: (topic: OliviaTopic, questionText: string) => void;
}) {
  return (
    <div className={styles.splitCard}>
      <div className={styles.splitLeft}>
        <div className={styles.auditHeadRow}>
          <p className={styles.h2White}>Internal Audit</p>
          <span className={styles.h4Grey}>06/20/2023, 10:03 AM</span>
          {onAskOlivia && onAskQuestion && (
            <AskOliviaTrigger
              topic="audit"
              label="Ask Olivia about this audit"
              onOpenOlivia={onAskOlivia}
              onAskQuestion={onAskQuestion}
              className={styles.auditAskTrigger}
            />
          )}
        </div>
        <div className={styles.scoreRow}>
          <span className={styles.scoreChipLg}>3.60</span>
          <p className={styles.h3White} style={{ width: 184 }}>
            Terminal A - DTW, A3 - Concourse Above Wing
          </p>
        </div>
        <div className={styles.associateTile}>
          <img src={auditor.avatar} alt="" className={styles.associateAvatarXs} />
          <span className={styles.h4White}>{auditor.name}</span>
        </div>
        <p className={styles.bodyGrey}>
          The area of focus is the A Terminal above wing. Gate A 35 Podium was clean and free of
          debris. Chairs and seating area needed to be wiped down, small debris present. Stains on
          window ledges and stainless steels ledges are dirty. Carpet area free of debris.
        </p>
        <div className={styles.tagsRow}>
          <span className={styles.tagPill}>Custodial</span>
          <span className={styles.tagPill}>Internal</span>
          <span className={styles.tagPill}>Flex</span>
        </div>
      </div>
      <div className={styles.vDivider} />
      <div className={styles.splitRight}>
        <div className={styles.auditHeadRow} style={{ marginBottom: 16 }}>
          <span className={styles.scoreChipSm}>4.5</span>
          <div className={styles.photoLabel}>
            <span className={styles.h4White}>B16 Jet Bridge</span>
            <span className={styles.bodySmGrey}>Jed Bridge</span>
          </div>
        </div>
        <div className={styles.photoPair}>
          <div className={styles.photoTile}>
            <img src="/dashboard/audit-photo-1.png" alt="" />
            <span className={[styles.photoNav, styles.photoNavLeft].join(" ")}>
              <ChevronLeftIcon />
            </span>
          </div>
          <div className={styles.photoTile}>
            <img src="/dashboard/audit-photo-2.png" alt="" />
            <span className={[styles.photoNav, styles.photoNavRight].join(" ")}>
              <ChevronRightIcon />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SOWAuditCard() {
  const days = [12, 14, 23, 25, 30, 32, 32, 43, 43, 45, 46, 46, 48, 51, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  return (
    <div className={[styles.card, styles.sowAuditCard].join(" ")}>
      <div className={styles.sowAuditTop}>
        <p className={styles.h2White}>Scope of Work</p>
        <p className={styles.h2Purple}>47% audited</p>
        <p className={styles.h3White}>
          We have performed <span className={styles.purple}>453</span> Audits in{" "}
          <span className={styles.purple}>11</span> areas with an average score of{" "}
          <span className={styles.green}>3.55</span>, in the last 30 days.
        </p>
      </div>
      <div className={styles.sowAuditChart}>
        {days.map((pct, i) => (
          <span key={i} className={styles.sowAuditBar}>
            <span className={styles.sowAuditBarFill} style={{ height: `${pct}%` }} />
          </span>
        ))}
      </div>
      <div className={styles.sowAuditLabels}>
        <span>May 1</span>
        <span>May 31</span>
      </div>
    </div>
  );
}

function DetailsCard() {
  const stats: { label: string; value: string }[] = [
    { label: "Buildings", value: "7" },
    { label: "Area Types", value: "21" },
    { label: "Areas", value: "1,655" },
    { label: "Annual Tasks", value: "3.33M" },
  ];
  return (
    <div className={styles.detailsCard}>
      <div className={styles.detailsLeft}>
        <div className={styles.detailsTitleRow}>
          <p className={styles.h2White}>SOW Manager</p>
          <CheckCircleIcon className={styles.checkIconBlue} />
        </div>
        <div className={styles.detailsSite}>
          <img src="/dashboard/delta-logo.png" alt="" className={styles.detailsLogo} />
          <div className={styles.detailsSiteText}>
            <span className={styles.h3White}>Delta</span>
            <span className={styles.bodySmGrey}>Detroit, MI (DTW)</span>
          </div>
        </div>
      </div>
      <div className={styles.detailsStats}>
        {stats.map((s) => (
          <div key={s.label} className={styles.detailsStat}>
            <span className={styles.statChip}>
              <CheckCircleIcon />
            </span>
            <span className={styles.h2White}>{s.value}</span>
            <span className={styles.bodySmGrey}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SiteScorecardCard() {
  return (
    <div className={styles.scorecardCard}>
      <div className={styles.scoreboardTop}>
        <div className={styles.scoreboardTitleRow}>
          <p className={styles.h2White}>Site Scorecard</p>
          <CheckCircleIcon className={styles.checkIconBlue} />
        </div>
        <div className={styles.scoreboardValueRow}>
          <span className={styles.h2SkyBlueLt}>3.56</span>
          <span className={styles.h4Grey}>/ 5.00</span>
        </div>
        <p className={styles.h4Grey}>average for the last 6 months</p>
      </div>
      <div className={styles.scoreboardLocation}>
        <div className={styles.locationRow}>
          <div className={styles.locationDetails}>
            <PinIcon className={styles.locationPin} />
            <div className={styles.locationText}>
              <span className={styles.h3White}>Detroit, MI (DTW)</span>
              <span className={styles.h4Grey}>Delta</span>
            </div>
          </div>
          <span className={styles.h4Grey}>4</span>
        </div>
        <div className={styles.trackNeutral}>
          <div className={styles.fillSuccess} style={{ width: "93.6%" }} />
        </div>
      </div>
    </div>
  );
}

function ReportItsCard({ auditor }: { auditor: RosterPerson }) {
  return (
    <div className={styles.splitCard}>
      <div className={styles.splitLeft}>
        <div className={styles.reportItsHead}>
          <p className={styles.h2White}>Report Its</p>
          <p className={styles.h2Yellow}>1,000 reported last month</p>
          <div className={styles.trendRow}>
            <ArrowDownIcon className={styles.trendIconDanger} />
            <span className={styles.trendText}>Decrease of 123 from last month</span>
          </div>
        </div>
        <BarChart
          height={101}
          barWidth={25}
          groups={CHART_MONTHS.map((label, i) => ({
            label,
            labelColor: label === "May" ? "var(--color-text-dt-default)" : undefined,
            bars: [
              {
                heightPct: [30, 30, 76, 52, 100, 96][i],
                color: label === "May" ? "var(--color-datavis-yellow-100)" : "var(--color-neutral-600)",
              },
            ],
          }))}
        />
      </div>
      <div className={styles.vDivider} />
      <div className={styles.splitRight}>
        <div className={styles.auditHeadRow}>
          <p className={styles.h2White}>Last Report It</p>
          <span className={styles.h4Grey}>06/12/2023, 12:11 PM</span>
        </div>
        <div className={styles.associateTile} style={{ margin: "16px 0" }}>
          <img src={auditor.avatar} alt="" className={styles.associateAvatarXs} />
          <span className={styles.h4White}>{auditor.name}</span>
        </div>
        <div className={styles.photoPair}>
          <div className={styles.photoTile}>
            <img src="/dashboard/reportit-photo-1.png" alt="" />
            <span className={[styles.photoNav, styles.photoNavLeft].join(" ")}>
              <ChevronLeftIcon />
            </span>
          </div>
          <div className={styles.photoTile}>
            <img src="/dashboard/reportit-photo-2.png" alt="" />
            <span className={[styles.photoNav, styles.photoNavRight].join(" ")}>
              <ChevronRightIcon />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MapCard() {
  return (
    <div className={styles.mapCard}>
      <p className={styles.h2White}>Dashboard View</p>
      <div className={styles.mapTiles}>
        <MapTile
          title="Surveys"
          groups={[38, 30, 20, 32, 20, 23].map((h) => ({ heightPct: h, color: "var(--color-primary-300)" }))}
        />
        <MapTile
          title="Audits"
          dual
          groups={[
            [38, 35],
            [25, 29],
            [37, 37],
            [34, 30],
            [22, 29],
            [31, 30],
          ].map(([a, b]) => [
            { heightPct: a, color: "var(--color-primary-300)" },
            { heightPct: b, color: "var(--color-datavis-purple-500)" },
          ])}
        />
        <MapTile
          title="Complaints"
          groups={[13, 36, 8, 24, 20, 23].map((h) => ({ heightPct: h, color: "var(--color-primary-300)" }))}
        />
      </div>
    </div>
  );
}

function MapTile({
  title,
  groups,
  dual,
}: {
  title: string;
  groups: { heightPct: number; color: string }[] | { heightPct: number; color: string }[][];
  dual?: boolean;
}) {
  return (
    <div className={styles.mapTile}>
      <p className={styles.mapTileTitle}>{title}</p>
      <div className={styles.mapTileBars}>
        {dual
          ? (groups as { heightPct: number; color: string }[][]).map((pair, i) => (
              <div key={i} className={styles.mapTilePair}>
                {pair.map((bar, j) => (
                  <span
                    key={j}
                    className={styles.mapTileBar}
                    style={{ height: `${bar.heightPct}%`, backgroundColor: bar.color }}
                  />
                ))}
              </div>
            ))
          : (groups as { heightPct: number; color: string }[]).map((bar, i) => (
              <span
                key={i}
                className={styles.mapTileBar}
                style={{ height: `${bar.heightPct}%`, backgroundColor: bar.color, flex: 1 }}
              />
            ))}
      </div>
      <div className={styles.mapTileGrid} />
    </div>
  );
}
