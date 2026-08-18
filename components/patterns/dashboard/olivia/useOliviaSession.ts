"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getChatReply,
  getPresenterSlides,
  matchTopic,
  OfflineReportFeature,
  OliviaScope,
  OliviaTopic,
  PAGE_SUMMARY_SECTIONS,
  PRESENTER_INTRO_SLIDE,
  presenterNarration,
  reportPageUrl,
  ServiceAnalysis,
  SummaryPageId,
} from "./oliviaContent";
import type { ChatMessage } from "./AskView";
import type { OliviaEntryContext, OliviaView, ReportFlowVariant } from "./OliviaPanel";

/** Same union OliviaDashboardProps.activePage uses (OliviaDashboard.tsx)
 * — not imported from there to avoid this low-level hook depending on
 * the top-level page component; the two are kept structurally in sync
 * by hand instead. */
type ActivePage = "home" | "safety" | "communications" | "quality";

/** "Summarize page view" (see PAGE_SUMMARY_SECTIONS) has no canned
 * section for "communications" yet — falls back to "home" for it
 * rather than crashing on a lookup miss. */
function summaryPageIdFor(activePage: ActivePage): SummaryPageId {
  return activePage === "quality" || activePage === "safety" ? activePage : "home";
}

/** Same idea as PROTOTYPE_VARIANT_STORAGE_KEY (OliviaDashboard.tsx) —
 * Home/Quality/Safety are separate routes, each a fresh mount of this
 * hook, so "Add current view to summary" (added on one page) has to
 * survive navigating to summarize another. localStorage carries that
 * running list across the remount; see generatePageSummary/
 * addCurrentViewToSummary below. */
const SUMMARY_PAGE_IDS_STORAGE_KEY = "olivia-summary-page-ids";

function readStoredSummaryPageIds(): SummaryPageId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SUMMARY_PAGE_IDS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is SummaryPageId => typeof id === "string" && id in PAGE_SUMMARY_SECTIONS);
  } catch {
    return [];
  }
}

function writeStoredSummaryPageIds(ids: SummaryPageId[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SUMMARY_PAGE_IDS_STORAGE_KEY, JSON.stringify(ids));
}

const THINKING_DELAY_MS = 900;

/** How long a real offline report can take, per product ("up to 30
 * seconds"). The simulated wait here is shorter — long enough to
 * prove the flow stays usable through it (switch tabs, close the
 * panel, keep chatting) without punishing every prototype click-
 * through with a real 30s wait — while the toast copy states the
 * honest real-world number. */
const REPORT_GENERATE_MS = 9000;

/** The "external" flow's extra beat between "generated" and "ready" —
 * long enough to register as its own step (see ReportToast's
 * "downloading" state) without meaningfully lengthening the wait. */
const REPORT_DOWNLOAD_MS = 1400;

export type ReportStatus = "idle" | "generating" | "downloading" | "ready";

let messageId = 0;
const nextMessageId = () => `msg-${++messageId}`;

/**
 * The actual "being Olivia" logic — conversation state, canned replies,
 * mode/topic/scope bookkeeping — factored out of OliviaPanel so it can
 * also power Exploration 3's Communication Center hub tab, which embeds
 * the same Ask/Presenter/Report/Dashboard experience without the
 * slide-out panel's own chrome (backdrop, header, slide transform).
 * Each consumer gets its own independent instance of this hook — they're
 * never rendered at the same time (one variant is active at a time), so
 * there's no need to share state between them.
 */
