"use client";

import { ReactNode, useEffect } from "react";
import {
  CheckCircleIcon,
  ChartBarIcon,
  ClipboardCheckIcon,
  CloseIcon,
  FilePdfIcon,
  FinancialsIcon,
  InfoCircleIcon,
  ShieldIcon,
  TriangleExclamationIcon,
} from "../../icons";
import styles from "./SiteDashboardFullScreen.module.css";

/**
 * "View Full Screen" from the SITE-scoped live-dashboard chat card
 * (HomeGreeting's "Live Site Dashboard" card, the header's own
 * dashboard icon) — content and copy transcribed from
 * public/dashboard/Site Dashboard.png (a 300px-wide reference capture,
 * too narrow to use directly at full-screen size the way the
 * page-scoped LiveDashboardFullScreen does with Live Dashboard.png),
 * rebuilt as real markup so it reads properly at full width. Visual
 * shell (dark overlay, header row, Export/Close corner) matches that
 * same page-scoped screenshot's own styling — this is the one part
 * *not* transcribed from the site PNG, which doesn't show a header
 * wide enough to include those actions. Per request, the header icon
 * and Export button are purple here (Olivia's own accent) rather than
 * the page-scoped view's blue, since this dashboard exists because
 * Olivia generated it.
 */

type MetricRow = {
  icon: ReactNode;
  iconClassName: string;
  label: string;
  value: string;
  unit?: string;
  valueClassName?: string;
  trend?: string;
  trendIcon?: ReactNode;
};

const METRICS: MetricRow[] = [
  {
    icon: <ChartBarIcon />,
    iconClassName: "iconSkyBlue",
    label: "Hours Worked",
    value: "12,350",
    unit: "hrs",
    trend: "—",
  },
  {
    icon: <ShieldIcon />,
    iconClassName: "iconTeal",
    label: "Safety Streak",
    value: "189",
    unit: "days",
    valueClassName: "valueTeal",
    trend: "6 months in a row",
    trendIcon: <FinancialsIcon />,
  },
  {
    icon: <CheckCircleIcon />,
    iconClassName: "iconTeal",
    label: "Audit Performance",
    value: "4.82",
    unit: "/ 5.0",
    valueClassName: "valueTeal",
    trend: "59 total",
  },
  {
    icon: <ClipboardCheckIcon />,
    iconClassName: "iconPurple",
    label: "Report Its",
    value: "227",
    unit: "accepted",
    trend: "Monthly average 460",
  },
  {
    icon: <TriangleExclamationIcon />,
    iconClassName: "iconTeal",
    label: "Complaints",
    value: "0",
    valueClassName: "valueTeal",
    trend: "This month",
  },
];

const TRENDS_MONTHS = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];
const TRENDS_VALUES = [450, 450, 450, 450, 450, 190];
const TRENDS_MAX = 600;
const TRENDS_TICKS = [0, 150, 300, 450, 600];

const AUDIT_BARS = [
  { label: "Internal Avg", value: 4.82 },
  { label: "Joint Avg", value: 4.7 },
  { label: "Customer Avg", value: 0 },
];
const AUDIT_MAX = 8;
const AUDIT_TICKS = [0, 2, 4, 6, 8];

const ASSIGNMENTS: { route: string; staff: string; location: string }[] = [
  { route: "R1", staff: "Ponciano", location: "Head house men's restroom" },
  { route: "R2", staff: "Maria O", location: "Head house ladies' restrooms" },
  { route: "R3", staff: "Andrez", location: "HH1 arrivals west side" },
  { route: "R7", staff: "Kelvin", location: "Head house garbage pick ups" },
  { route: "R10", staff: "Pablo", location: "Mainline men's restrooms" },
  { route: "R18", staff: "Victor", location: "CCD south side men's restrooms" },
  { route: "R26", staff: "Jostin", location: "CCE north side men's restrooms" },
  { route: "R37", staff: "Angelo", location: "CCG men's restrooms" },
];

const CALLOUTS: { icon: ReactNode; iconClassName: string; title: string; description: string }[] = [
  {
    icon: <CheckCircleIcon />,
    iconClassName: "calloutIconSuccess",
    title: "Safety Excellence",
    description: "Maintained a 189-day safety streak with 0 recordable incidents for 6 months.",
  },
  {
    icon: <TriangleExclamationIcon />,
    iconClassName: "calloutIconWarning",
    title: "Audit Volume",
    description: "Customer audits are currently at 0 total with an N/A score, compared to 58 internal audits.",
  },
  {
    icon: <InfoCircleIcon />,
    iconClassName: "calloutIconNeutral",
    title: "Report-Its Volume",
    description: "227 report-its have been accepted this month, which is below the monthly average of 460.",
  },
];

/** "Site Performance Trends" — gridlines + axis labels + a single
 * dotted line, matching Site Dashboard.png's own chart rather than
 * charts.tsx's AreaSparkline (no gridlines/axis there, and this one
 * needs them for fidelity). Self-contained here since nothing else in
 * the app needs a line chart with visible axes. */
