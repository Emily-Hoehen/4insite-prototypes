"use client";

import { OliviaScope } from "./oliviaContent";
import { ExpandIcon, FilePdfIcon } from "../../icons";
import styles from "./LiveDashboardChatCard.module.css";

/** Page-scoped preview — a real screenshot rather than a rebuilt live
 * table/chart, per the reference this was built from. Public assets
 * are served at their literal filename; the space has to be
 * percent-encoded for use in a URL. */
export const LIVE_DASHBOARD_IMAGE_SRC = "/dashboard/Live%20Dashboard.png";

/** Site-scoped preview — public/dashboard/sitedashpreview3.png, a
 * purpose-cropped capture (header + first metric row, faded off at
 * the bottom) sized to actually work as a card preview, unlike the
 * full "Site Dashboard.png" capture SiteDashboardFullScreen
 * transcribes (300px wide, ~9x taller than wide — fine as a content
 * reference to build a full-screen page from, not as an image to show
 * directly at chat-bubble width). Own title/date/description already
 * baked into the image itself (unlike LIVE_DASHBOARD_IMAGE_SRC's
 * crop, which starts below that) — see `hasTextBlock` below. */
export const SITE_DASHBOARD_IMAGE_SRC = "/dashboard/sitedashpreview3.png";

/** Quality's own page-scoped preview — public/dashboard/
 * scopeofworkdashpreview.png, same "header + first metric row, faded
 * off" crop as SITE_DASHBOARD_IMAGE_SRC, branded for Quality's real
 * name in this app (Scope of Work — see QualityMegaMenu's own doc
 * comment) rather than reusing the generic LGA-LaGuardia page image. */
export const SCOPE_OF_WORK_DASHBOARD_IMAGE_SRC = "/dashboard/scopeofworkdashpreview.png";

type PageVariant = "scopeOfWork";
type DashboardCopy = { title: string; description: string; image: string; hasTextBlock: boolean };

const COPY: Record<OliviaScope, DashboardCopy> = {
  page: {
    title: "LGA-LaGuardia Site Performance Dashboard",
    description:
      "This page provides a comprehensive overview of people management, site performance, safety streaks, and audit results for the LaGuardia facility.",
    image: LIVE_DASHBOARD_IMAGE_SRC,
    hasTextBlock: true,
  },
  site: {
    title: "LGA-LaGuardia Site Performance Dashboard",
    description:
      "This view provides a comprehensive overview of people management, safety streaks, audit performance, and site communications for the LaGuardia facility.",
    image: SITE_DASHBOARD_IMAGE_SRC,
    // The image itself already leads with this same title/date/
    // description (see SITE_DASHBOARD_IMAGE_SRC's own comment) — a
    // second, live copy of it directly above would just repeat it.
    hasTextBlock: false,
  },
};

/** Per-page overrides of COPY's own "page" entry — only Quality has
 * one so far (see useOliviaSession's generateLiveDashboard, which
 * only ever sets `pageVariant: "scopeOfWork"` when `activePage ===
 * "quality"`); every other page still falls through to COPY.page. */
const COPY_BY_PAGE: Record<PageVariant, DashboardCopy> = {
  scopeOfWork: {
    title: "Scope of Work Performance Dashboard",
    description:
      "This view monitors real-time service activity, area coverage, and quality scores across multiple facility zones and building elements.",
    image: SCOPE_OF_WORK_DASHBOARD_IMAGE_SRC,
    // Same reasoning as site scope above — baked into the image already.
    hasTextBlock: false,
  },
};

/**
 * The "live dashboard's ready" reply that lives inside Olivia's own
 * chat bubble (Figma node 2209:35164) — View Full Screen/Export
 * actions up top, then a preview of the dashboard itself underneath,
 * same shape as ReportPreviewCard's own report-ready card just above
 * it in the same file tree. Page scope's preview leads with a live
 * title/date/description block above its image (COPY's own
 * `hasTextBlock`); site scope's image already bakes that same header
 * in, so it skips the live copy instead of repeating it. Clicking the
 * preview image itself also opens full screen — Figma only wires the
 * explicit button, but a screenshot that looks like a live dashboard
 * reads as clickable on its own.
 *
 * View Full Screen leads and is the solid/primary action, Export
 * trails as the ghost/secondary one, per the user's own reference —
 * seeing the dashboard is the more likely next step than exporting it
 * sight unseen, so it gets the stronger visual weight. Both buttons
 * stack full-width now rather than splitting one row in half.
 *
 * `scope` picks which of the two reference images/copy blocks above to
 * show — see SITE_DASHBOARD_IMAGE_SRC's own comment for why site gets
 * a distinct, purpose-cropped asset instead of reusing the page-scoped
 * treatment's plain full-width image. `pageVariant`, when given,
 * overrides `scope: "page"`'s own generic entry with a page-specific
 * one instead (COPY_BY_PAGE) — e.g. Quality's own "Scope of Work"
 * branding rather than the generic LGA-LaGuardia page image.
 */
export function LiveDashboardPreviewCard({
  scope,
  pageVariant,
  onViewFullScreen,
}: {
  scope: OliviaScope;
  pageVariant?: PageVariant;
  onViewFullScreen: () => void;
}) {
  const copy = pageVariant ? COPY_BY_PAGE[pageVariant] : COPY[scope];
  return (
    <div className={styles.wrap}>
      <div className={styles.actions}>
        <button type="button" className={styles.viewFullScreenButton} onClick={onViewFullScreen}>
          View Full Screen
          <ExpandIcon />
        </button>
        <button type="button" className={styles.exportButton} onClick={() => window.print()}>
          Export Dashboard
          <FilePdfIcon />
        </button>
      </div>

      <div className={[styles.preview, copy.hasTextBlock ? "" : styles.previewNoPadding].join(" ")}>
        {copy.hasTextBlock && (
          <>
            <p className={styles.previewTitle}>{copy.title}</p>
            <p className={styles.previewMeta}>Aug 1, 2026 – Aug 10, 2026</p>
            <p className={styles.previewDescription}>{copy.description}</p>
          </>
        )}
        <button
          type="button"
          className={[styles.previewImageButton, copy.hasTextBlock ? "" : styles.previewImageButtonFullBleed].join(" ")}
          onClick={onViewFullScreen}
          aria-label="View full screen"
        >
          <img src={copy.image} alt={copy.title} className={styles.previewImage} />
        </button>
      </div>
    </div>
  );
}
