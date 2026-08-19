"use client";

import { useEffect, useId, useRef } from "react";
import { BullhornIcon, CloseIcon, FinancialsIcon, PdfIcon, RotateLeftIcon } from "../../icons";
import { OliviaScope, OliviaTopic, ServiceAnalysis, TOPIC_SUGGESTED_PROMPTS } from "./oliviaContent";
import { AskView } from "./AskView";
import { PresenterView } from "./PresenterView";
import { ModeMenuButton } from "./ModeMenuButton";
import { OliviaAvatar } from "./OliviaAvatar";
import { PanelContextGreeting } from "./PanelContextGreeting";
import { ExternalPresenterView } from "./ExternalPresenterView";
import { LiveDashboardFullScreen } from "./LiveDashboardFullScreen";
import { SiteDashboardFullScreen } from "./SiteDashboardFullScreen";
import { PresenterMiniBar } from "./PresenterMiniBar";
import { ReportGenerateModal } from "./ReportGenerateModal";
import { ReportToast } from "./ReportToast";
import { useOliviaSession } from "./useOliviaSession";
import type { ZeroStateVariant } from "./ZeroStateSwitcher";
import styles from "./OliviaPanel.module.css";

/** "report" and "dashboard" are both kept in this union purely as mode
 * identifiers (MODES, TOOLS_MENU_ORDER, Exclude<OliviaView, "ask">
 * typing) — neither is ever actually set as a view; pickMode/openMode
 * special-case both before reaching setView. "report" always opens the
 * same floating checklist dialog (ReportGenerateModal) regardless of
 * reportFlowVariant; what happens after "Generate Report" is what
 * differs — the finished report lands inline in the chat ("chat") or
 * in a new tab via a toast ("external") — see ReportFlowVariant and
 * useOliviaSession's pickMode/openMode/confirmReportModal/
 * confirmReportModalInline. "dashboard" always posts straight to the
 * chat too (Figma node 2209:35164) — see generateLiveDashboard. */
export type OliviaView = "ask" | "presenter" | "report" | "dashboard";

/** Which "Generate a Report" experience is active — see the doc
 * comment on useOliviaSession's `reportFlowVariant` parameter for what
 * each one means. OliviaDashboard now hardcodes this to "chat" (the
 * decided direction) with no UI to change it — the switcher that used
 * to pick it (ReportFlowSwitcher) has been removed — but the type and
 * the "external" branches it still selects are left in place rather
 * than torn out of OliviaPanel/useOliviaSession, in case that
 * comparison is ever needed again. Independent of OliviaVariant (entry
 * point) — either report flow can pair with any entry point. */
export type ReportFlowVariant = "chat" | "external";

/**
 * Every entry-point pattern in this prototype, grouped into three
 * comparison categories (see PrototypeSwitcher):
 *  - Option 1, "Global Persistent Entry" — Olivia is always reachable
 *    the same way, everywhere: a slide-out side panel opened from the
 *    navbar avatar (two header-treatment variants, "panelIcons" and
 *    "panelContext"), a floating action button opening a small
 *    floating modal instead ("fab"), or a floating action button that
 *    opens the full slide-out panel itself, "panelIcons" styled
 *    ("fabPanel") — the decided direction: same panel as "panelIcons",
 *    just entered from the FAB instead of the navbar.
 *  - Option 2, "Communications Center" — Olivia has no navbar entry of
 *    her own; she's reached through the Communication Center's own
 *    "Olivia" tab (see CommunicationCenterPanel), which shows recent
 *    chats and opens the real side panel (panelIcons style) to
 *    actually talk to her.
 *  - Option 3, "Embedded Triggers" — no navbar entry and no FAB either;
 *    the only way to reach Olivia is a contextual sparkle trigger on
 *    the dashboard cards she has something to say about (see
 *    AskOliviaTrigger), which also opens the side panel.
 */
export type OliviaVariant = "panelIcons" | "panelContext" | "fab" | "fabPanel" | "commsCenter" | "embeddedTriggers";

