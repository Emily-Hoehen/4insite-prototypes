"use client";

import { ChatIcon } from "../../icons";
import { OLIVIA_ANSWERS, type OliviaTopic } from "./oliviaContent";
import { OliviaAvatar } from "./OliviaAvatar";
import styles from "./OliviaRecentChats.module.css";

type RecentChat = {
  id: string;
  topic: OliviaTopic;
  question: string;
  timestamp: string;
};

/** Canned — this prototype doesn't persist real conversation history
 * anywhere. Reuses the same three canned Q&As the rest of the panel
 * already answers with (oliviaContent.ts), so resuming one is a
 * faithful reload of an exchange Olivia can actually have, just not
 * genuinely from "yesterday." */
const RECENT_CHATS: RecentChat[] = [
  { id: "1", topic: "safety", question: "What's our last safety recordable?", timestamp: "Today, 9:14 AM" },
  { id: "2", topic: "audit", question: "When was our last customer audit?", timestamp: "Yesterday, 2:37 PM" },
  { id: "3", topic: "complaint", question: "What's the latest complaint?", timestamp: "Aug 10, 11:02 AM" },
];

/**
 * Default landing view for the Communication Center's Olivia tab. Per
 * Figma node 2097:1801 ("Communication Center Olivia Tab"): each row
 * carries Olivia's own avatar (not a topic-colored icon) plus a
 * question/reply pair, divided by hairlines like a table row — the
 * same row language the other tabs' placeholder lists already use —
 * and "New Chat" is a flat purple-tint button, not a gradient pill.
 * Design call: the other tabs here (Messages/Comments/News/Release
 * Notes) all lead with a list, so Olivia's does too, instead of
 * dropping straight into a live chat.
 */
export function OliviaRecentChats({
  onSelectChat,
  onNewChat,
}: {
  onSelectChat: (topic: OliviaTopic, question: string, reply: string) => void;
  onNewChat: () => void;
}) {
  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <p className={styles.heading}>Recent Chats</p>
        <button type="button" className={styles.newChat} onClick={onNewChat}>
          <ChatIcon className={styles.newChatIcon} />
          New Chat
        </button>
      </div>

      <div className={styles.list}>
        {RECENT_CHATS.map((chat) => (
          <button
            key={chat.id}
            type="button"
            className={styles.item}
            onClick={() => onSelectChat(chat.topic, chat.question, OLIVIA_ANSWERS[chat.topic].reply)}
          >
            <OliviaAvatar size={48} alt="Olivia" className={styles.itemAvatar} />
            <span className={styles.itemText}>
              <span className={styles.itemQuestion}>{chat.question}</span>
              <span className={styles.itemPreview}>{OLIVIA_ANSWERS[chat.topic].reply}</span>
            </span>
            <span className={styles.itemMeta}>{chat.timestamp}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
