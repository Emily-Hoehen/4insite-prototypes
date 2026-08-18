import Link from "next/link";
import styles from "./QualityMegaMenu.module.css";

type Group = { title: string; items: string[] };

/** Four columns of Quality's own sub-sections, per the reference
 * screenshot — mostly a plausible site directory (most items aren't
 * real destinations in this prototype), except "Scope of Work",
 * which is: it's this project's actual Quality page. Every one of its
 * own sub-items points there too rather than only the column title,
 * so there's no dead end no matter which one gets clicked. */
const COLUMNS: Group[][] = [
  [
    { title: "Audits", items: ["Charts", "Details"] },
    { title: "Original SOW", items: [] },
    { title: "Surveys", items: ["Charts", "Details", "Activity"] },
    { title: "Quality Events", items: [] },
  ],
  [
    { title: "Complaints", items: ["Charts", "Details"] },
    { title: "Report Its", items: ["Charts", "Details"] },
    { title: "To Dos", items: ["Charts", "Details"] },
    { title: "Cabin Cleaning", items: [] },
  ],
  [
    { title: "Compliments", items: ["Charts", "Details"] },
    { title: "Service Validation", items: ["Charts", "By Employee", "Tracker"] },
    { title: "Verifications", items: [] },
  ],
  [
    { title: "Occupant Reports", items: ["Charts", "Details"] },
    { title: "Scope Of Work", items: ["Spaces", "People", "Details", "Summary"] },
    { title: "Work Orders", items: ["Charts", "Details"] },
  ],
];

/**
 * The nav's "Home" hover mega-menu — reached today only by hovering
 * "Home" (see OliviaDashboard), not built as a per-link menu for every
 * nav item. No Figma reference; laid out from the provided screenshot
 * against this project's existing card/link conventions. "Scope Of
 * Work" and its own sub-items are the only real destination here —
 * everything else is placeholder site-directory content, same scope
 * as this prototype's other placeholder lists (e.g. Communication
 * Center's PLACEHOLDER_COPY).
 */
export function QualityMegaMenu({ basePath = "" }: { basePath?: string }) {
  const qualityHref = `${basePath}/quality`;
  return (
    <div className={styles.panel}>
      <div className={styles.columns}>
        {COLUMNS.map((column, i) => (
          <div key={i} className={styles.column}>
            {column.map((group) => {
              const isScopeOfWork = group.title === "Scope Of Work";
              return (
                <div key={group.title} className={styles.group}>
                  {isScopeOfWork ? (
                    <Link href={qualityHref} className={styles.groupTitle} style={{ textDecoration: "none" }}>
                      {group.title}
                    </Link>
                  ) : (
                    <p className={styles.groupTitle}>{group.title}</p>
                  )}
                  {group.items.map((item) => (
                    <Link
                      key={item}
                      href={isScopeOfWork ? qualityHref : "#"}
                      className={styles.groupLink}
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className={styles.aside}>
        <p className={styles.asideTitle}>Quality</p>
        <p className={styles.asideBody}>
          Quality is leaving no stone unturned. From scoring the entire site with customer feedback to keeping up on
          the stack by making necessary adjustments, Quality is where we get the job done.
        </p>
        <Link href={qualityHref} className={styles.asideLink}>
          More Help
        </Link>
      </div>
    </div>
  );
}