/** Which of the two side-panel header treatments to render — the only
 * two OliviaPanel itself knows how to be. "fab", "commsCenter", and
 * "embeddedTriggers" all either render a different component (the FAB
 * modal, the Communication Center) or fall back to rendering this one
 * as "panelIcons" (see OliviaDashboard) rather than needing a third
 * treatment of their own. */
export type OliviaPanelVariant = "panelIcons" | "panelContext";

export const MODES: {
  id: Exclude<OliviaView, "ask">;
  /** Header icon's aria-label/tooltip (Figma node 2196:15112 —
   * "Generate Offline Report", "Site Presentation"). */
  label: string;
  /** Row title + longer plain-English copy for "panelContext"'s Tools
   * menu (Figma node 2093:1755) — that menu has room for a full
   * sentence per row and its own action phrasing, distinct from the
   * header icon's own single-word `label`. */
  toolsLabel: string;
  toolsDescription: string;
  icon: React.ReactNode;
  /** Per-mode accent for the "list" layout's own "Generate an output"
   * treatment (panelContext's Tools-adjacent zero state /
   * OutputsAndPerformanceLists' bordered `.outputSection`). HomeGreeting's
   * own zero state doesn't read this any more — its site-level cards
   * use one uniform purple tint instead (see HomeGreeting.tsx). */
  swatch: { bg: string; color: string };
}[] = [
  {
    id: "presenter",
    label: "Site Presentation",
    toolsLabel: "Start a Presentation",
    toolsDescription: "Talks you through the data, one slide at a time.",
    icon: <BullhornIcon />,
    swatch: { bg: "rgba(255, 138, 128, 0.15)", color: "var(--color-datavis-red-orange-100)" },
  },
  {
    id: "report",
    label: "Generate Offline Report",
    toolsLabel: "Generate a Report",
    toolsDescription: "A downloadable PDF, ready for offline or mobile.",
    icon: <PdfIcon />,
    swatch: { bg: "rgba(128, 230, 255, 0.15)", color: "var(--color-datavis-sky-blue-100)" },
  },
  {
    id: "dashboard",
    label: "Live Dashboard",
    toolsLabel: "View a Live Dashboard",
    toolsDescription: "An interactive dashboard you can explore on your own.",
    icon: <FinancialsIcon />,
    swatch: { bg: "rgba(217, 128, 255, 0.15)", color: "var(--color-datavis-pinkle-100)" },
  },
];

/** Tools menu row order (Figma node 2093:1755) — Report, then
 * Presentation, then Dashboard. Kept separate from MODES' own order
 * (Presentation, Report, Dashboard) so reordering the Tools menu
 * doesn't also reorder the header's mode icons (panelIcons) or the
 * FAB modal's "Generate an Output" list, neither of which this ask
 * touched. */
export const TOOLS_MENU_ORDER: Exclude<OliviaView, "ask">[] = ["report", "presenter", "dashboard"];

/** Header mode-icon order — Report, Presentation, then Dashboard, per
 * Figma node 2273:15746 ("Zero State"), which re-added a third header
 * icon for it. All three are one-click *site*-scoped shortcuts now —
 * Report opens the checklist modal (scope is never actually read
 * there); Presenter and Dashboard both go straight to the site-wide
 * version of their mode, same destination as HomeGreeting's own
 * "Site Presentation"/"Live Site Dashboard" cards (Dashboard briefly
 * had no header icon at all, back when it was still a page-only
 * output with no "which scope?" question of its own — see git
 * history on this constant). */
export const HEADER_MODE_ORDER: Exclude<OliviaView, "ask">[] = ["report", "presenter", "dashboard"];

/** What Olivia knows about *why* she's being opened — drives which greeting AskView shows. */
export type OliviaEntryContext = { kind: "home" } | { kind: "topic"; topic: OliviaTopic };

