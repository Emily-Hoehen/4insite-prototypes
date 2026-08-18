"use client";

import { useEffect, useRef, useState } from "react";
import { BullhornIcon, CloseIcon, FinancialsIcon, MoreIcon, PdfIcon, RotateLeftIcon } from "../../icons";
import { SUGGESTED_PROMPTS, TOPIC_SWATCH, type OliviaTopic } from "./oliviaContent";
import type { OliviaView } from "./OliviaPanel";
import { OliviaAvatar } from "./OliviaAvatar";
import { TopicIcon } from "./TopicIcon";
import { AskView } from "./AskView";
import { ExternalPresenterView } from "./ExternalPresenterView";
import { PresenterView } from "./PresenterView";
import { ReportGenerateModal } from "./ReportGenerateModal";
import { ReportToast } from "./ReportToast";
import { LiveDashboardFullScreen } from "./LiveDashboardFullScreen";
import type { ReportFlowVariant } from "./OliviaPanel";
import type { useOliviaSession } from "./useOliviaSession";
import styles from "./OliviaFabModal.module.css";

/** "Generate an Output" list — same three modes as the side panel's
 * header icons/Tools menu, just reached from the FAB modal's own
 * zero-state instead. Colors match Figma node 2085:1498 exactly
 * (each mode gets its own tinted swatch there, unlike the side panel's
 * single purple treatment). */
const OUTPUT_MODES: { id: Exclude<OliviaView, "ask">; label: string; icon: React.ReactNode; bg: string; color: string }[] = [
  { id: "report", label: "Generate a Report", icon: <PdfIcon />, bg: "rgba(130, 123, 219, 0.15)", color: "#827bdb" },
  { id: "presenter", label: "Start a Presentation", icon: <BullhornIcon />, bg: "rgba(0, 255, 141, 0.15)", color: "#00ff8d" },
  { id: "dashboard", label: "View a Live Dashboard", icon: <FinancialsIcon />, bg: "rgba(183, 14, 255, 0.15)", color: "#b70eff" },
];

