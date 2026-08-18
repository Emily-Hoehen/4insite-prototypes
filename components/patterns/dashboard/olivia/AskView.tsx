"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { CloseIcon, FileChartIcon, FinancialsIcon, ListIcon, MicrophoneIcon, PageIcon, PlayCircleIcon } from "../../icons";
import {
  OfflineReportFeature,
  OliviaScope,
  OliviaTopic,
  SummaryPageId,
  TOPIC_LABEL,
  TOPIC_SUGGESTED_PROMPTS,
} from "./oliviaContent";
import { MODES, TOOLS_MENU_ORDER } from "./OliviaPanel";
import type { OliviaEntryContext, OliviaPanelVariant, OliviaView } from "./OliviaPanel";
import { ChatTurnActions } from "./ChatTurnActions";
import { HomeGreeting } from "./HomeGreeting";
import { LiveDashboardPreviewCard } from "./LiveDashboardChatCard";
import { OliviaAvatar } from "./OliviaAvatar";
import { PageSummaryChatCard, summaryAsText } from "./PageSummaryChatCard";
import { QualitySummaryCards } from "./QualitySummaryCards";
import { ReportPreviewCard } from "./ReportChatCard";
import styles from "./OliviaViews.module.css";
import outputStyles from "./OutputsAndPerformanceLists.module.css";
// The stopped-presentation reply's Download button (Figma node
// 2209:33419) is the SOLID purple treatment, same as ReportPreviewCard's
// own button just below it in a "report" reply — reused directly
// instead of duplicating it, since OliviaViews.module.css's own
// .reportDownloadButton is the ghost-purple treatment the LIVE
// presenter view's footer needs instead (Figma node 2209:33376).
import reportCardStyles from "./ReportChatCard.module.css";

export type ChatMessage = {
  id: string;
  role: "user" | "olivia";
  text: string;
  topic?: OliviaTopic;
  /** Renders extra content below (qualitySummary), inside (report), or
   * alongside (reportGenerating) this message's own bubble instead of
   * just plain text:
   *  - "qualitySummary": Olivia's proactive Quality page summary is
   *    richer than a paragraph (QualitySummaryCards, no leading bubble).
   *  - "reportGenerating": the offline report checklist modal
   *    (ReportGenerateModal) has been confirmed and generation is
   *    running — a spinner next to `text` ("Generating offline
   *    report…") instead of the plain 3-dot thinking indicator, since
   *    this is a specific, named operation rather than an ordinary
   *    reply being composed. Removed once generation finishes (see
   *    useOliviaSession's confirmReportModalInline), replaced by the
   *    "report" message below.
   *  - "report": a finished offline report, previewed inline in the
   *    bubble (see ReportPreviewCard) instead of its own panel view —
   *    Figma node 2189:13896. Needs `reportFeatures` alongside it.
   *  - "presentationStopped": PresenterView's own "Stop" button (see
   *    useOliviaSession's stopPresentation) — carries the same
   *    "Download Presentation Report" action the presenter view's own
   *    footer offered, so leaving that view doesn't strand it.
   *  - "liveDashboard": "Generate a live dashboard of page view"'s own
   *    reply (see useOliviaSession's generateLiveDashboard) — a preview
   *    of the dashboard plus Export/View Full Screen actions, Figma
   *    node 2209:35164.
   *  - "pageSummary": "Summarize page view"'s own reply (see
   *    useOliviaSession's generatePageSummary/addCurrentViewToSummary)
   *    — a text-level summary of one or more pages, Figma nodes
   *    2209:36698/2209:36788. `text` is unused for this one; the
   *    content itself is derived from `summaryPageIds` at render time
   *    (see PageSummaryChatCard) so "Add current view to summary" can
   *    grow it without rebuilding a snapshot string by hand. */
  richContent?:
    | "qualitySummary"
    | "report"
    | "reportGenerating"
    | "presentationStopped"
    | "liveDashboard"
    | "pageSummary";
  /** Only set alongside richContent: "report" — which features the
   * Offline Report checklist had selected when this was generated. */
  reportFeatures?: OfflineReportFeature[];
  /** Only set alongside richContent: "pageSummary" — every page's
   * section currently folded into this one reply, in the order they
   * were added. */
  summaryPageIds?: SummaryPageId[];
};

