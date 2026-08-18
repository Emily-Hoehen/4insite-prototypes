"use client";

import { useState } from "react";
import type { ServiceAnalysis } from "./oliviaContent";
import { QualitySummaryCards } from "./QualitySummaryCards";
import { ServiceAnalysisChatCard } from "./ServiceAnalysisChatCard";
import styles from "./SummaryPager.module.css";

export type SummaryPage = "quality" | "service";

/**
 * The Quality page summary ("Full Summary") and a single service's own
 * analysis ("Service Summary"), as two full-width tabs of ONE Olivia
 * reply instead of two separate turns you navigate between by
 * replacing the conversation — both richContent: "qualitySummary" and
 * richContent: "serviceAnalysis" messages render this same component
 * (see AskView), just with a different `initialPage`. Switching tabs
 * is local UI state, not a new message: it doesn't touch the session,
 * re-trigger the no-scroll effect, or add anything to the log — it
 * just changes what this one bubble is currently showing.
 *
 * Service Summary leads (both as the left tab and, whenever a service
 * exists, as the one that's actually showing) — clicking a service
 * photo is what this whole flow is for, so its own read should be the
 * first thing on screen, with the site-wide Full Summary as the
 * secondary, opt-into tab beside it.
 *
 * Every new service clicked in ServiceHistoryModal creates a genuinely
 * new message (see useOliviaSession's showServiceAnalysis), so this
 * component remounts fresh at `initialPage="service"` each time — a
 * new photo always opens showing ITS OWN summary, even if the previous
 * bubble had been flipped to "Full Summary," since that flip was local
 * to the old, now-replaced message.
 *
 * The tab row (and the ability to flip at all) only appears once a
 * service has actually been analyzed this session (`serviceAnalysis`
 * set) — before that there's nothing on the other side to switch to,
 * so the Full Summary renders plainly instead of implying a second tab
 * that doesn't exist yet.
 */
export function SummaryPager({
  initialPage,
  serviceAnalysis,
}: {
  initialPage: SummaryPage;
  /** The most recently analyzed service, if any (see useOliviaSession's
   * own lastServiceAnalysis) — independent of which richContent THIS
   * particular message carries, so the Quality-summary page of an
   * older message can still flip forward to whatever was last viewed. */
  serviceAnalysis: ServiceAnalysis | null;
}) {
  const [page, setPage] = useState<SummaryPage>(initialPage);
  const hasService = !!serviceAnalysis;
  const showingQuality = page === "quality" || !hasService;

  return (
    <div className={styles.wrap}>
      {hasService && (
        // Service Summary leads (left) — this is what a service click
        // itself is for, so it reads as the default, with Full Summary
        // as the secondary, opt-into tab beside it, not the other way
        // around.
        <div className={styles.tabs}>
          <button
            type="button"
            className={[styles.tab, !showingQuality ? styles.tabActive : ""].filter(Boolean).join(" ")}
            onClick={() => setPage("service")}
            aria-pressed={!showingQuality}
          >
            Service Summary
          </button>
          <button
            type="button"
            className={[styles.tab, showingQuality ? styles.tabActive : ""].filter(Boolean).join(" ")}
            onClick={() => setPage("quality")}
            aria-pressed={showingQuality}
          >
            Full Summary
          </button>
        </div>
      )}

      {showingQuality ? (
        <QualitySummaryCards />
      ) : (
        serviceAnalysis && <ServiceAnalysisChatCard analysis={serviceAnalysis} />
      )}
    </div>
  );
}
