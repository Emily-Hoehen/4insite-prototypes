/**
 * Canned content for the Olivia AI panel prototype. Every figure
 * here matches what's already shown on the live dashboard (see
 * PeopleSection / SiteHealthSection) — Olivia references the same
 * underlying data the rest of 4insite already surfaces, per the
 * consolidation brief's "same audience, same data" framing.
 */

export type OliviaTopic = "safety" | "complaint" | "audit";

/**
 * A proactive, Olivia-authored suggestion based on what she already
 * knows about this user/site — distinct from SUGGESTED_PROMPTS (which
 * are generic starter questions anyone would see): these are framed as
 * Olivia's own idea ("Would you like me to…?"), grouped under a short
 * category label, per the reference screenshot's "Hey Mark, here are
 * your suggestions" panel (Site Scorecards / Staffing Details /
 * Performance Analysis). Picking one echoes `question` as if the user
 * asked it, then answers with `reply` — same turn-taking shape as
 * SUGGESTED_PROMPTS, just with its own canned reply instead of routing
 * through matchTopic (see useOliviaSession's askPersonalizedSuggestion).
 */
export type PersonalizedSuggestion = {
  id: string;
  /** Short eyebrow label shown above the question (e.g. "Site Scorecards"). */
  category: string;
  /** Shown as the row's own copy, and echoed as if the user asked it when picked. */
  question: string;
  /** What Olivia says back once picked — the "output" this suggestion produces. */
  reply: string;
};

/** Three suggestions, matching the reference screenshot's own category
 * set — figures pulled from SITE_OVERVIEW/PAGE_SUMMARY_SECTIONS below
 * so they stay consistent with everything else Olivia already knows
 * about Detroit, MI (DTW). Order (Staffing, Performance, Scorecard)
 * and copy match Figma node 2360:30996's latest pull — `question` is
 * an imperative statement for all three now, not a literal question,
 * but it's still echoed as the user's own turn when picked (see
 * useOliviaSession's askPersonalizedSuggestion) — the field name
 * describes its role, not its grammar. `category` no longer renders
 * anywhere (see PersonalizedSuggestions' own per-suggestion icon,
 * keyed off `id`) but stays on the data for its aria-label. */
export const PERSONALIZED_SUGGESTIONS: PersonalizedSuggestion[] = [
  {
    id: "staffingDetails",
    category: "Staffing Details",
    question: "Run a deeper analysis on my current staff breakdown to help with planning.",
    reply:
      "You're at 239 employees on staff with 10% turnover this month — 14 new hires against 12 separations. Same-day coverage is holding at 100% of scope of work assigned across all 166 routes.",
  },
  {
    id: "performanceAnalysis",
    category: "Performance Analysis",
    question: "Take another look at the scorecard analysis to see if there have been any recent performance shifts.",
    reply:
      "Performance is trending ahead of the network: 150 days recordable-free and a 3.55 average audit score across 11 areas, both above benchmark. Complaint volume is down 8% year-over-year, so nothing's slipping this cycle.",
  },
  {
    id: "siteScorecards",
    category: "Site Scorecard",
    question: "Pull up the latest summary for the site scorecards page.",
    reply:
      "Detroit, MI (DTW) is averaging 3.56 / 5.00 on the site scorecard, factoring in audits, complaints, and service validation over the last 6 months — 0.15 above the SBM network benchmark.",
  },
];

/**
 * Olivia's proactive, already-generated summary of the Quality page
 * ("Scope of Work") — shown as her own opening message the moment
 * she's opened from that page, instead of waiting to be asked. Not a
 * topic Q&A like OLIVIA_ANSWERS below: there's no question behind it,
 * it's an unprompted overview, so it's a plain string rather than a
 * {reply, slides, report} shape. Figures match QualityPageContent's
 * own stats line — same underlying data, just said out loud.
 */
export const QUALITY_PAGE_SUMMARY =
  "I already looked at Scope of Work for you — today, 94 team members have completed 1,775 of the 2,884 expected verifications (about 62%) across 39 area types, logging 423h 9m of the 496h 55m of paid hours planned (85%) while supporting 524 flights. Recent Activity is trending well: most Spot Clean and Full Service checks are scoring 4.8 or higher.";

