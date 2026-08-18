"use client";

import { useEffect, useRef, useState } from "react";
import type { RosterPerson } from "../../../../lib/csv";
import { CloseIcon, EnvelopeIcon, SparkleIcon } from "../../icons";
import type { OliviaTopic } from "./oliviaContent";
import { OliviaRecentChats } from "./OliviaRecentChats";
import styles from "./CommunicationCenterPanel.module.css";

export type CommCenterTab = "messages" | "comments" | "news" | "releaseNotes" | "olivia";

const TABS: { id: CommCenterTab; label: string }[] = [
  { id: "messages", label: "Messages" },
  { id: "olivia", label: "Olivia" },
  { id: "comments", label: "Comments" },
  { id: "news", label: "News" },
  { id: "releaseNotes", label: "Release Notes" },
];

/** A single request to open the Communication Center — just which tab
 * to land on. Olivia no longer carries any context through here (see
 * below): the "olivia" tab always shows Recent Chats, and starting or
 * resuming a chat hands off to the real side panel instead. */
export type CommCenterOpenRequest = { requestId: number; tab: CommCenterTab };

const PLACEHOLDER_COPY: Record<Exclude<CommCenterTab, "olivia">, { subject: string; preview: string }[]> = {
  messages: [
    { subject: "Daily Assignment 08/11/2026", preview: "22 out of 23 opened" },
    { subject: "SCHEDULE FOR 8/9/26", preview: "31 out of 33 opened" },
  ],
  comments: [
    { subject: "Re: HEAD HOUSE LOCKER USE", preview: "1 new comment" },
    { subject: "Re: Daily Assignment 08/10/2026", preview: "No comments yet" },
  ],
  news: [
    { subject: "SBM's Manager in Training Program", preview: "Special Feature" },
    { subject: "Q3 safety recognition", preview: "Company news" },
  ],
  releaseNotes: [
    { subject: "4insite v4.12 release notes", preview: "New: Scope of Work filters" },
    { subject: "4insite v4.11 release notes", preview: "Fixed: report export formatting" },
  ],
};

/**
 * Option 2, "Communications Center": Olivia doesn't get her own navbar
 * entry point here — she's a tab inside the same hub as Messages/
 * Comments/News/Release Notes, opened from the nav's envelope icon.
 * Unlike the earlier build of this exploration, the "Olivia" tab no
 * longer embeds a live chat inline: it only ever shows Recent Chats
 * (see OliviaRecentChats). Starting a new chat or resuming a past one
 * closes this panel and opens the real side panel instead (Option 1's
 * "panelIcons" style) — one actual conversation surface, not two.
 * See CommunicationCenterFullScreen for the "View All" destination.
 */
export function CommunicationCenterPanel({
  isOpen,
  onClose,
  openRequest,
  people,
  onViewAll,
  onOpenNewChat,
  onResumeChat,
}: {
  isOpen: boolean;
  onClose: () => void;
  openRequest?: CommCenterOpenRequest | null;
  /** A few real roster people to attribute placeholder messages to,
   * rather than inventing names. */
  people: RosterPerson[];
  onViewAll: () => void;
  /** "New Chat" in Recent Chats — closes this panel and opens the real
   * side panel on its general greeting. */
  onOpenNewChat: () => void;
  /** Resuming a past chat from Recent Chats — closes this panel and
   * opens the real side panel with that exchange already loaded. */
  onResumeChat: (topic: OliviaTopic, question: string, reply: string) => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastHandledRequestId = useRef<number | null>(null);
  const [tab, setTab] = useState<CommCenterTab>("messages");

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!openRequest || lastHandledRequestId.current === openRequest.requestId) return;
    lastHandledRequestId.current = openRequest.requestId;
    setTab(openRequest.tab);
  }, [openRequest]);

  return (
    <>
      <div
        className={[styles.backdrop, isOpen ? styles.backdropOpen : ""].filter(Boolean).join(" ")}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={[styles.panel, isOpen ? styles.panelOpen : ""].filter(Boolean).join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label="Communication Center"
        aria-hidden={!isOpen}
      >
        <header className={styles.header}>
          <EnvelopeIcon className={styles.headerIcon} />
          <p className={styles.title}>Communication Center</p>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close Communication Center"
          >
            <CloseIcon />
          </button>
        </header>

        <div className={styles.tabRow} role="tablist" aria-label="Communication Center sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={[styles.tab, tab === t.id ? styles.tabActive : ""].join(" ")}
              onClick={() => setTab(t.id)}
            >
              {/* Marks the AI tab apart from plain content tabs — Figma node 2097:1811. */}
              {t.id === "olivia" && <SparkleIcon className={styles.tabSparkle} />}
              {t.label}
            </button>
          ))}
        </div>

        <div className={styles.body}>
          {tab === "olivia" ? (
            <OliviaRecentChats onNewChat={onOpenNewChat} onSelectChat={onResumeChat} />
          ) : (
            <div className={styles.list}>
              {PLACEHOLDER_COPY[tab].map((item, i) => {
                const person = people[i % Math.max(people.length, 1)];
                return (
                  <div key={item.subject} className={styles.listItem}>
                    {person?.avatar && <img src={person.avatar} alt="" className={styles.listAvatar} />}
                    <div className={styles.listText}>
                      <p className={styles.listSender}>{person?.name ?? "4insite"}</p>
                      <p className={styles.listSubject}>{item.subject}</p>
                    </div>
                    <span className={styles.listMeta}>{item.preview}</span>
                  </div>
                );
              })}
              <button type="button" className={styles.viewAll} onClick={onViewAll}>
                View All
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
