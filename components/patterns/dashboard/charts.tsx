/**
 * Small, data-driven chart primitives for the Olivia dashboard
 * (Figma node 2006:979, "Front Page Desktop"). Figma exports each
 * chart as dozens of individually-positioned divs/dots — these
 * components reproduce the same visual result from a data array
 * instead, which is the maintainable equivalent per the
 * design-to-code guidance to adapt reference output rather than
 * paste it verbatim.
 */

import styles from "./charts.module.css";

export type BarSeries = { heightPct: number; color: string };
export type BarGroup = { label: string; labelColor?: string; bars: BarSeries[] };

export type BarChartProps = {
  groups: BarGroup[];
  height?: number;
  barWidth?: number;
  className?: string;
};

/** Vertical grouped/stacked bar chart — Turnover, Complaints Daily, Report Its, Map minis. */
export function BarChart({ groups, height = 72, barWidth = 8, className }: BarChartProps) {
  return (
    <div className={[styles.barChart, className].filter(Boolean).join(" ")} style={{ height }}>
      {groups.map((group, i) => (
        <div key={i} className={styles.barGroupCol}>
          <div className={styles.barGroup} style={{ height }}>
            {group.bars.map((bar, j) => (
              <span
                key={j}
                className={styles.bar}
                style={{
                  height: `${bar.heightPct}%`,
                  width: barWidth,
                  backgroundColor: bar.color,
                }}
              />
            ))}
          </div>
          <span className={styles.barLabel} style={{ color: group.labelColor }}>
            {group.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export type DotMonth = {
  label: string;
  /** 5 rows x 7 cols, true = filled dot. `full: true` shorthand fills everything. */
  grid?: boolean[][];
  full?: boolean;
  /** [row, col] of the single highlighted "marker" dot, if any. */
  marker?: [number, number];
  color: string;
  markerColor?: string;
};

const FULL_GRID: boolean[][] = Array.from({ length: 5 }, () => Array(7).fill(true));

/** Recordable-days dot-grid heatmap — one column of dots per month. */
export function DotHeatmap({ months }: { months: DotMonth[] }) {
  return (
    <div className={styles.dotHeatmap}>
      {months.map((month, mi) => {
        const grid = month.full ? FULL_GRID : month.grid ?? FULL_GRID;
        return (
          <div key={mi} className={styles.dotMonthCol}>
            <span className={styles.dotMonthLabel}>{month.label}</span>
            <div className={styles.dotGrid}>
              {grid.map((row, ri) =>
                row.map((on, ci) => {
                  const isMarker = month.marker?.[0] === ri && month.marker?.[1] === ci;
                  return (
                    <span
                      key={`${ri}-${ci}`}
                      className={styles.dot}
                      style={{
                        backgroundColor: isMarker
                          ? month.markerColor ?? "var(--color-danger-300)"
                          : on
                            ? month.color
                            : "var(--color-neutral-700)",
                      }}
                    />
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export type DonutChartProps = {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
};

/** Ring progress indicator — Work Orders "82% completed on time". */
export function DonutChart({
  percent,
  size = 72,
  strokeWidth = 8,
  color = "var(--color-datavis-teal-100)",
  trackColor = "var(--color-neutral-700)",
  label,
}: DonutChartProps) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - percent / 100);
  return (
    <div className={styles.donutWrap} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {label && <span className={styles.donutLabel}>{label}</span>}
    </div>
  );
}

/** Filled area sparkline — Hours Worked trend. Points are 0-100, left = oldest. */
export function AreaSparkline({
  points,
  width = 296,
  height = 70,
  color = "var(--color-primary-100)",
}: {
  points: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  const step = width / (points.length - 1);
  const coords = points.map((p, i) => [i * step, height - (p / 100) * height] as const);
  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  const gradId = "sparkline-fill";
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={styles.sparkline}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/** Star rating row — filled/half/empty stars for review scores. */
export function StarRow({ score, max = 5, size = 20 }: { score: number; max?: number; size?: number }) {
  return (
    <div className={styles.starRow} style={{ height: size }}>
      {Array.from({ length: max }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, score - i));
        return (
          <span key={i} className={styles.starSlot} style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox="0 0 24 24" className={styles.starBase}>
              <polygon
                points="12 2.5 15.09 8.76 22 9.76 17 14.64 18.18 21.52 12 18.27 5.82 21.52 7 14.64 2 9.76 8.91 8.76"
                fill="var(--color-neutral-700)"
              />
            </svg>
            {fill > 0 && (
              <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                className={styles.starFill}
                style={{ clipPath: `inset(0 ${100 - fill * 100}% 0 0)` }}
              >
                <polygon
                  points="12 2.5 15.09 8.76 22 9.76 17 14.64 18.18 21.52 12 18.27 5.82 21.52 7 14.64 2 9.76 8.91 8.76"
                  fill="var(--color-warning-300)"
                />
              </svg>
            )}
          </span>
        );
      })}
    </div>
  );
}
