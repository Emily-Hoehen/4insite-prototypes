"use client";

import { useState } from "react";
import type { RosterPerson } from "../../../lib/csv";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, SearchIcon, SparkleIcon } from "../icons";
import type { OliviaTopic } from "./olivia/oliviaContent";
import { OliviaRecentChats } from "./olivia/OliviaRecentChats";
import styles from "./CommunicationCenterFullScreen.module.css";

type FullScreenTab = "messages" | "news" | "releaseNotes" | "olivia";

const TABS: { id: FullScreenTab; label: string }[] = [
  { id: "messages", label: "Messages" },
  { id: "olivia", label: "Olivia" },
  { id: "news", label: "News" },
  { id: "releaseNotes", label: "Release Notes" },
];

const ROW_COPY = [
  { title: "Daily Assignment 08/11/2026", shifts: "Day — LGA-LaGuardia, NY", opened: "22 out of 23" },
  { title: "Daily Assignment 08/10/2026", shifts: "Day — LGA-LaGuardia, NY", opened: "25 out of 26" },
  { title: "HEAD HOUSE LOCKER USE", shifts: "Day — LGA-LaGuardia, NY", opened: "70 out of 80" },
  { title: "SCHEDULE FOR 8/9/26", shifts: "Day — LGA-LaGuardia, NY", opened: "31 out of 33" },
  { title: "SCHEDULE FOR 8/8/26", shifts: "Day — LGA-LaGuardia, NY", opened: "25 out of 26" },
  { title: "TRASHING SAFETY", shifts: "N/A", opened: "216 out of 240" },
];

/**
 * The "View All" destination from CommunicationCenterPanel — this
 * project's other full pages (Home, Safety) are real Next.js routes
 * (see app/communications/page.tsx) rather than an in-panel modal, so
 * this is too, keeping Nav/PrototypeSwitcher shared via OliviaDashboard
 * exactly like those. Table columns/rows are placeholder-only per
 * scope — the point of this page is the Olivia tab, not a fully
 * built-out messaging product. Like the compact panel, the "Olivia"
 * tab here only ever shows Recent Chats — starting or resuming a chat
 * hands off to the real side panel (owned by OliviaDashboard) instead
 * of embedding a live conversation on this page.
 */
export function CommunicationCenterFullScreen({
  people,
  onOpenNewChat,
  onResumeChat,
}: {
  people: RosterPerson[];
  onOpenNewChat: () => void;
  onResumeChat: (topic: OliviaTopic, question: string, reply: string) => void;
}) {
  const [tab, setTab] = useState<FullScreenTab>("messages");

  return (
    <section className={styles.section}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.heading}>Communications Center</h1>
        </div>
        <div className={styles.pageHeadActions}>
          <button type="button" className={styles.createButton}>
            <PlusIcon className={styles.createIcon} />
            Create New
          </button>
          <div className={styles.dateRange}>
            <button type="button" className={styles.dateRangeArrow} aria-label="Previous period">
              <ChevronLeftIcon />
            </button>
            <span className={styles.dateRangeLabel}>Aug 01, 2026 - Aug 10, 2026</span>
            <button type="button" className={styles.dateRangeArrow} aria-label="Next period">
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.subNav}>
        <span className={styles.subNavItemActive}>All Messages</span>
        <span className={styles.subNavItem}>My Inbox</span>
      </div>

      <div className={styles.tabRow} role="tablist" aria-label="Communications Center sections">
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

      {tab === "olivia" ? (
        <div className={styles.oliviaFrame}>
          <OliviaRecentChats onNewChat={onOpenNewChat} onSelectChat={onResumeChat} />
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.toolbar}>
            <div className={styles.searchField}>
              <SearchIcon className={styles.searchIcon} />
              <input type="text" placeholder="Find Sender or Recipient" className={styles.searchInput} />
            </div>
          </div>

          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Sent From</th>
                  <th>Title</th>
                  <th>Shifts</th>
                  <th>Opened</th>
                  <th>Comments</th>
                  <th>Attachments</th>
                </tr>
              </thead>
              <tbody>
                {ROW_COPY.map((row, i) => {
                  const person = people[i % Math.max(people.length, 1)];
                  return (
                    <tr key={row.title}>
                      <td>
                        <div className={styles.senderCell}>
                          {person?.avatar && <img src={person.avatar} alt="" className={styles.senderAvatar} />}
                          <div>
                            <p className={styles.senderName}>{person?.name ?? "4insite"}</p>
                            <p className={styles.senderMeta}>{person?.position ?? "Staff"}</p>
                          </div>
                        </div>
                      </td>
                      <td>{row.title}</td>
                      <td>{row.shifts}</td>
                      <td className={styles.openedCell}>{row.opened}</td>
                      <td>0</td>
                      <td>0</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
