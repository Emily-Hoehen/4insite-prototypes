import type { RosterPerson } from "../../../lib/csv";
import { CalendarIcon, CheckCircleIcon, ClockIcon, PersonIcon, UserGroupIcon } from "../icons";
import { SectionHeading } from "./SectionHeading";
import { AreaSparkline, BarChart } from "./charts";
import styles from "./PeopleSection.module.css";

const MONTHS = ["May", "Apr", "Mar", "Feb", "Jan", "Dec"];

export function PeopleSection({ clockedIn }: { clockedIn: RosterPerson[] }) {
  const visible = clockedIn.slice(0, 17);
  const overflowCount = 22;

  return (
    <section className={styles.section}>
      <SectionHeading
        icon={<UserGroupIcon />}
        chipColor="var(--color-primary-100)"
        chipBorder="var(--color-primary-500)"
        iconColor="var(--color-text-lt-default)"
      >
        People
      </SectionHeading>

      <div className={styles.row}>
        <div className={styles.left}>
          <div className={styles.clockedIn}>
            <div className={styles.clockedInHeader}>
              <div className={styles.clockedInTitleRow}>
                <p className={styles.clockedInTitle}>39 Employees Clocked In</p>
                <p className={styles.clockedInTime}>As of 10:34 AM</p>
              </div>
              <span className={styles.tag}>Day Shift</span>
            </div>
            <div className={styles.avatars}>
              {visible.map((person, i) => (
                <img
                  key={person.email || i}
                  src={person.avatar}
                  alt={person.name}
                  title={person.name}
                  className={styles.avatar}
                />
              ))}
              <span className={styles.avatarOverflow}>+{overflowCount}</span>
            </div>
          </div>

          <div className={styles.statRow}>
            <div className={styles.totalStaff}>
              <UserGroupIcon className={styles.totalStaffIcon} />
              <div className={styles.totalStaffDetails}>
                <p className={styles.totalStaffCount}>239 Employees on Staff</p>
                <p className={styles.totalStaffMeta}>As of yesterday</p>
              </div>
            </div>

            <div className={styles.sow}>
              <p className={styles.sowTitle}>Scope of Work</p>
              <div className={styles.sowStatus}>
                <p className={styles.sowPercent}>100% assigned</p>
                <CheckCircleIcon className={styles.sowCheck} />
              </div>
              <p className={styles.sowRoutes}>In 166 routes</p>
              <div className={styles.sowTrack}>
                <div className={styles.sowFill} style={{ width: "100%" }} />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.hours}>
          <p className={styles.cardTitle}>Hours Worked</p>
          <div className={styles.hoursStat}>
            <p className={styles.hoursValue}>1,056</p>
            <div className={styles.hoursMeta}>
              <span>Yesterday</span>
              <ClockIcon className={styles.hoursMetaIcon} />
            </div>
          </div>
          <div className={styles.hoursStat}>
            <p className={styles.hoursValue}>8,315</p>
            <div className={styles.hoursMeta}>
              <span>This Month</span>
              <CalendarIcon className={styles.hoursMetaIcon} />
            </div>
          </div>
          <div className={styles.hoursChart}>
            <AreaSparkline points={[78, 46, 44, 60, 40, 26]} height={70} width={284} />
            <div className={styles.hoursMonths}>
              {MONTHS.map((m, i) => (
                <span key={m} className={i === 0 ? styles.monthActive : undefined}>
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.turnover}>
          <p className={styles.turnoverHeadline}>10% turnover this month</p>
          <div className={styles.turnoverStats}>
            <div className={styles.turnoverStat}>
              <p className={styles.turnoverLabel} style={{ color: "var(--color-datavis-red-orange-100)" }}>
                12 separations
              </p>
              <PersonGrid count={13} color="var(--color-datavis-red-orange-100)" />
            </div>
            <div className={styles.turnoverStat}>
              <p className={styles.turnoverLabel} style={{ color: "var(--color-datavis-sky-blue-100)" }}>
                14 new hires
              </p>
              <PersonGrid count={14} color="var(--color-datavis-sky-blue-100)" />
            </div>
          </div>
          <BarChart
            height={101}
            barWidth={8}
            groups={[
              { label: "Dec", bars: [{ heightPct: (31 / 101) * 100, color: "var(--color-datavis-red-orange-100)" }, { heightPct: (82 / 101) * 100, color: "var(--color-datavis-sky-blue-100)" }] },
              { label: "Jan", bars: [{ heightPct: (72 / 101) * 100, color: "var(--color-datavis-red-orange-100)" }, { heightPct: (52 / 101) * 100, color: "var(--color-datavis-sky-blue-100)" }] },
              { label: "Feb", bars: [{ heightPct: (45 / 101) * 100, color: "var(--color-datavis-red-orange-100)" }, { heightPct: (60 / 101) * 100, color: "var(--color-datavis-sky-blue-100)" }] },
              { label: "Mar", bars: [{ heightPct: (101 / 101) * 100, color: "var(--color-datavis-red-orange-100)" }, { heightPct: (61 / 101) * 100, color: "var(--color-datavis-sky-blue-100)" }] },
              { label: "Apr", bars: [{ heightPct: (101 / 101) * 100, color: "var(--color-datavis-red-orange-100)" }, { heightPct: (34 / 101) * 100, color: "var(--color-datavis-sky-blue-100)" }] },
              { label: "May", labelColor: "var(--color-text-dt-default)", bars: [{ heightPct: (60 / 101) * 100, color: "var(--color-datavis-red-orange-100)" }, { heightPct: (69 / 101) * 100, color: "var(--color-datavis-sky-blue-100)" }] },
            ]}
          />
        </div>
      </div>
    </section>
  );
}

function PersonGrid({ count, color }: { count: number; color: string }) {
  return (
    <div className={styles.personGrid} style={{ color }}>
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className={styles.personGridIcon}
          style={{ visibility: i < count ? "visible" : "hidden" }}
        >
          <PersonIcon />
        </span>
      ))}
    </div>
  );
}