export type SuggestedPrompt = {
  topic: OliviaTopic;
  /** The prompt as shown — a full statement or question, not a short
   * chip label (per Figma nodes 2059:112/2066:182). */
  label: string;
  /** Text echoed as if the user typed it — usually the same as `label`,
   * occasionally phrased slightly more like a first-person question. */
  question: string;
};

export type PresenterSlide = {
  eyebrow: string;
  headline: string;
  caption: string;
  stat?: string;
  statLabel?: string;
};

export type ReportContent = {
  title: string;
  summary: string;
  bullets: string[];
};

export type OliviaAnswer = {
  topic: OliviaTopic;
  /** What Olivia "says" in the chat log. */
  reply: string;
  slides: PresenterSlide[];
  report: ReportContent;
};

export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    topic: "safety",
    label: "Tell me the last safety recordable",
    question: "Tell me the last safety recordable",
  },
  {
    topic: "complaint",
    label: "What is the latest complaint?",
    question: "What is the latest complaint?",
  },
  {
    topic: "audit",
    label: "What was the last customer audit?",
    question: "What was the last customer audit?",
  },
];

/** Shown instead of the mixed-topic list above when Olivia already knows
 * she's scoped to Safety (e.g. opened from the Safety page) — same
 * statement/question phrasing, all pointing at the one topic she's
 * already set to. */
export const SAFETY_SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    topic: "safety",
    label: "Tell me the last safety recordable",
    question: "Tell me the last safety recordable",
  },
  {
    topic: "safety",
    label: "How long since our last incident?",
    question: "How long since our last incident?",
  },
  {
    topic: "safety",
    label: "What's driving our recordable-free streak?",
    question: "What's driving our recordable-free streak?",
  },
];

/** Same idea as SAFETY_SUGGESTED_PROMPTS, generalized to every topic — the
 * "Hi Emily" greeting (HomeGreeting) uses whichever of these matches
 * whatever topic Olivia was opened with (a card's "Ask Olivia" trigger,
 * the Safety page, etc.), per Figma node 2082:434: she still leads with
 * the personal greeting, not a topic-locked screen, but the prompts
 * below it stay on-topic. Built from TOPIC_QUICK_QUESTIONS' first three
 * phrasings per topic so there's exactly one source of truth for them. */
export const TOPIC_SUGGESTED_PROMPTS: Record<OliviaTopic, SuggestedPrompt[]> = {
  safety: SAFETY_SUGGESTED_PROMPTS,
  complaint: [
    { topic: "complaint", label: "What's the latest complaint?", question: "What's the latest complaint?" },
    { topic: "complaint", label: "How many complaints this month?", question: "How many complaints this month?" },
    { topic: "complaint", label: "Is complaint volume trending up?", question: "Is complaint volume trending up?" },
  ],
  audit: [
    { topic: "audit", label: "When was our last customer audit?", question: "When was our last customer audit?" },
    { topic: "audit", label: "What was the audit score?", question: "What was the audit score?" },
    { topic: "audit", label: "Who conducted the audit?", question: "Who conducted the audit?" },
  ],
};

export const TOPIC_LABEL: Record<OliviaTopic, string> = {
  safety: "Safety",
  complaint: "Complaints",
  audit: "Audits",
};

/** Per-topic tinted swatch behind TopicIcon on the "Ask about your site
 * performance" zero-state rows — "panelContext" and the FAB modal use
 * this (distinct color per topic); "panelIcons" uses a uniform purple
 * swatch instead (see OutputsAndPerformanceLists' `performanceSwatch`
 * prop) per its own Figma reference (node 2123:2012). Colors per
 * Figma node 2119:1942. */