function FabGreeting({
  onPickMode,
  onPickPrompt,
}: {
  onPickMode: (mode: Exclude<OliviaView, "ask">) => void;
  onPickPrompt: (topic: OliviaTopic, question: string) => void;
}) {
  return (
    <div className={styles.greeting}>
      <div className={styles.greetingHero}>
        <div className={styles.greetingText}>
          <p className={styles.greetingHeadline}>Hi Emily, how can I help you today?</p>
          <p className={styles.greetingSub}>Ask me any question, or start with a prompt below.</p>
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Generate an output</p>
        <div className={styles.sectionList}>
          {OUTPUT_MODES.map((mode) => (
            <button key={mode.id} type="button" className={styles.suggestItem} onClick={() => onPickMode(mode.id)}>
              <span className={styles.suggestIcon} style={{ backgroundColor: mode.bg, color: mode.color }}>
                {mode.icon}
              </span>
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Site Performance</p>
        <div className={styles.sectionList}>
          {SUGGESTED_PROMPTS.map((prompt) => {
            const swatch = TOPIC_SWATCH[prompt.topic];
            return (
              <button
                key={prompt.topic}
                type="button"
                className={styles.suggestItem}
                onClick={() => onPickPrompt(prompt.topic, prompt.question)}
              >
                <span className={styles.suggestIcon} style={{ backgroundColor: swatch.bg, color: swatch.color }}>
                  <TopicIcon topic={prompt.topic} />
                </span>
                {prompt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Option 1, "Global Persistent Entry" — the FAB variant: instead of a
 * full-height slide-out panel, Olivia opens as a small floating card
 * anchored near the FAB itself (see OliviaFab), per Figma node
 * 2085:694/2085:1498. Reuses AskView for the actual conversation
 * (message log + composer) once one exists, same as the side panel —
 * only the zero-state greeting and the header chrome are bespoke here.
 */
export function OliviaFabModal({
  isOpen,
  onClose,
  onRequestOpen,
  session,
  reportFlowVariant = "chat",
}: {
  isOpen: boolean;
  onClose: () => void;
  /** Reopens the modal from outside it — see the identical prop on
   * OliviaPanel; report generation survives this modal being closed. */
  onRequestOpen?: () => void;
  session: ReturnType<typeof useOliviaSession>;
  /** Which "Generate a Report" experience this modal runs — see the
   * identical prop on OliviaPanel/ReportFlowVariant. The caller is
   * responsible for constructing `session` with the same variant
   * (useOliviaSession's own second argument), since that's what
   * actually drives pickMode/openMode's behavior. */
  reportFlowVariant?: ReportFlowVariant;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  /** Same reasoning as OliviaPanel's own handleClose — the "external"
   * flow's floating checklist dialog is foreground-only, so closing
   * this modal drops it too, unlike generation itself. */
  const handleClose = () => {
    session.closeReportModal();
    session.closeExternalPresenter();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (moreMenuOpen) {
        setMoreMenuOpen(false);
      } else {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose, moreMenuOpen]);

  // Close the "more" dropdown on any click outside it.
  useEffect(() => {
    if (!moreMenuOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (!moreMenuRef.current?.contains(event.target as Node)) setMoreMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [moreMenuOpen]);

  const { view, setView, entryContext, topic, setTopic, isThinking, messages, scope, setScope } = session;

  /** Same fix as OliviaPanel's own identical effect — without this,
   * the report toast (below) only hides itself WHILE the user is on
   * the Ask tab, chat flow, report ready; it doesn't know they've
   * already seen the finished report sitting right there in the log,
   * so switching to Presenter (or anywhere else) right after would
   * make it pop back up as if something new had happened. This marks
   * it dismissed for real the moment that's true, so it stays gone
   * regardless of which view comes next. */
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

  return (
    <>
    <div
      ref={modalRef}
      className={[styles.modal, isOpen ? styles.modalOpen : ""].filter(Boolean).join(" ")}
      role="dialog"
      aria-modal="true"
      aria-label="Olivia"
      aria-hidden={!isOpen}
    >
      <header className={styles.header}>
          <button type="button" className={styles.identity} onClick={() => setView("ask")} aria-label="Back to Ask Olivia">
          <OliviaAvatar size={36} />
          <div>
            <p className={styles.title}>Olivia</p>
            <p className={styles.subtitle}>AI Assistant</p>
          </div>
        </button>
        <div className={styles.headerActions}>
          <div className={styles.resetWrap}>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => session.resetConversation()}
              aria-label="Reset conversation"
            >
              <RotateLeftIcon />
            </button>
            <span className={styles.resetTooltip} role="tooltip">
              Reset conversation
            </span>
          </div>

          {/* The kebab's dropdown — same three outputs as the zero-state's
              "Generate an Output" list, just reachable at any time,
              matching "panelIcons"'s always-available header icons and
              "panelContext"'s always-available Tools menu. */}
          <div className={styles.moreWrap} ref={moreMenuRef}>
            <button
              type="button"
              className={styles.iconButton}
              aria-haspopup="menu"
              aria-expanded={moreMenuOpen}
              aria-label="Generate an output"
              onClick={() => setMoreMenuOpen((open) => !open)}
            >
              <MoreIcon />
            </button>

            {moreMenuOpen && (
              <div className={styles.moreMenu} role="menu" aria-label="Generate an output">
                {OUTPUT_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    role="menuitem"
                    className={styles.moreMenuItem}
                    onClick={() => {
                      session.openMode(mode.id, topic);
                      setMoreMenuOpen(false);
                    }}
                  >
                    <span className={styles.moreMenuIcon} style={{ backgroundColor: mode.bg, color: mode.color }}>
                      {mode.icon}
                    </span>
                    {mode.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button type="button" className={styles.iconButton} onClick={handleClose} aria-label="Close Olivia">
            <CloseIcon />
          </button>
        </div>
      </header>

      <div className={styles.body}>
        {view === "ask" && (
          <AskView
            variant="panelIcons"
            entryContext={entryContext}
            messages={messages}
            currentTopic={topic}
            // "panelIcons" never renders the context chip regardless (see
            // AskView), so this has no visible effect here — passed only
            // to satisfy the prop, not because the FAB modal has its own
            // page-ambient context concept.
            pageTopic={null}
            onClearTopic={() => setTopic(null)}
            isThinking={isThinking}
            onSend={(text) => session.sendMessage(text)}
            onSelectPrompt={(t, q) => session.askTopic(t, q)}
            onOpenMode={session.openMode}
            renderZeroState={() => (
              <FabGreeting
                onPickMode={(mode) => session.openMode(mode, topic)}
                onPickPrompt={(t, q) => session.askTopic(t, q)}
              />
            )}
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
            index={session.presenterIndex}
            setIndex={session.setPresenterIndex}
            isPlaying={session.isPresenterPlaying}
            setIsPlaying={session.setIsPresenterPlaying}
          />
        )}
      </div>
    </div>

      {/* Rendered for BOTH flows now — see the identical comment on
          OliviaPanel's own ReportGenerateModal. */}
      {session.isReportModalOpen && (
        <ReportGenerateModal
          onCancel={session.closeReportModal}
          onGenerate={reportFlowVariant === "external" ? session.confirmReportModal : session.confirmReportModalInline}
        />
      )}

      {session.isExternalPresenterOpen && (
        <ExternalPresenterView topic={topic} onClose={session.stopSitePresentation} />
      )}

      {session.isLiveDashboardFullScreenOpen && (
        <LiveDashboardFullScreen onClose={session.closeLiveDashboardFullScreen} />
      )}

      {/* Sibling of .modal, not a child — same reasoning as OliviaPanel's
          own toast: this has to outlive .modal's own open/close transform.
          Hidden while the user is already on the Ask tab with the modal
          open AND the report lands there ("chat" flow) — "external" never
          puts anything in the chat, so its toast always shows. The effect
          above additionally marks it dismissed for good the moment
          that's true, so leaving the Ask tab right after doesn't make it
          reappear for a report they've already seen. */}
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