function TrendsLineChart() {
  const width = 720;
  const height = 220;
  const padLeft = 44;
  const padBottom = 24;
  const plotW = width - padLeft;
  const plotH = height - padBottom;
  const step = plotW / (TRENDS_VALUES.length - 1);
  const points = TRENDS_VALUES.map((v, i) => {
    const x = padLeft + i * step;
    const y = plotH - (v / TRENDS_MAX) * plotH;
    return [x, y] as const;
  });
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={styles.chartSvg} role="img" aria-label="Site performance trends, monthly">
      {TRENDS_TICKS.map((tick) => {
        const y = plotH - (tick / TRENDS_MAX) * plotH;
        return (
          <g key={tick}>
            <line x1={padLeft} y1={y} x2={width} y2={y} className={styles.gridLine} />
            <text x={padLeft - 10} y={y + 4} className={styles.axisLabel} textAnchor="end">
              {tick}
            </text>
          </g>
        );
      })}
      <path d={line} fill="none" className={styles.trendLine} />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={4} className={styles.trendDot} />
      ))}
      {TRENDS_MONTHS.map((month, i) => (
        <text key={month} x={padLeft + i * step} y={height - 4} className={styles.axisLabel} textAnchor="middle">
          {month}
        </text>
      ))}
    </svg>
  );
}

/** "Audit Score Breakdown" — same gridlines/axis-label treatment as
 * TrendsLineChart above, bars instead of a line. */
function AuditBarChart() {
  const width = 720;
  const height = 220;
  const padLeft = 32;
  const padBottom = 24;
  const plotW = width - padLeft;
  const plotH = height - padBottom;
  const barWidth = 96;
  const groupWidth = plotW / AUDIT_BARS.length;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={styles.chartSvg} role="img" aria-label="Audit score breakdown by type">
      {AUDIT_TICKS.map((tick) => {
        const y = plotH - (tick / AUDIT_MAX) * plotH;
        return (
          <g key={tick}>
            <line x1={padLeft} y1={y} x2={width} y2={y} className={styles.gridLine} />
            <text x={padLeft - 10} y={y + 4} className={styles.axisLabel} textAnchor="end">
              {tick}
            </text>
          </g>
        );
      })}
      {AUDIT_BARS.map((bar, i) => {
        const barHeight = (bar.value / AUDIT_MAX) * plotH;
        const x = padLeft + i * groupWidth + (groupWidth - barWidth) / 2;
        const y = plotH - barHeight;
        return (
          <g key={bar.label}>
            {barHeight > 0 && <rect x={x} y={y} width={barWidth} height={barHeight} rx={4} className={styles.auditBar} />}
            <text x={padLeft + i * groupWidth + groupWidth / 2} y={height - 4} className={styles.axisLabel} textAnchor="middle">
              {bar.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function SiteDashboardFullScreen({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Site performance dashboard, full screen">
      <div className={styles.scroll}>
        <div className={styles.page}>
          <header className={styles.header}>
            <div className={styles.headerMain}>
              <span className={styles.headerIcon}>
                <FinancialsIcon />
              </span>
              <div className={styles.headerText}>
                <h1 className={styles.title}>LGA-LaGuardia Site Performance Dashboard</h1>
                <p className={styles.meta}>Aug 01, 2026 – Aug 10, 2026</p>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button type="button" className={styles.exportButton} onClick={() => window.print()}>
                Export
                <FilePdfIcon />
              </button>
              <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close full screen dashboard">
                <CloseIcon />
              </button>
            </div>
          </header>
          <p className={styles.description}>
            This view provides a comprehensive overview of people management, safety streaks, audit performance, and site
            communications for the LaGuardia facility.
          </p>

          <div className={styles.card}>
            <div className={styles.tableHeaderRow}>
              <span>Metric</span>
              <span>Value</span>
              <span className={styles.trendHeaderCell}>Trend</span>
            </div>
            {METRICS.map((row) => (
              <div key={row.label} className={styles.metricRow}>
                <span className={styles.metricLabel}>
                  <span className={[styles.metricIcon, styles[row.iconClassName]].join(" ")}>{row.icon}</span>
                  {row.label}
                </span>
                <span className={[styles.metricValue, row.valueClassName ? styles[row.valueClassName] : ""].join(" ")}>
                  {row.value}
                  {row.unit && <span className={styles.metricUnit}> {row.unit}</span>}
                </span>
                <span className={styles.metricTrend}>
                  {row.trendIcon && <span className={styles.trendIcon}>{row.trendIcon}</span>}
                  {row.trend}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Site Performance Trends</h2>
            <p className={styles.cardDescription}>Monthly tracking of complaints and report-its submitted by staff.</p>
            <TrendsLineChart />
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Audit Score Breakdown</h2>
            <p className={styles.cardDescription}>Comparison of internal, joint, and customer audit averages.</p>
            <AuditBarChart />
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Daily Assignments</h2>
            <p className={styles.cardDescription}>Current staff assignments and supply pickup locations for August 11, 2026.</p>
            <div className={styles.assignmentsTable}>
              <div className={styles.assignmentsHeaderRow}>
                <span>Route</span>
                <span>Staff</span>
                <span>Location</span>
              </div>
              {ASSIGNMENTS.map((row) => (
                <div key={row.route} className={styles.assignmentsRow}>
                  <span>{row.route}</span>
                  <span>{row.staff}</span>
                  <span>{row.location}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Executive Summary</h2>
            <p className={styles.summaryText}>
              LGA-LaGuardia shows strong operational performance with an overall audit score of 4.82 across 59 total audits.
              The facility has maintained a perfect safety streak for 189 days, spanning 6 consecutive months without a
              recordable incident. Currently, 44 out of 238 team members are clocked in, contributing to a total of 12,350
              hours worked during this period.
            </p>
            <div className={styles.calloutList}>
              {CALLOUTS.map((c) => (
                <div key={c.title} className={styles.callout}>
                  <span className={[styles.calloutIcon, styles[c.iconClassName]].join(" ")}>{c.icon}</span>
                  <div>
                    <p className={styles.calloutTitle}>{c.title}</p>
                    <p className={styles.calloutDescription}>{c.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