export const TOPIC_SWATCH: Record<OliviaTopic, { bg: string; color: string }> = {
  safety: { bg: "rgba(255, 67, 51, 0.2)", color: "#ff4333" },
  complaint: { bg: "rgba(255, 157, 25, 0.2)", color: "#ff9d19" },
  audit: { bg: "rgba(0, 132, 255, 0.2)", color: "#0084ff" },
};

/**
 * A handful of plausible phrasings per topic for the contextual
 * "How can I help with X?" greeting — every one resolves to that
 * topic's single canned answer (see OLIVIA_ANSWERS), which is
 * written broadly enough to cover each phrasing. This is a
 * prototype simplification: real Olivia would answer each
 * distinctly, but the point here is showing richer, more relevant
 * suggestions than one generic prompt per topic.
 */
export const TOPIC_QUICK_QUESTIONS: Record<OliviaTopic, string[]> = {
  safety: [
    "What's our last safety recordable?",
    "How long since our last incident?",
    "How does this compare to last year?",
    "What's driving our recordable-free streak?",
  ],
  complaint: [
    "What's the latest complaint?",
    "How many complaints this month?",
    "Is complaint volume trending up?",
    "How does this compare to last month?",
  ],
  audit: [
    "When was our last customer audit?",
    "What was the audit score?",
    "Who conducted the audit?",
    "Where did the audit take place?",
  ],
};

export const OLIVIA_ANSWERS: Record<OliviaTopic, OliviaAnswer> = {
  safety: {
    topic: "safety",
    reply:
      "Detroit, MI (DTW) has gone 150 days without a recordable safety incident. The last one was logged Dec 6, 2021 — the site's longest recordable-free streak in the last two years.",
    slides: [
      {
        eyebrow: "Safety · Detroit, MI (DTW)",
        headline: "150 days recordable-free",
        stat: "150",
        statLabel: "days since last recordable",
        caption: "Detroit has now gone 150 days without a recordable safety incident.",
      },
      {
        eyebrow: "Safety · Detroit, MI (DTW)",
        headline: "Last recordable: Dec 6, 2021",
        caption:
          "The most recent recordable happened over two years ago, with no repeat pattern since.",
      },
      {
        eyebrow: "Safety · Detroit, MI (DTW)",
        headline: "Trending ahead of target",
        caption: "At this pace, Detroit is on track to beat last year's longest streak by June.",
      },
    ],
    report: {
      title: "Safety Recordables — Detroit, MI (DTW)",
      summary:
        "A rollup of recordable safety incidents for the Detroit (DTW) site, generated on demand from live 4insite data.",
      bullets: [
        "150 consecutive days without a recordable incident",
        "Last recordable: December 6, 2021",
        "0 recordables logged in the last 3 reporting months",
        "Site trending above the SBM network average",
      ],
    },
  },
  complaint: {
    topic: "complaint",
    reply:
      "The most recent complaint at Detroit, MI (DTW) came in on May 2, 2023 — 12 days ago. There have been 6 complaints this month total, one more than last month.",
    slides: [
      {
        eyebrow: "Complaints · Detroit, MI (DTW)",
        headline: "12 days since last complaint",
        stat: "12",
        statLabel: "days since last complaint",
        caption: "The most recent complaint was filed May 2, 2023.",
      },
      {
        eyebrow: "Complaints · Detroit, MI (DTW)",
        headline: "6 complaints this month",
        caption: "That's a slight increase — 1 more than last month's total.",
      },
      {
        eyebrow: "Complaints · Detroit, MI (DTW)",
        headline: "Worth a closer look",
        caption: "Complaint volume has ticked up two months running — worth flagging to the account manager.",
      },
    ],
    report: {
      title: "Complaint Summary — Detroit, MI (DTW)",
      summary:
        "A rollup of complaint volume and recency for the Detroit (DTW) site, generated on demand from live 4insite data.",
      bullets: [
        "Last complaint: May 2, 2023 (12 days ago)",
        "6 complaints logged this month",
        "Increase of 1 complaint vs. last month",
        "No complaint has recurred at the same location twice",
      ],
    },
  },
  audit: {
    topic: "audit",
    reply:
      "The last customer audit at Detroit, MI (DTW) was an internal audit on June 20, 2023 at 10:03 AM, covering Terminal A - DTW, A3 - Concourse Above Wing. It scored 3.60, conducted by Francisco Navarro.",
    slides: [
      {
        eyebrow: "Audits · Detroit, MI (DTW)",
        headline: "Internal audit — 3.60 score",
        stat: "3.60",
        statLabel: "overall score",
        caption: "Conducted June 20, 2023 at 10:03 AM in Terminal A - DTW, A3 - Concourse Above Wing.",
      },
      {
        eyebrow: "Audits · Detroit, MI (DTW)",
        headline: "Auditor: Francisco Navarro",
        caption: "Notes flagged seating areas and window ledges for follow-up cleaning.",
      },
      {
        eyebrow: "Audits · Detroit, MI (DTW)",
        headline: "47% of scope audited this cycle",
        caption: "453 audits completed across 11 areas, averaging a 3.55 score over the last 30 days.",
      },
    ],
    report: {
      title: "Customer Audit Report — Detroit, MI (DTW)",
      summary:
        "Details from the most recent internal audit at the Detroit (DTW) site, generated on demand from live 4insite data.",
      bullets: [
        "Audit date: June 20, 2023, 10:03 AM",
        "Area: Terminal A - DTW, A3 - Concourse Above Wing",
        "Score: 3.60 / 5.00, conducted by Francisco Navarro",
        "30-day average across all areas: 3.55 (453 audits, 11 areas)",
      ],
    },
  },
};