/**
 * A single request to open the panel in a given context — the
 * navbar avatar sends `{ kind: "home" }`, a card's AskOliviaTrigger
 * sends `{ kind: "topic", topic }`. `requestId` makes repeat clicks
 * on the same trigger distinguishable so the effect below re-fires.
 * `questionText`, when given alongside a topic, skips the topic
 * greeting and asks that exact question immediately — a suggested
 * question picked from AskOliviaTrigger's popover. `resumeReply`,
 * given alongside `questionText`, reloads that exact exchange instead
 * of asking it fresh — the Communication Center's Recent Chats list
 * resuming a past conversation in the real side panel. `pageSummary`
 * takes priority over all of the above — an instant, proactive page
 * summary (e.g. Quality's) the nav avatar opens straight to instead
 * of its usual greeting, the first time it's clicked after landing on
 * a page that has one ready (see OliviaDashboard's notification dot).
 * `serviceAnalysis` is the same idea scoped to one clicked service
 * event instead of a whole page — ServiceHistoryModal's own trigger
 * (see OliviaDashboard's analyzeServiceFromOverlay), same priority as
 * `pageSummary`; the two are mutually exclusive by construction (never
 * both set on the same request), so their relative order below doesn't
 * matter.
 */
export type OliviaOpenRequest = OliviaEntryContext & {
  requestId: number;
  questionText?: string;
  resumeReply?: string;
  pageSummary?: string;
  serviceAnalysis?: ServiceAnalysis;
};