export function useOliviaSession(
  initialTopic: OliviaTopic | null = null,
  /** Which "Generate a Report" experience this session runs — both ask
   * the same floating checklist dialog (ReportGenerateModal, Figma
   * node 2189:14364); they differ only in what "Generate Report" does
   * next. "chat" (default) lands the finished report inside the
   * conversation itself (Figma node 2189:14169), via
   * confirmReportModalInline. "external" never touches the chat at
   * all, surfacing progress purely through ReportToast and a new tab
   * instead, via confirmReportModal. OliviaDashboard now hardcodes
   * "chat" everywhere with no UI to change it — see ReportFlowVariant's
   * own doc comment (OliviaPanel.tsx). */
  reportFlowVariant: ReportFlowVariant = "chat",
  /** Which page this session is running on (see OliviaDashboardProps'
   * own activePage) — only "Summarize page view" reads this, to pick
   * which PAGE_SUMMARY_SECTIONS entry "the current view" means. */
  activePage: ActivePage = "home"
) {
  const currentSummaryPageId = summaryPageIdFor(activePage);
  const [view, setView] = useState<OliviaView>("ask");
  // Mirrors initialTopic, not hardcoded to "home" — a page with its own
  // ambient topic (e.g. Safety passing "safety") needs its first-ever
  // greeting to already be topic-scoped (context chip AND "panelContext"'s
  // suggested prompts), not just its `topic` state.
  const [entryContext, setEntryContext] = useState<OliviaEntryContext>(
    initialTopic ? { kind: "topic", topic: initialTopic } : { kind: "home" }
  );
  const [topic, setTopic] = useState<OliviaTopic | null>(initialTopic);
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // The most recent showServiceAnalysis payload, kept around independently
  // of `messages` (which showPageSummary/showServiceAnalysis both replace
  // wholesale) — SummaryPager's "Service Summary" tab reads this so it can
  // still flip to the last-viewed service even from an older Quality-
  // summary message, without needing a live "serviceAnalysis" message of
  // its own (see AskView's own lastServiceAnalysis prop).
  const [lastServiceAnalysis, setLastServiceAnalysis] = useState<ServiceAnalysis | null>(null);
  // One shared scope for the whole session — set from wherever a mode is
  // picked (header menu, Tools menu, hub row), and it carries into chat
  // replies too, so there's a single always-current answer to "is Olivia
  // talking about this page or the whole site?"
  const [scope, setScope] = useState<OliviaScope>("page");
  // Report generation no longer asks "this view or the whole site" —
  // it opens the Offline Report feature checklist instead (the same
  // floating dialog, ReportGenerateModal, for both flows). This just
  // holds what that checklist came back with once confirmed.
  const [reportFeatures, setReportFeatures] = useState<OfflineReportFeature[]>([]);
  // Lives here rather than local component state so generation survives
  // switching to another tab or closing the panel entirely — this hook
  // stays mounted for the panel's whole lifetime (see OliviaPanel),
  // unlike the view components (and chat messages' own render), which
  // don't persist independent timers of their own.
  const [reportStatus, setReportStatus] = useState<ReportStatus>("idle");
  // Manually closing the toast shouldn't make it reappear on its own —
  // only a fresh "Generate" (confirmReport) resets this.
  const [isReportToastDismissed, setIsReportToastDismissed] = useState(false);
  // Whether the floating "Generate an Offline Report" checklist dialog
  // (ReportGenerateModal) is up — shared by both flows now. Foreground-
  // only, unlike reportStatus: closing the panel dismisses this same
  // as any other dialog would, since nothing has been requested yet.
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  // "external" flow's presenter equivalent of isReportModalOpen — a
  // full-viewport cinematic view (ExternalPresenterView) that opens
  // instead of the in-chat PresenterView when presenting the *entire
  // site* under the "external" flow (see pickMode/openMode below).
  // Foreground-only, same reasoning as isReportModalOpen: closing the
  // panel drops it (see OliviaPanel/OliviaFabModal's handleClose).
  const [isExternalPresenterOpen, setIsExternalPresenterOpen] = useState(false);
  // The live-dashboard chat card's own "View Full Screen" — a real
  // screenshot overlay (LiveDashboardFullScreen), same foreground-only
  // reasoning as isExternalPresenterOpen/isReportModalOpen above.
  const [isLiveDashboardFullScreenOpen, setIsLiveDashboardFullScreenOpen] = useState(false);
  // The in-chat presenter's own slide progress — lives here rather than
  // local state on PresenterView so it survives the panel being
  // minimized: the mini presenter bar (rendered by OliviaPanel, outside
  // the collapsed panel — see its own doc comment on why) needs to read
  // and control the same play state PresenterView shows, and both need
  // one shared source of truth rather than two copies drifting apart.
  const [presenterIndex, setPresenterIndex] = useState(0);
  const [isPresenterPlaying, setIsPresenterPlaying] = useState(true);
  // The currently-narrated line, independent of whether PresenterView
  // itself is visible — the mini presenter bar (OliviaPanel, once
  // minimized) reads this directly instead of re-deriving the same
  // slide deck a second time.
  const presenterNarrationText = useMemo(() => {
    const slides = [PRESENTER_INTRO_SLIDE, ...getPresenterSlides(topic, scope)];
    return presenterNarration(slides[presenterIndex] ?? PRESENTER_INTRO_SLIDE);
  }, [topic, scope, presenterIndex]);
  const reportTimerRef = useRef<number | null>(null);

  // Guards against a stray timeout outliving the component (e.g. a
  // hot-reload during development) — not load-bearing in production
  // since the hook lives for the app's whole session, but cheap and correct.
  useEffect(() => {
    return () => {
      if (reportTimerRef.current !== null) window.clearTimeout(reportTimerRef.current);
    };
  }, []);

  // Switching the report flow starts the panel over from a blank slate
  // — a mid-flight checklist, generation, or
  // finished report from one flow has no equivalent shape in the
  // other (an inline chat message vs. a floating dialog + toast), so
  // rather than trying to translate state across, this just resets
  // everything the same way `resetConversation` does, plus anything
  // report-specific. Skipped on first mount (isFirstRender) — a fresh
  // session has nothing to reset yet.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (reportTimerRef.current !== null) {
      window.clearTimeout(reportTimerRef.current);
      reportTimerRef.current = null;
    }
    setView("ask");
    setEntryContext(initialTopic ? { kind: "topic", topic: initialTopic } : { kind: "home" });
    setMessages([]);
    setTopic(initialTopic);
    setReportStatus("idle");
    setReportFeatures([]);
    setIsReportToastDismissed(false);
    setIsReportModalOpen(false);
    setIsExternalPresenterOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportFlowVariant]);

  const sendMessage = (text: string, explicitTopic?: OliviaTopic) => {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;

    setMessages((prev) => [...prev, { id: nextMessageId(), role: "user", text: trimmed }]);
    setIsThinking(true);

    const resolvedTopic = explicitTopic ?? matchTopic(trimmed);

    window.setTimeout(() => {
      if (resolvedTopic) {
        setMessages((prev) => [
          ...prev,
          {
            id: nextMessageId(),
            role: "olivia",
            text: getChatReply(resolvedTopic, scope),
            topic: resolvedTopic,
          },
        ]);
        setTopic(resolvedTopic);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: nextMessageId(),
            role: "olivia",
            text: "I can help with safety, complaints, and audit questions for this site right now. Try one of the suggestions below, or rephrase your question.",
          },
        ]);
      }
      setIsThinking(false);
    }, THINKING_DELAY_MS);
  };

  const askTopic = (t: OliviaTopic, questionText?: string) => {
    sendMessage(questionText ?? promptTextFor(t), t);
  };

  /** A mode menu's choice — sets scope AND switches to that mode in one
   * step. "report" is the exception: it no longer has a scope to set,
   * and always opens the floating checklist dialog (openReportModal
   * below) — what differs by reportFlowVariant is only what happens
   * once it's confirmed (see confirmReportModal/confirmReportModalInline).
   *
   * Presenting the *entire site* is a second exception, regardless of
   * reportFlowVariant: instead of switching to the in-chat
   * PresenterView, it opens the full-viewport ExternalPresenterView —
   * the header's Presenter icon and the zero state's "Begin an Olivia
   * site presentation" card both land here. Presenting *this page*
   * still uses the ordinary in-chat view (see the zero state's
   * page-level "Present this page" row). */
  const pickMode = (mode: Exclude<OliviaView, "ask">, pickedScope: OliviaScope) => {
    if (mode === "report") {
      openReportModal();
      return;
    }
    // Same treatment as "report" — a chat reply (Figma node 2209:35164),
    // not a mode view, so it never reaches setView below. Always
    // page-scoped in practice (every entry point that offers it is), so
    // `pickedScope` isn't read here.
    if (mode === "dashboard") {
      generateLiveDashboard();
      return;
    }
    setScope(pickedScope);
    if (mode === "presenter" && pickedScope === "site") {
      setIsExternalPresenterOpen(true);
      return;
    }
    setView(mode);
  };

  /** Switches to a mode view for a given (possibly unknown) topic —
   * follow-up pills, Tools menu, the zero-state's page-level output
   * rows and site-level cards (see HomeGreeting). Same "report" and
   * "site presentation" exceptions as pickMode above. `explicitScope`,
   * when given, both sets `scope` AND decides the external-presenter
   * branch in the same call — the caller (e.g. HomeGreeting's own
   * site-presentation card) has already resolved *which* scope this
   * action means, and reading back this hook's own `scope` state here
   * instead would still hold the *previous* value (state set via
   * setScope hasn't re-rendered yet when this runs). Omit it for
   * callers that aren't scope-specific themselves (follow-up pills,
   * Tools menu) — they keep using whatever `scope` the session already
   * carries. */
  const openMode = (mode: Exclude<OliviaView, "ask">, t: OliviaTopic | null, explicitScope?: OliviaScope) => {
    setTopic(t);
    if (explicitScope) setScope(explicitScope);
    if (mode === "report") {
      openReportModal();
      return;
    }
    if (mode === "dashboard") {
      generateLiveDashboard();
      return;
    }
    const resolvedScope = explicitScope ?? scope;
    if (mode === "presenter" && resolvedScope === "site") {
      setIsExternalPresenterOpen(true);
      return;
    }
    setView(mode);
  };

  /** ExternalPresenterView's own close/Escape — foreground-only, same
   * reasoning as closeReportModal. Returns to whatever the panel was
   * showing before the site presentation opened (the "ask" view is
   * never left in the first place — see pickMode/openMode's early
   * return above), so this alone is what makes closing it land back
   * on "the page they were on, with Olivia open." */
  const closeExternalPresenter = () => setIsExternalPresenterOpen(false);

  /** The in-chat PresenterView's own "Stop" — distinct from pause,
   * which just holds the current slide without leaving the view. Ends
   * the presentation and returns to the chat, where Olivia confirms it
   * in her own reply; the reply carries the same "Download Presentation
   * Report" action PresenterView's own footer offered, so leaving the
   * presenter view doesn't strand it. */
  const stopPresentation = () => {
    setView("ask");
    setMessages((prev) => [
      ...prev,
      // Retroactive echo of what opened the presenter (Figma node
      // 2209:33419) — presenting itself never wrote to the transcript
      // (it's a separate view, not a chat reply), so this is the first
      // trace of it there, immediately followed by Olivia's own stop
      // reply in the same turn pair.
      { id: nextMessageId(), role: "user", text: "Present this page" },
      {
        id: nextMessageId(),
        role: "olivia",
        text: "I stopped presenting this page. Download a report of your presentation below.",
        richContent: "presentationStopped",
      },
    ]);
    // So the next presentation (this page or another) starts from its
    // own first slide, playing, rather than resuming wherever this one
    // left off.
    setPresenterIndex(0);
    setIsPresenterPlaying(true);
  };

  /** "Generate a live dashboard of page view" — a chat reply (Figma
   * node 2209:35164), not a mode switch (see pickMode/openMode's
   * "dashboard" branch above): posts the request and Olivia's own
   * "ready" reply carrying the dashboard preview card in one turn,
   * same shape as the offline report flow just without a generating
   * beat in between — Figma's own reference only shows the finished
   * state, no spinner, for this one. */
  const generateLiveDashboard = () => {
    setMessages((prev) => [
      ...prev,
      { id: nextMessageId(), role: "user", text: "Generate live dashboard of page view" },
      {
        id: nextMessageId(),
        role: "olivia",
        text: "Your live dashboard has successfully been generated",
        richContent: "liveDashboard",
      },
    ]);
  };

  const openLiveDashboardFullScreen = () => setIsLiveDashboardFullScreenOpen(true);
  const closeLiveDashboardFullScreen = () => setIsLiveDashboardFullScreenOpen(false);

  /** "Summarize page view" (Figma nodes 2209:36698/2209:36788) — like
   * generateLiveDashboard above, a chat reply rather than a mode
   * switch. Starts with whatever's already in the running summary
   * (localStorage — see this file's own doc comment on
   * SUMMARY_PAGE_IDS_STORAGE_KEY) plus the current page, so asking
   * again after "Add current view to summary" on another page shows
   * every page collected so far, not just this one. */
  const generatePageSummary = () => {
    const stored = readStoredSummaryPageIds();
    const ids = stored.includes(currentSummaryPageId) ? stored : [...stored, currentSummaryPageId];
    writeStoredSummaryPageIds(ids);
    setMessages((prev) => [
      ...prev,
      { id: nextMessageId(), role: "user", text: "Summarize page view" },
      {
        id: nextMessageId(),
        role: "olivia",
        text: "",
        richContent: "pageSummary",
        summaryPageIds: ids,
      },
    ]);
  };

  /** "Add current view to summary" — appends this page's own section
   * to the most recent page-summary reply in place (Figma's own
   * "Scrolled" reference is the same card, just longer), rather than
   * starting a new one. This is what lets a user navigate to another
   * page, come back to Olivia, and grow the same running summary — the
   * navigation itself remounts this whole hook (separate routes), so
   * the growing id list has to survive in localStorage, not just this
   * render's state. */
  const addCurrentViewToSummary = () => {
    setMessages((prev) => {
      const lastSummaryIndex = [...prev].reverse().findIndex((m) => m.richContent === "pageSummary");
      if (lastSummaryIndex === -1) return prev;
      const index = prev.length - 1 - lastSummaryIndex;
      const existing = prev[index];
      const ids = existing.summaryPageIds ?? [];
      if (ids.includes(currentSummaryPageId)) return prev;
      const nextIds = [...ids, currentSummaryPageId];
      writeStoredSummaryPageIds(nextIds);
      const next = [...prev];
      next[index] = { ...existing, summaryPageIds: nextIds };
      return next;
    });
  };

  /** Opens `/olivia-report` in a new tab for the given topic/features —
   * the one place both flows land on the actual finished report. */
  const openReportInNewTab = (t: OliviaTopic | null, features: OfflineReportFeature[]) => {
    if (typeof window === "undefined") return;
    window.open(reportPageUrl(t, features), "_blank", "noopener,noreferrer");
  };

  // ================================================================
  // "chat" flow — the checklist is the same floating modal the
  // "external" flow uses (ReportGenerateModal); the finished report
  // still lands in the conversation itself (Figma node 2189:14169).
  // ================================================================

  /** "Generate Report" inside the checklist modal, "chat" flow —
   * closes the modal and appends a fresh exchange: a synthetic user
   * turn ("Generate an offline report") plus an Olivia reply that
   * starts as "generating" (richContent: "reportGenerating", a
   * spinner next to explanatory text) and is swapped for the finished
   * report once ready. Generation itself still survives leaving the
   * Ask tab or closing the panel — see reportStatus/ReportToast. */
  const confirmReportModalInline = (features: OfflineReportFeature[]) => {
    if (reportTimerRef.current !== null) window.clearTimeout(reportTimerRef.current);
    const reportTopic = topic;
    setReportFeatures(features);
    setIsReportModalOpen(false);
    setView("ask");
    setMessages((prev) => [
      ...prev,
      { id: nextMessageId(), role: "user", text: "Generate an offline report" },
      {
        id: nextMessageId(),
        role: "olivia",
        text: "Generating offline report. This could take a few minutes.",
        richContent: "reportGenerating",
      },
    ]);
    setReportStatus("generating");
    setIsReportToastDismissed(false);
    reportTimerRef.current = window.setTimeout(() => {
      setMessages((prev) => [
        ...prev.filter((m) => m.richContent !== "reportGenerating"),
        {
          id: nextMessageId(),
          role: "olivia",
          text: "Your report has successfully been generated.",
          topic: reportTopic ?? undefined,
          richContent: "report",
          reportFeatures: features,
        },
      ]);
      setReportStatus("ready");
      reportTimerRef.current = null;
    }, REPORT_GENERATE_MS);
  };

  /** The toast's "Preview"/"View" action, chat flow — jumps back to
   * the Ask tab, where the finished report already sits as Olivia's
   * latest reply. Reopening the panel itself (if closed) is the
   * caller's job (see OliviaPanel's onRequestOpen). */
  const viewReport = () => {
    setView("ask");
    setIsReportToastDismissed(true);
  };

  // ================================================================
  // The checklist itself — a floating dialog (ReportGenerateModal,
  // Figma node 2189:14364) shared by both flows now. "external"'s own
  // confirm handler is below: progress and the finished report are
  // surfaced through ReportToast/a new tab, never touching the chat
  // (compare confirmReportModalInline above, "chat"'s own handler).
  // ================================================================

  const openReportModal = () => setIsReportModalOpen(true);
  const closeReportModal = () => setIsReportModalOpen(false);

  /** "Generate Report" inside the floating dialog — closes it and runs
   * generation entirely in the background: "generating" ("Processing
   * your report…"), then a brief "downloading" beat, then "ready" —
   * at which point the finished report opens in its own tab
   * automatically, same as a real file download completing. */
  const confirmReportModal = (features: OfflineReportFeature[]) => {
    if (reportTimerRef.current !== null) window.clearTimeout(reportTimerRef.current);
    const reportTopic = topic;
    setReportFeatures(features);
    setIsReportModalOpen(false);
    setReportStatus("generating");
    setIsReportToastDismissed(false);
    reportTimerRef.current = window.setTimeout(() => {
      setReportStatus("downloading");
      reportTimerRef.current = window.setTimeout(() => {
        setReportStatus("ready");
        reportTimerRef.current = null;
        openReportInNewTab(reportTopic, features);
      }, REPORT_DOWNLOAD_MS);
    }, REPORT_GENERATE_MS);
  };

  /** The toast's "Preview"/"View" action, external flow — there's no
   * chat message to return to, so this just re-opens the report in a
   * fresh tab (the same one that opened automatically when it finished). */
  const reopenReport = () => openReportInNewTab(topic, reportFeatures);

  /** Closes the report status toast without affecting generation itself
   * — dismissing "Generating…" doesn't cancel it, and dismissing
   * "Report ready" doesn't un-generate it, it's just acknowledged. */
  const dismissReportToast = () => setIsReportToastDismissed(true);

  /** Returns to the greeting without disturbing an existing conversation
   * — "general" only when there's no topic already in play. On a page
   * with its own ambient topic (Safety), or once a conversation has
   * picked one up, this keeps that context instead of clearing it, so
   * re-opening the panel from the nav avatar doesn't drop the Safety
   * page's context chip / topic-scoped prompts. */
  const resetToHome = () => {
    setView("ask");
    setEntryContext(topic ? { kind: "topic", topic } : { kind: "home" });
  };

  /** Starts a fresh conversation already focused on one topic. */
  const resetToTopic = (t: OliviaTopic) => {
    setView("ask");
    setEntryContext({ kind: "topic", topic: t });
    setMessages([]);
    setTopic(t);
  };

  /** Starts a fresh conversation on a topic AND immediately asks a specific
   * question — the contextual card triggers' "ask this" popover uses this,
   * so clicking a suggested question opens straight to the answer instead
   * of the topic greeting. */
  const askQuestionFresh = (t: OliviaTopic, questionText: string) => {
    resetToTopic(t);
    sendMessage(questionText, t);
  };

  /** Reloads a past exchange verbatim (question + Olivia's answer already
   * given) — the Communication Center's "Recent Chats" list uses this to
   * resume a conversation instead of asking it fresh. */
  const loadConversation = (t: OliviaTopic, questionText: string, replyText: string) => {
    setView("ask");
    setEntryContext({ kind: "topic", topic: t });
    setMessages([
      { id: nextMessageId(), role: "user", text: questionText },
      { id: nextMessageId(), role: "olivia", text: replyText, topic: t },
    ]);
    setTopic(t);
  };

  /** A true blank slate — unlike resetToHome (which deliberately keeps an
   * existing conversation around), this clears messages too. Used by the
   * Communication Center's "New Chat" button, where the label promises a
   * fresh conversation, not just a return to the greeting. */
  const startNewChat = () => {
    setView("ask");
    setEntryContext({ kind: "home" });
    setMessages([]);
    setTopic(null);
  };

  /** The side panels'/FAB's "reset conversation" control — clears the
   * chat like startNewChat, but returns to the page's own ambient topic
   * (initialTopic) instead of wiping it to nothing. On the Safety page
   * that means resetting lands back on the Safety-scoped greeting, not
   * a generic one — "start over," not "forget what page this is." */
  const resetConversation = () => {
    setView("ask");
    setEntryContext(initialTopic ? { kind: "topic", topic: initialTopic } : { kind: "home" });
    setMessages([]);
    setTopic(initialTopic);
  };

  /** Opens straight to a proactive, already-said message from Olivia —
   * an instant page summary (e.g. Quality's Scope of Work) — instead
   * of a greeting she's waiting to be asked something from. No user
   * turn precedes it and no topic is implied, so it's its own thing
   * rather than a variant of loadConversation. `richContent`, when
   * given, renders something beyond the plain text bubble below it
   * (see ChatMessage/AskView) — Quality's summary is a 3-card
   * carousel of real charts, not just a paragraph. */
  const showPageSummary = (text: string, richContent?: ChatMessage["richContent"]) => {
    setView("ask");
    setEntryContext({ kind: "home" });
    setMessages([{ id: nextMessageId(), role: "olivia", text, richContent }]);
    setTopic(null);
  };

  /** ServiceHistoryModal's own "click a service" trigger (Figma node
   * 2209:42714, "Unprompted Summary - Verification Details") — same
   * shape as showPageSummary (a single proactive Olivia message, no
   * preceding user turn, empty `text` since the card owns all of its
   * own copy — see AskView's own bubble render and ChatTurnActions'
   * Copy action, which special-cases this richContent the same way it
   * already does for "pageSummary"), just scoped to one service event
   * instead of a whole page. Replaces (not appends to) whatever
   * conversation was already showing — clicking a different service
   * should read as "here's a fresh read of THIS one," not one more
   * turn in an unrelated thread. */
  const showServiceAnalysis = (analysis: ServiceAnalysis) => {
    setView("ask");
    setEntryContext({ kind: "home" });
    setMessages([
      { id: nextMessageId(), role: "olivia", text: "", richContent: "serviceAnalysis", serviceAnalysis: analysis },
    ]);
    setTopic(null);
    setLastServiceAnalysis(analysis);
  };

  return {
    view,
    setView,
    entryContext,
    topic,
    setTopic,
    isThinking,
    messages,
    scope,
    setScope,
    reportFeatures,
    reportStatus,
    isReportToastDismissed,
    isReportModalOpen,
    isExternalPresenterOpen,
    closeExternalPresenter,
    isLiveDashboardFullScreenOpen,
    openLiveDashboardFullScreen,
    closeLiveDashboardFullScreen,
    currentSummaryPageId,
    generatePageSummary,
    addCurrentViewToSummary,
    presenterIndex,
    setPresenterIndex,
    isPresenterPlaying,
    setIsPresenterPlaying,
    presenterNarrationText,
    stopPresentation,
    confirmReportModalInline,
    dismissReportToast,
    viewReport,
    openReportModal,
    closeReportModal,
    confirmReportModal,
    reopenReport,
    sendMessage,
    askTopic,
    pickMode,
    openMode,
    resetToHome,
    resetToTopic,
    askQuestionFresh,
    loadConversation,
    startNewChat,
    resetConversation,
    showPageSummary,
    showServiceAnalysis,
    lastServiceAnalysis,
  };
}

function promptTextFor(topic: OliviaTopic): string {
  switch (topic) {
    case "safety":
      return "What’s our last safety recordable?";
    case "complaint":
      return "What’s the latest complaint?";
    case "audit":
      return "When was our last customer audit?";
  }
}