/** The "Offline Report" modal's feature checklist (Figma node
 * 2121:56291's entry flow) — broader, site-wide categories than the
 * three chat topics above, since an offline report rolls up more than
 * Olivia's own Q&A. Order matches the design. All start checked. */
export const OFFLINE_REPORT_FEATURES = [
  "Account",
  "Safety",
  "Compliance",
  "Staffing",
  "Quality",
  "Scope Of Work",
  "Surveys",
] as const;

export type OfflineReportFeature = (typeof OFFLINE_REPORT_FEATURES)[number];

/** Best-effort keyword match so free-typed questions still resolve to a topic. */
export function matchTopic(input: string): OliviaTopic | null {
  const q = input.toLowerCase();
  if (/(safety|recordable|incident)/.test(q)) return "safety";
  if (/(complaint)/.test(q)) return "complaint";
  if (/(audit|inspection|score)/.test(q)) return "audit";
  return null;
}

/* ================================================================
   Scope: "page" vs. "site"
   Olivia can present or report on just the view you're looking at
   (this dashboard) or roll up the entire site (People, Quality,
   Safety, Financials). Scope is independent of topic — you can
   narrow either overview down to a specific topic, or widen a
   topic answer out to site-wide context.
   ================================================================ */

export type OliviaScope = "page" | "site";

export const CURRENT_VIEW_LABEL = "Home Dashboard";
export const SITE_LABEL = "Detroit, MI (DTW)";

/** The last-10-days window every report is framed as covering —
 * shared by the compact in-chat report preview (ReportChatCard) and
 * the full standalone page (OliviaReportPage) so they never disagree
 * about what period "this report" means. */
export function reportingWindowLabel(): string {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 9);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

type OverviewContent = {
  slides: PresenterSlide[];
  report: ReportContent;
};

/** Everything currently rendered on this specific dashboard view. */
const PAGE_OVERVIEW: OverviewContent = {
  slides: [
    {
      eyebrow: "This page · " + CURRENT_VIEW_LABEL,
      headline: "Detroit, MI (DTW) at a glance",
      caption: "A snapshot of everything on this dashboard right now.",
    },
    {
      eyebrow: "People",
      headline: "39 clocked in, 100% of work assigned",
      caption: "239 employees on staff, with all 166 routes fully assigned for the day.",
    },
    {
      eyebrow: "Site Performance",
      headline: "150 days recordable-free",
      caption: "Work orders are 82% complete on time, and the last customer audit scored 3.60.",
    },
    {
      eyebrow: "Communication",
      headline: "1,000 Report Its logged last month",
      caption: "Down 123 from the month before — complaint and safety trends are holding steady.",
    },
  ],
  report: {
    title: `Home Dashboard Summary — ${SITE_LABEL}`,
    summary:
      "Everything currently shown on this dashboard view, generated on demand from live 4insite data.",
    bullets: [
      "39 employees clocked in (100% of scope of work assigned)",
      "150 days since the last recordable safety incident",
      "Work orders 82% completed on time; last audit scored 3.60",
      "1,000 Report Its logged last month, trending down 123 from the month before",
    ],
  },
};