export function OliviaPanel({
  isOpen,
  onClose,
  onRequestOpen,
  openRequest,
  variant,
  reportFlowVariant = "chat",
  initialTopic = null,
  initialPageLabel,
  activePage = "home",
  zeroStateVariant,
  onPresenterMinimizedChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  /** Reopens the panel from outside it — the report-ready toast's own
   * "Preview" action needs this since report generation (and the toast
   * itself) survives the panel being closed, per useOliviaSession, but
   * only the caller (OliviaDashboard) owns `isOpen`. */
  onRequestOpen?: () => void;
  openRequest?: OliviaOpenRequest | null;
  /** Which header treatment is rendering — "panelIcons" (mode icons +
   * dropdowns live in the header) or "panelContext" (they move into a
   * "Tools" menu in the composer instead, per Figma node 2059:112).
   * Owned by the caller (see PrototypeSwitcher/OliviaDashboard) so the
   * control for it can live on the dashboard page itself, outside the
   * panel — and so the Communication Center and Embedded Triggers
   * categories can force "panelIcons" here without exposing their own
   * variant name to a component that doesn't render them. */
  variant: OliviaPanelVariant;
  /** Which "Generate a Report" experience this panel runs — see the
   * doc comment on the ReportFlowVariant type. Defaults to "chat"
   * since that's the decided direction; the comparison pages
   * (ReportFlowSwitcher) are what actually vary this. */
  reportFlowVariant?: ReportFlowVariant;
  /** The page's own ambient topic, if any (e.g. the Safety page passes
   * "safety") — set as Olivia's context from the moment she opens, before
   * any question is asked, so Tools/Presenter/Report/Dashboard already
   * know what "this view" means. "panelContext" also surfaces it as a
   * dismissible chip above the composer (Figma node 2066:182). */
  initialTopic?: OliviaTopic | null;
  /** Optional page label to surface as a dismissible context chip (e.g.
   * "Quality" when on the Quality page). This is a page-level affordance
   * rather than an Olivia topic, so it's a free string. */
  initialPageLabel?: string;
  /** Same union as OliviaDashboardProps' own activePage — only
   * "Summarize page view" reads this (see useOliviaSession), to pick
   * which PAGE_SUMMARY_SECTIONS entry "the current view" means. */
  activePage?: "home" | "safety" | "communications" | "quality";
  /** Which of HomeGreeting's two current zero-state references to show
   * (see ZeroStateSwitcher) — owned by the caller (OliviaDashboard,
   * rendered on the home page itself) same as `variant`/`onVariantChange`
   * are, since it's a property of the whole prototype, not this panel. */
  zeroStateVariant?: ZeroStateVariant;
  /** Fires whenever the mini presenter bar's own visibility would
   * change (panel closed while still on the presenter view) — lets
   * "fabPanel" (the only variant with a FAB of its own to worry about)
   * suppress it while the mini bar is up, since both are real, clickable
   * buttons anchored at the same right:24/bottom:24 spot and would
   * otherwise sit on top of each other. */
  onPresenterMinimizedChange?: (isMinimized: boolean) => void;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastHandledRequestId = useRef<number | null>(null);
  const session = useOliviaSession(initialTopic, reportFlowVariant, activePage);
  const { view, setView, entryContext, topic, setTopic, isThinking, messages, scope, setScope } = session;
  const isPresenterMinimized = !isOpen && view === "presenter";

  useEffect(() => {
    onPresenterMinimizedChange?.(isPresenterMinimized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPresenterMinimized]);

  /** The report toast (below) only hides itself WHILE the user is on
   * the Ask tab, chat flow, report ready — it doesn't otherwise know
   * they've already seen the finished report sitting right there in
   * the log. Without this, switching to Presenter (or anywhere else)
   * right after would make it pop back up as if something new had
   * happened. Once that "already seen it" moment occurs, this marks
   * the toast dismissed for real (same flag the toast's own X uses)
   * so it stays gone regardless of which view comes next — same
   * reasoning either way: nothing new to tell them. */
  useEffect(() => {
    if (
      reportFlowVariant === "chat" &&
      isOpen &&
      view === "ask" &&
      session.reportStatus === "ready" &&
      !session.isReportToastDismissed
    ) {
      session.dismissReportToast();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportFlowVariant, isOpen, view, session.reportStatus, session.isReportToastDismissed]);

  /** Closing the panel also drops the "external" flow's floating
   * checklist dialog if it's open — that step is foreground-only
   * (nothing's been requested yet), unlike generation itself, which
   * keeps running behind the ReportToast regardless. */
  const handleClose = () => {
    session.closeReportModal();
    session.closeExternalPresenter();
    onClose();
  };

  // Focus the panel on open; Escape closes it.
  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose]);

  // Every open request lands on the Ask tab. A contextual (topic)
  // request always starts a fresh conversation on that topic's own
  // greeting; a general (home) request just returns to the Ask tab
  // without disturbing whatever conversation was already there.
  useEffect(() => {
    if (!openRequest || lastHandledRequestId.current === openRequest.requestId) return;
    lastHandledRequestId.current = openRequest.requestId;
    if (openRequest.serviceAnalysis) {
      session.showServiceAnalysis(openRequest.serviceAnalysis);
    } else if (openRequest.pageSummary) {
      // Quality's is the only proactive page summary in this
      // prototype, so its rich-card treatment is hardcoded here rather
      // than threaded through OliviaOpenRequest as a general-purpose flag.
      session.showPageSummary(openRequest.pageSummary, "qualitySummary");
    } else if (openRequest.kind === "topic") {
      if (openRequest.resumeReply && openRequest.questionText) {
        session.loadConversation(openRequest.topic, openRequest.questionText, openRequest.resumeReply);
      } else if (openRequest.questionText) {
        session.askQuestionFresh(openRequest.topic, openRequest.questionText);
      } else {
        session.resetToTopic(openRequest.topic);
      }
    } else {
      session.resetToHome();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openRequest]);

  return (
    <>
      {/* The animated element — see OliviaPanel.module.css's .panelSlot
          doc comment for why this pushes instead of overlaying. */}
      <div className={[styles.panelSlot, isOpen ? styles.panelSlotOpen : ""].filter(Boolean).join(" ")}>
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-labelledby={titleId}
        aria-hidden={!isOpen}
      >
        <header className={styles.header}>
          {/* "panelIcons" has no separate reset icon (see below) — clicking
              Olivia's own name/avatar resets the conversation instead,
              rolled into the same click that already returned to Ask. */}
          <button
            type="button"
            className={styles.identity}
            onClick={() => (variant === "panelIcons" ? session.resetConversation() : setView("ask"))}
            aria-label={variant === "panelIcons" ? "Reset conversation" : "Back to Ask Olivia"}
          >
            <OliviaAvatar size={36} />
            <div>
              <p id={titleId} className={styles.title}>
                Olivia
              </p>
              <p className={styles.subtitle}>AI Assistant</p>
            </div>
            {variant === "panelIcons" && (
              <span className={styles.identityTooltip} role="tooltip">
                Reset conversation
              </span>
            )}
          </button>

          {/* Three one-click shortcuts, up top and always reachable —
              Report, Presenter, Dashboard (HEADER_MODE_ORDER; see its own
              doc comment). Report opens the checklist modal regardless of
              scope; Presenter and Dashboard both go straight to the full
              *site*-scoped version of their mode (Figma node 2196:15112's
              own "Site Presentation" tooltip for Presenter) — the same
              destination as the zero state's "Site Presentation"/"Live
              Site Dashboard" cards. Presenting/viewing *this page*
              instead is only reachable from the zero state's page-level
              row, not the header. "panelContext" moves this same set
              into the composer's Tools menu instead (see AskView), so
              the header stays clear here. */}
          {variant === "panelIcons" && (
            <>
              <div className={styles.modeGroup}>
                {HEADER_MODE_ORDER.map((id) => {
                  const mode = MODES.find((m) => m.id === id)!;
                  return (
                    <ModeMenuButton
                      key={mode.id}
                      icon={mode.icon}
                      // Report/Presenter's own MODES labels already read as
                      // site-scoped ("Generate Offline Report", "Site
                      // Presentation"); Dashboard's shared label ("Live
                      // Dashboard", also used page-scoped in the Tools menu)
                      // doesn't, so this header instance overrides it to
                      // match HomeGreeting's own "Live Site Dashboard" card
                      // instead of touching the shared MODES entry.
                      label={mode.id === "dashboard" ? "Live Site Dashboard" : mode.label}
                      onClick={() => session.pickMode(mode.id, mode.id === "report" ? "page" : "site")}
                    />
                  );
                })}
              </div>

              {/* Only makes sense with the mode icons next to it — "panelContext"
                  has nothing to divide (its header ends at the close button). */}
              <span className={styles.headerDivider} aria-hidden="true" />
            </>
          )}

          {/* "Reset conversation" — Figma node 2082:484 ("Side Panel with
              Context") shows this next to close, for "panelContext" only.
              "panelIcons" moved this to a click on Olivia's own name
              instead (see the identity button above). */}
          {variant === "panelContext" && (
            <button
              type="button"
              className={styles.resetButton}
              onClick={() => session.resetConversation()}
              aria-label="Reset conversation"
            >
              <RotateLeftIcon />
              <span className={styles.resetTooltip} role="tooltip">
                Reset conversation
              </span>
            </button>
          )}

          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close Olivia panel"
          >
            <CloseIcon />
          </button>
        </header>

        <div className={styles.body}>
          {view === "ask" && (
            <AskView
              variant={variant}
              entryContext={entryContext}
              messages={messages}
              currentTopic={topic}
              pageTopic={initialTopic}
              pageLabel={initialPageLabel}
              onClearTopic={() => setTopic(null)}
              isThinking={isThinking}
              onSend={(text) => session.sendMessage(text)}
              onSelectPrompt={(t, q) => session.askTopic(t, q)}
              onOpenMode={session.openMode}
              renderZeroState={
                variant === "panelContext"
                  ? () => (
                      <PanelContextGreeting
                        onPickTopic={(t, q) => session.askTopic(t, q)}
                        onOpenMode={(mode, scope) => session.openMode(mode, topic, scope)}
                        promptSet={entryContext.kind === "topic" ? TOPIC_SUGGESTED_PROMPTS[entryContext.topic] : undefined}
                        performanceLabel={
                          initialTopic === "safety"
                            ? "Ask about safety"
                            : initialPageLabel === "Quality"
                            ? "Ask about quality"
                            : undefined
                        }
                      />
                    )
                  : undefined
              }
              zeroStateVariant={zeroStateVariant}
              onViewLiveDashboardFullScreen={session.openLiveDashboardFullScreen}
              currentSummaryPageId={session.currentSummaryPageId}
              onSummarizePage={session.generatePageSummary}
              onAddCurrentViewToSummary={session.addCurrentViewToSummary}
              onResetConversation={session.resetConversation}
              lastServiceAnalysis={session.lastServiceAnalysis}
            />
          )}
          {view === "presenter" && (
            <PresenterView
              topic={topic}
              isLoading={isThinking}
              scope={scope}
              onStop={session.stopPresentation}
              onMinimize={handleClose}
              index={session.presenterIndex}
              setIndex={session.setPresenterIndex}
              isPlaying={session.isPresenterPlaying}
              setIsPlaying={session.setIsPresenterPlaying}
            />
          )}
        </div>
      </div>
      </div>

      {/* Both outside .panelSlot on purpose — it's always `overflow:
          hidden` (collapsed or not, see its own doc comment), which
          would clip a `position: fixed` descendant same as a
          transform would; the dialog because closing the panel still
          fires handleClose synchronously, the toast because
          generation itself keeps running after the panel closes.
          Rendered for BOTH flows now — only what "Generate Report"
          does next (confirmReportModal vs. confirmReportModalInline)
          still depends on reportFlowVariant. */}
      {session.isReportModalOpen && (
        <ReportGenerateModal
          onCancel={session.closeReportModal}
          onGenerate={reportFlowVariant === "external" ? session.confirmReportModal : session.confirmReportModalInline}
        />
      )}

      {session.isExternalPresenterOpen && (
        <ExternalPresenterView topic={topic} onClose={session.stopSitePresentation} />
      )}

      {session.isLiveDashboardFullScreenOpen &&
        (session.liveDashboardFullScreenScope === "site" ? (
          <SiteDashboardFullScreen onClose={session.closeLiveDashboardFullScreen} />
        ) : (
          <LiveDashboardFullScreen onClose={session.closeLiveDashboardFullScreen} />
        ))}

      {/* The in-chat presenter, minimized — panel closed (Minimize or
          Close, either one) while still on the presenter view, so
          PresenterView is still mounted and its slide timer is still
          running underneath. Same reasoning as ReportToast just below
          for living outside .panelSlot. */}
      {isPresenterMinimized && (
        <PresenterMiniBar
          narrationText={session.presenterNarrationText}
          isPlaying={session.isPresenterPlaying}
          onTogglePlay={() => session.setIsPresenterPlaying((p) => !p)}
          onStop={() => {
            // Stopping switches `view` back to "ask" — on its own that
            // would just leave the panel closed with nothing to show
            // for it, stranding the stop confirmation + download action
            // nobody would see. Reopening surfaces it the same way
            // stopping already does when the panel is open.
            session.stopPresentation();
            onRequestOpen?.();
          }}
          onExpand={() => onRequestOpen?.()}
        />
      )}

      {/* Hidden while the user is already on the Ask tab with the panel
          open AND the report lands there ("chat" flow) — the "external"
          flow never puts anything in the chat, so its toast always
          shows regardless of what's open. The effect above additionally
          marks it dismissed for good the moment that's true, so leaving
          the Ask tab right after (Presenter, etc.) doesn't make it
          reappear for a report they've already seen. See useOliviaSession. */}
      {session.reportStatus !== "idle" &&
        !session.isReportToastDismissed &&
        !(reportFlowVariant === "chat" && isOpen && view === "ask") && (
          <ReportToast
            status={session.reportStatus}
            variant={reportFlowVariant}
            onDismiss={session.dismissReportToast}
            onView={() => {
              if (reportFlowVariant === "external") {
                session.reopenReport();
              } else {
                onRequestOpen?.();
                session.viewReport();
              }
            }}
          />
        )}
    </>
  );
}