export function AskView({
  variant,
  entryContext,
  messages,
  currentTopic,
  pageTopic,
  pageLabel,
  onClearTopic,
  isThinking,
  onSend,
  onSelectPrompt,
  onOpenMode,
  renderZeroState,
  onPrintSummary,
  onViewSummaryFullScreen,
  onViewLiveDashboardFullScreen,
  currentSummaryPageId = "home",
  onSummarizePage,
  onAddCurrentViewToSummary,
  onResetConversation,
}: {
  variant: OliviaPanelVariant;
  entryContext: OliviaEntryContext;
  messages: ChatMessage[];
  /** Topic of the conversation so far, if any — "panelContext"'s Tools menu
   * needs this since it can generate an output before any message exists. */
  currentTopic: OliviaTopic | null;
  /** The page's own ambient topic (e.g. the Safety page passes "safety"),
   * independent of `currentTopic` — a free-typed or picked question can
   * set `currentTopic` on ANY page (Home included) just by matching a
   * keyword, but the context chip is only meaningful when the page
   * itself has one; it must not appear just because the conversation
   * happened to drift onto a topic. `null` everywhere but Safety. */
  pageTopic: OliviaTopic | null;
  pageLabel?: string | undefined;
  /** Dismisses the context chip ("panelContext" only) — falls back to the
   * generic mixed-topic experience instead of whatever `currentTopic` is. */
  onClearTopic: () => void;
  isThinking: boolean;
  onSend: (text: string) => void;
  /** `questionText`, when given, is echoed verbatim instead of the topic's default phrasing. */
  onSelectPrompt: (topic: OliviaTopic, questionText?: string) => void;
  /** `scope`, when given, is a just-picked "This Page View"/"All
   * Sites" answer (HomeGreeting's own output cards ask this via
   * OutputsAndPerformanceLists' scope menu) — passed straight through
   * to the session's openMode so it can both set scope and resolve the
   * external-site-presentation branch in one call. Omitted by every
   * other caller (follow-up pills, the Tools menu), which don't ask a
   * scope question of their own. */
  onOpenMode: (mode: Exclude<OliviaView, "ask">, topic: OliviaTopic | null, scope?: OliviaScope) => void;
  /** Replaces the default HomeGreeting zero-state entirely — the FAB
   * modal's own "Generate an Output" / "Site Performance" grouped
   * greeting (Figma node 2085:1498) uses this to reuse AskView's
   * message log + composer without inheriting its greeting screen. */
  renderZeroState?: () => React.ReactNode;
  /** QualitySummaryCards' own controls, once its last card is reached —
   * only meaningful for a message with richContent: "qualitySummary". */
  onPrintSummary?: () => void;
  onViewSummaryFullScreen?: () => void;
  /** LiveDashboardPreviewCard's "View Full Screen" — only meaningful for
   * a message with richContent: "liveDashboard". */
  onViewLiveDashboardFullScreen?: () => void;
  /** PageSummaryChatCard's own props — only meaningful for a message
   * with richContent: "pageSummary". `currentSummaryPageId` is which
   * page THIS session is on right now (see useOliviaSession), used
   * only to show "Add current view to summary" as already-added. */
  currentSummaryPageId?: SummaryPageId;
  onSummarizePage?: () => void;
  onAddCurrentViewToSummary?: () => void;
  /** Every one of Olivia's turns gets its own copy/reset/rate row (see
   * ChatTurnActions) — reset here is the same action as the header's
   * own reset control, just repeated at the point of each reply. */
  onResetConversation: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [pageLabelVisible, setPageLabelVisible] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Don't auto-scroll when Olivia's proactive Quality summary is shown;
    // leave the user's current scroll position so they can inspect the
    // stacked cards without being pushed to the bottom.
    const last = messages[messages.length - 1];
    if (last?.richContent === "qualitySummary") return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  // Close the Tools menu on any click outside it.
  useEffect(() => {
    if (!toolsOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (!toolsRef.current?.contains(event.target as Node)) setToolsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [toolsOpen]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    onSend(draft);
    setDraft("");
  };

  const pickTool = (mode: Exclude<OliviaView, "ask">) => {
    onOpenMode(mode, currentTopic);
    setToolsOpen(false);
  };

  const lastMessage = messages[messages.length - 1];
  const hasConversation = messages.length > 0;
  // The persistent suggested-prompts footer (Figma node 2209:40293) —
  // sits fixed above the composer, not scrolled with the log, and shows
  // after ANY finished Olivia reply on ANY screen. This replaced two
  // older, narrower pill rows that used to live inline in the log
  // instead: the topic-answer follow-up pills (showFollowUps) and
  // presentationStopped's own 2-pill footer — both would now duplicate
  // this one, so they're gone rather than kept alongside it.
  const showSuggestedFooter =
    hasConversation && !isThinking && lastMessage?.role === "olivia" && lastMessage.richContent !== "reportGenerating";
  const composerPlaceholder = currentTopic
    ? `Ask Olivia about ${TOPIC_LABEL[currentTopic].toLowerCase()} or anything else…`
    : "Ask Olivia about this site…";

  return (
    <div className={styles.askView}>
      {/* Everything — transcript/greeting and the composer — lives in one
          inset card (Figma node 2038:103), not floating separately on the
          panel's gradient. See OliviaViews.module.css. */}
      <div className={styles.chatCard}>
        {!hasConversation ? (
          <div className={styles.log}>
            {renderZeroState ? (
              renderZeroState()
            ) : (
              /* Always the personal "Hi Emily" greeting (Figma node 2082:434)
                 — opening Olivia from a specific card no longer swaps in a
                 topic-locked screen. She still knows the context: the
                 prompts below just point at whatever topic she was opened
                 with, same as the context chip in the composer below. */
              <HomeGreeting
                onPickTopic={onSelectPrompt}
                onOpenMode={(mode, scope) => onOpenMode(mode, currentTopic, scope)}
                onSummarizePage={onSummarizePage}
                promptSet={entryContext.kind === "topic" ? TOPIC_SUGGESTED_PROMPTS[entryContext.topic] : undefined}
                performanceLabel={
                  pageTopic === "safety"
                    ? "Ask about safety"
                    : pageLabel === "Quality"
                    ? "Ask about quality"
                    : undefined
                }
              />
            )}
          </div>
        ) : (
          <div className={[styles.log, styles.logMessages].join(" ")} ref={scrollRef} aria-live="polite">
            {messages.map((message) => {
              const isLast = message === lastMessage;
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowOlivia].join(" ")}
                >
                  {isUser ? (
                    <>
                      <div className={styles.userMessageHead}>
                        <p className={styles.userMessageName}>Emily</p>
                        <span className={styles.userAvatar} aria-hidden="true">
                          EH
                        </span>
                      </div>
                      <div className={[styles.bubble, styles.bubbleUser].join(" ")}>{message.text}</div>
                    </>
                  ) : (
                    <>
                      {/* Name/avatar + bubble are one 10px-gap group (Figma node
                          2054:126); the follow-up pills below are a second,
                          16px-gap sibling within the same turn (2054:125) — see
                          .bubbleRowOlivia's own gap in OliviaViews.module.css. */}
                      {message.richContent === "qualitySummary" ? (
                        // For the proactive Quality page summary we only show
                        // the rich charts content (no leading Olivia text bubble)
                        <QualitySummaryCards
                          onPrint={() => onPrintSummary?.()}
                          onViewFullScreen={() => onViewSummaryFullScreen?.()}
                        />
                      ) : (
                        <div className={styles.oliviaTurnBody}>
                          <div className={styles.oliviaMessageHead}>
                            <OliviaAvatar size={36} />
                            <p className={styles.oliviaMessageName}>Olivia</p>
                          </div>
                          <div className={[styles.bubble, styles.bubbleOlivia].join(" ")}>
                            {message.richContent === "reportGenerating" ? (
                              <span className={styles.reportGeneratingRow}>
                                <span className={styles.reportGeneratingSpinner} aria-hidden="true" />
                                {message.text}
                              </span>
                            ) : (
                              message.text
                            )}
                            {/* A finished report lives inside Olivia's own reply
                                bubble (Figma node 2189:13896) — a preview card,
                                not a separate panel view. */}
                            {message.richContent === "report" && (
                              <ReportPreviewCard
                                topic={message.topic ?? null}
                                features={message.reportFeatures ?? []}
                              />
                            )}
                            {/* Stopping a presentation still leaves the
                                download action reachable — same button
                                PresenterView's own footer had. */}
                            {message.richContent === "presentationStopped" && (
                              <button
                                type="button"
                                className={reportCardStyles.downloadButton}
                                onClick={() => window.print()}
                              >
                                Download Presentation Report
                              </button>
                            )}
                            {/* Same placement as the report/presentation-stopped
                                cards above — the dashboard preview lives inside
                                Olivia's own reply bubble, not a separate panel view. */}
                            {message.richContent === "liveDashboard" && (
                              <LiveDashboardPreviewCard onViewFullScreen={() => onViewLiveDashboardFullScreen?.()} />
                            )}
                            {/* Same placement again — the summary itself lives
                                inside Olivia's own reply bubble. Copy/reset/
                                rate live outside the bubble now (see
                                ChatTurnActions below), so this card only owns
                                its own two actions (Download, Add current
                                view). */}
                            {message.richContent === "pageSummary" && (
                              <PageSummaryChatCard
                                summaryPageIds={message.summaryPageIds ?? []}
                                currentSummaryPageId={currentSummaryPageId}
                                onAddCurrentView={() => onAddCurrentViewToSummary?.()}
                              />
                            )}
                          </div>
                        </div>
                      )}

                      {/* The one action row every Olivia reply gets — Figma
                          node 2212:43095 — copy + reset (with their own
                          tooltips) left-aligned, rate this response
                          right-aligned. Every reply, not just the last, same
                          as the old standalone reset icon this replaced;
                          the one exception is a report still mid-generation,
                          which has nothing to copy or rate yet. This used to
                          differ by reply kind (bare reset for a plain reply,
                          reset+rate with no copy for report/
                          presentationStopped/liveDashboard, copy+sync+rate
                          folded inside the bubble for pageSummary) — now
                          every kind gets this same row, once. */}
                      {message.richContent !== "reportGenerating" && (
                        <ChatTurnActions
                          onCopy={() => {
                            const text =
                              message.richContent === "pageSummary"
                                ? summaryAsText(message.summaryPageIds ?? [])
                                : message.text;
                            if (typeof navigator !== "undefined" && navigator.clipboard) {
                              navigator.clipboard.writeText(text).catch(() => {});
                            }
                          }}
                          onReset={() => onResetConversation()}
                        />
                      )}

                    </>
                  )}
                </div>
              );
            })}

            {isThinking && (
              <div className={[styles.bubbleRow, styles.bubbleRowOlivia].join(" ")}>
                <div className={styles.oliviaTurnBody}>
                  <div className={styles.oliviaMessageHead}>
                    <OliviaAvatar size={36} />
                    <p className={styles.oliviaMessageName}>Olivia</p>
                  </div>
                  <div className={styles.thinking}>
                    <span className={styles.thinkingDot} />
                    <span className={styles.thinkingDot} />
                    <span className={styles.thinkingDot} />
                    <span className={styles.srOnly}>Olivia is thinking</span>
                  </div>
                </div>
              </div>
            )}

            {/* Suggested-prompts row — Figma node 2209:40293. Part of the
                scrollable log itself (not pinned above the composer) so it
                scrolls away with the rest of the conversation instead of
                staying stuck at the bottom — shows after any finished
                Olivia reply on every screen, not just specific reply kinds. */}
            {showSuggestedFooter && (
              <div className={styles.suggestedFooter}>
                <div className={outputStyles.pillList}>
                  <button type="button" className={outputStyles.promptPill} onClick={() => onSummarizePage?.()}>
                    <span className={outputStyles.promptPillIcon}>
                      <ListIcon />
                    </span>
                    Summarize page view
                  </button>
                  <button
                    type="button"
                    className={outputStyles.promptPill}
                    onClick={() => onOpenMode("presenter", currentTopic, "page")}
                  >
                    <span className={outputStyles.promptPillIcon}>
                      <PlayCircleIcon />
                    </span>
                    Present this page
                  </button>
                  <button
                    type="button"
                    className={outputStyles.promptPill}
                    onClick={() => onOpenMode("dashboard", currentTopic, "page")}
                  >
                    <span className={outputStyles.promptPillIcon}>
                      <FinancialsIcon />
                    </span>
                    Generate a live dashboard of page
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className={styles.chatCardFooter}>
          {variant === "panelIcons" ? (
            <form className={styles.composer} onSubmit={handleSubmit}>
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={composerPlaceholder}
                aria-label="Ask Olivia a question"
                className={styles.composerInput}
                disabled={isThinking}
              />
              <button
                type="submit"
                className={styles.composerSend}
                disabled={isThinking}
                aria-label="Send question"
              >
                <MicrophoneIcon />
              </button>
            </form>
          ) : (
            // "panelContext" (Figma node 2059:112/2059:125): a taller, two-row
            // composer — the text field on top, a "Tools" menu + send button
            // below. Tools surfaces the same three outputs as Option 1's
            // header icons, just reachable from here instead, "at all times"
            // (works with or without a conversation started — see currentTopic).
            <div className={styles.composerFrame}>
              {/* Dismissible "set context" chip — Figma node 2066:182. Shown
                  only on a page with its own ambient topic (e.g. the Safety
                  page opens her straight into it), so it's clear what "this
                  view" means to Tools before you've asked anything — gated
                  on pageTopic, not currentTopic, so it doesn't also appear
                  just because a free-typed question happened to match a
                  topic on a page with no ambient context of its own. */}
              {(pageTopic && currentTopic) || (pageLabel && pageLabelVisible) ? (
                <div className={styles.contextChip}>
                  <PageIcon className={styles.contextChipIcon} />
                  <span className={styles.contextChipLabel}>
                    {pageTopic && currentTopic ? TOPIC_LABEL[currentTopic] : pageLabel}
                  </span>
                  <button
                    type="button"
                    className={styles.contextChipClose}
                    onClick={() => {
                      if (pageTopic && currentTopic) {
                        onClearTopic();
                      } else {
                        // For page-level labels (e.g. Quality) hide locally
                        // and also call the generic clear handler to reset
                        // any topic state the session may hold.
                        onClearTopic();
                        setPageLabelVisible(false);
                      }
                    }}
                    aria-label={`Clear ${pageTopic && currentTopic ? TOPIC_LABEL[currentTopic] : pageLabel} context`}
                  >
                    <CloseIcon />
                  </button>
                </div>
              ) : null}
              <form
                className={
                  [
                    styles.composerExpanded,
                    (pageTopic && currentTopic) || (pageLabel && pageLabelVisible) ? styles.composerExpandedJoined : "",
                  ]
                    .join(" ")
                }
                onSubmit={handleSubmit}
              >
                <input
                  type="text"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={composerPlaceholder}
                  aria-label="Ask Olivia a question"
                  className={styles.composerExpandedInput}
                  disabled={isThinking}
                />
                <div className={styles.composerToolsRow}>
                  <div className={styles.toolsWrap} ref={toolsRef}>
                    <button
                      type="button"
                      className={styles.toolsPill}
                      aria-haspopup="menu"
                      aria-expanded={toolsOpen}
                      onClick={() => setToolsOpen((open) => !open)}
                    >
                      <FileChartIcon className={styles.toolsPillIcon} />
                      Outputs
                    </button>

                    {toolsOpen && (
                      <div className={styles.toolsMenu} role="menu" aria-label="Olivia outputs">
                        {TOOLS_MENU_ORDER.map((id) => {
                          const mode = MODES.find((m) => m.id === id)!;
                          return (
                            <button
                              key={mode.id}
                              type="button"
                              role="menuitem"
                              className={styles.toolsMenuItem}
                              onClick={() => pickTool(mode.id)}
                            >
                              <span className={styles.toolsMenuItemHead}>
                                <span className={styles.toolsMenuIcon}>{mode.icon}</span>
                                {mode.toolsLabel}
                              </span>
                              <span className={styles.toolsMenuDescription}>{mode.toolsDescription}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className={styles.composerSend}
                    disabled={isThinking}
                    aria-label="Send question"
                  >
                    <MicrophoneIcon />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