/** A rollup across the whole site — beyond just what's on this page. */
const SITE_OVERVIEW: OverviewContent = {
  slides: [
    {
      eyebrow: `Entire site · ${SITE_LABEL}`,
      headline: "Site-wide performance summary",
      caption: "Rolling up People, Quality, Safety, and Financials for the whole site.",
    },
    {
      eyebrow: "Safety & Quality",
      headline: "Trending ahead of the SBM network",
      caption:
        "150 days recordable-free and a 3.55 average audit score across 11 areas — both above network benchmarks.",
    },
    {
      eyebrow: "People",
      headline: "239 employees, 10% turnover this month",
      caption: "14 new hires against 12 separations, with same-day coverage holding at 100% assigned.",
    },
    {
      eyebrow: "Financials & Scorecard",
      headline: "3.56 / 5.00 site scorecard",
      caption: "Averaged across the last 6 months, factoring in audits, complaints, and service validation.",
    },
  ],
  report: {
    title: `Site-Wide Summary — ${SITE_LABEL}`,
    summary:
      "A rollup across every area of the site — People, Quality, Safety, and Financials — generated on demand from live 4insite data.",
    bullets: [
      "Site scorecard: 3.56 / 5.00, averaged over the last 6 months",
      "150 days recordable-free; 3.55 average audit score across 11 areas",
      "239 employees on staff; 10% turnover this month (14 hires, 12 separations)",
      "100% of scope of work assigned across 166 routes",
    ],
  },
};

/** Extra site-wide framing appended to a topic answer when scope is widened to "site". */
const SITE_CONTEXT: Record<OliviaTopic, { slide: PresenterSlide; bullet: string }> = {
  safety: {
    slide: {
      eyebrow: "Site-wide context",
      headline: "Top 15% for recordable-free streaks",
      caption: "Across every SBM-managed site, Detroit ranks in the top 15% this quarter.",
    },
    bullet: "Site-wide: Detroit ranks in the top 15% of SBM sites for recordable-free streaks this quarter",
  },
  complaint: {
    slide: {
      eyebrow: "Site-wide context",
      headline: "Complaints down 8% year over year",
      caption: "Across all 4insite-managed properties, complaint volume is trending down 8% versus last year.",
    },
    bullet: "Site-wide: complaint volume is down 8% year-over-year across all managed properties",
  },
  audit: {
    slide: {
      eyebrow: "Site-wide context",
      headline: "0.15 above the network benchmark",
      caption: "This audit contributes to Detroit's 3.55 average — 0.15 above the SBM network benchmark.",
    },
    bullet: "Site-wide: Detroit's 3.55 average audit score is 0.15 above the SBM network benchmark",
  },
};

/**
 * Resolve the slide deck for a given topic + scope. With no topic,
 * this is the page/site overview deck; with a topic, "site" scope
 * appends one slide of cross-site context to the topic's own deck.
 */
export function getPresenterSlides(topic: OliviaTopic | null, scope: OliviaScope): PresenterSlide[] {
  if (!topic) return scope === "page" ? PAGE_OVERVIEW.slides : SITE_OVERVIEW.slides;
  const base = OLIVIA_ANSWERS[topic].slides;
  return scope === "site" ? [...base, SITE_CONTEXT[topic].slide] : base;
}

/** The very first thing Olivia "says" once a presentation opens,
 * before any real data — Figma node 2188:13194's own greeting line.
 * Shared by both presentation experiences (the in-chat PresenterView
 * and the "external" flow's full-viewport ExternalPresenterView) so
 * they open on the same beat. Scope/topic-agnostic on purpose: it's
 * the same opener regardless of what's being presented. */
export const PRESENTER_INTRO_SLIDE: PresenterSlide = {
  eyebrow: "",
  headline: "Hi I’m Olivia, your AI assistant here to walk you through your data within 4insite…",
  caption: "",
};

/** One flowing sentence Olivia "reads" for a given slide — there's no
 * audio (per the product decision behind both presentation views), so
 * the stat and the story around it both have to live in this single
 * on-screen/captioned line instead of splitting across a separate
 * big-number callout. Most slide headlines already state their stat
 * in words (e.g. "12 days since last complaint"), so stitching
 * headline + caption together reads as one narrated beat without
 * needing to re-derive the number into a sentence by hand. */
export function presenterNarration(slide: PresenterSlide): string {
  if (!slide.caption) return slide.headline;
  return `${slide.headline}. ${slide.caption}`;
}

/** Same idea as {@link getPresenterSlides}, for the Report mode. */
export function getReportContent(topic: OliviaTopic | null, scope: OliviaScope): ReportContent {
  if (!topic) return scope === "page" ? PAGE_OVERVIEW.report : SITE_OVERVIEW.report;
  const base = OLIVIA_ANSWERS[topic].report;
  return scope === "site" ? { ...base, bullets: [...base.bullets, SITE_CONTEXT[topic].bullet] } : base;
}

/**
 * The standalone report page's URL for a given topic/feature set —
 * shared by every "open the real report" action: the in-chat preview
 * card's Download button (ReportChatCard), and the "external" report
 * flow's own auto-open-on-finish behavior (useOliviaSession), so they
 * can't silently drift into two different query-string shapes.
 */
export function reportPageUrl(topic: OliviaTopic | null, features: OfflineReportFeature[]): string {
  const params = new URLSearchParams();
  if (topic) params.set("topic", topic);
  if (features.length > 0) params.set("features", features.join(","));
  const query = params.toString();
  return `/olivia-report${query ? `?${query}` : ""}`;
}

/**
 * Triggers a browser download of a report as plain text — shared by
 * ReportView (the in-panel download) and OliviaReportPage (the full,
 * new-tab view), so the two "download a report" affordances can't
 * silently drift apart into two different file formats.
 */
export function downloadReportAsText(report: ReportContent, features: OfflineReportFeature[]) {
  const lines = [
    report.title,
    ...(features.length > 0 ? [`Includes: ${features.join(", ")}`] : []),
    "",
    report.summary,
    "",
    ...report.bullets.map((bullet) => `- ${bullet}`),
    "",
    "Generated by Olivia · 4insite",
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slugify(report.title)}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Same idea again, for the Ask tab's chat reply — "site" scope
 * appends a sentence of cross-site context so a widened scope
 * changes what Olivia actually says, not just what Presenter/Report
 * show. This is what the scope chip above the composer is for.
 */
export function getChatReply(topic: OliviaTopic, scope: OliviaScope): string {
  const base = OLIVIA_ANSWERS[topic].reply;
  return scope === "site" ? `${base} ${SITE_CONTEXT[topic].slide.caption}` : base;
}

/** Which page a "Summarize page view" section covers — "communications"
 * has no canned section of its own yet, so callers fall back to
 * "home" for it (see summaryPageIdFor in useOliviaSession). */
export type SummaryPageId = "home" | "quality" | "safety";

export type PageSummarySection = {
  pageId: SummaryPageId;
  /** Shown on the "Add current view to summary" button once this
   * section is already included, and as the section's own label
   * wherever a short name (not the full heading) is more useful. */
  pageLabel: string;
  heading: string;
  meta?: string;
  groups: { label: string; bullets: string[] }[];
};

/**
 * "Summarize page view" (Figma nodes 2209:36698/2209:36788) — one
 * canned section per page, keyed so "Add current view to summary" can
 * append whichever page the user has since navigated to. Home's
 * figures match the live-dashboard PNG/report's own LGA-LaGuardia data
 * (same site, same numbers, just narrated); Quality's reuses
 * QUALITY_PAGE_SUMMARY's figures reshaped into the same
 * heading/groups/bullets structure; Safety's reuses OLIVIA_ANSWERS.safety's
 * own Detroit (DTW) figures — that site-name mismatch against the
 * other two is a pre-existing inconsistency in this prototype's canned
 * data, not one introduced here.
 */
export const PAGE_SUMMARY_SECTIONS: Record<SummaryPageId, PageSummarySection> = {
  home: {
    pageId: "home",
    pageLabel: "Home",
    heading: "Site Overview: LGA-LaGuardia, NY",
    meta: "Reporting Period: Aug 01, 2026 - Aug 10, 2026",
    groups: [
      {
        label: "People Management",
        bullets: [
          "Clocked In: 46 of 239 team members",
          "Total Hours Worked: 12,350 hrs",
          "7-Day Average: 1,046 hrs/day",
        ],
      },
      {
        label: "Site Performance",
        bullets: [
          "Complaints: 0 complaints this month",
          "Safety Streak: 187 days since last recordable incident",
          "Report Its: 227 accepted; 454 report-its/month (monthly average)",
        ],
      },
      {
        label: "Recent Activity",
        bullets: [
          "Latest Message: Daily Assignment for 08/11/2026 from Egda Tacuri regarding supply pickup and area assignments.",
          "Latest Report It: Nancy Newman reported a damaged wooden door stop at Jet Bridge 72.",
        ],
      },
      {
        label: "Platform Updates (4insite Release 2026.7)",
        bullets: [
          "New Home Page: Refreshed layout with Live Photo Feed, updated performance cards, and a full-screen Site Performance Map.",
          "Work Order Enhancements: Larger image watermarks and localized time zone support.",
          "Bug Fixes: Resolved photo count discrepancies, fixed periodic Work Order closure issues, improved report generation speed, and corrected missing employee services in Compliance Summary reports.",
        ],
      },
    ],
  },
  quality: {
    pageId: "quality",
    pageLabel: "Quality",
    heading: "Quality Overview: Scope of Work",
    groups: [
      {
        label: "Verifications",
        bullets: [
          "94 team members have completed 1,775 of the 2,884 expected verifications (about 62%) across 39 area types",
        ],
      },
      {
        label: "Paid Hours",
        bullets: ["423h 9m of the 496h 55m of paid hours planned (85%) while supporting 524 flights"],
      },
      {
        label: "Recent Activity",
        bullets: ["Most Spot Clean and Full Service checks are scoring 4.8 or higher"],
      },
    ],
  },
  safety: {
    pageId: "safety",
    pageLabel: "Safety",
    heading: "Safety Overview: Detroit, MI (DTW)",
    groups: [
      {
        label: "Recordables",
        bullets: [
          "150 consecutive days without a recordable incident",
          "Last recordable: December 6, 2021",
          "0 recordables logged in the last 3 reporting months",
        ],
      },
      {
        label: "Trend",
        bullets: ["Site trending above the SBM network average"],
      },
    ],
  },
};

/**
 * "Unprompted Summary - Verification Details" (Figma node 2209:42714)
 * — Olivia's own proactive read of a single clicked service event, not
 * a page-level summary. Owned here (not by ServiceHistoryModal, the
 * only current caller) for the same reason SummaryPageId/
 * PageSummarySection are — a plain-data payload a page-level component
 * builds and hands to useOliviaSession's own showServiceAnalysis,
 * which this whole file's session/message layer needs to know the
 * shape of. `type` is a plain display string rather than
 * QualityPageContent's own ActivityType — this file has no business
 * importing a page component's types, and the three values line up by
 * spelling alone (see ServiceAnalysisChatCard's own icon lookup). */
export type ServiceAnalysis = {
  areaName: string;
  type: string;
  timeLabel: string;
  personName: string;
  personRole: string;
  personAvatar?: string;
  summary: string;
};
