import type { RosterPerson } from "../../../lib/csv";
import { EnvelopeIcon, NewspaperIcon, PlusIcon, SendIcon } from "../icons";
import { SectionHeading } from "./SectionHeading";
import styles from "./CommsSection.module.css";

export function CommsSection({ sender }: { sender: RosterPerson }) {
  return (
    <section className={styles.section}>
      <SectionHeading
        icon={<EnvelopeIcon />}
        chipColor="var(--color-datavis-purple-100)"
        chipBorder="var(--color-datavis-purple-500)"
        iconColor="var(--color-text-lt-default)"
      >
        Communication
      </SectionHeading>

      <div className={styles.row}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.cardHeadText}>
              <p className={styles.h2White}>Last Message</p>
              <p className={styles.h3Bubblegum}>Scan!! Scan!! Scan!!</p>
            </div>
            <img src={sender.avatar} alt="" className={styles.avatarLg} />
          </div>
          <p className={styles.body}>
            Good afternoon Team, I want to remind everyone to scan, scan, scan your jet bridges,
            jet bridge corridors, stairwells, and elevators. There is no exception to this but to
            SCAN!!! PLEASE!!! IT IS VERY IMPORTANT THAT WE MEET OUR SCAN NUMBERS EVERYDAY!! If you
            phone is not scanning and QR sticker please report ASAP!! if you have any question
            please message under request to speak with manager. – {sender.name}
          </p>
          <p className={styles.timestamp}>Today, 3:06 AM</p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.cardHeadText}>
              <p className={styles.h2White}>News</p>
              <div className={styles.newsLabel}>
                <span className={styles.h4Secondary}>Special Feature</span>
                <span className={styles.h3Purple}>SBM&rsquo;s Manager in Training Program</span>
              </div>
            </div>
            <span className={styles.iconChipPinkle}>
              <NewspaperIcon />
            </span>
          </div>
          <p className={styles.body}>
            SBM is thrilled to announce the addition of our three newest partners: Valarie
            Barnett, Nicole Ouimet, and Nick McMackins. Their dynamic contributions over the years
            have been remarkable, and we know they&rsquo;ll make positive impacts as members of
            our limited partnership structure.
          </p>
          <p className={styles.timestamp}>Today, 3:06 AM</p>
        </div>

        <div className={styles.userHitsCard}>
          <span className={[styles.ring, styles.ring1].join(" ")} />
          <span className={[styles.ring, styles.ring2].join(" ")} />
          <span className={[styles.ring, styles.ring3].join(" ")} />
          <span className={styles.userHitsGlyph}>&#9825;</span>
          <div className={styles.userHitsText}>
            <p className={styles.h2Dark}>12 views</p>
            <p className={styles.h4Dark}>Today</p>
          </div>
        </div>

        <div className={styles.newsletterCard}>
          <img src="/dashboard/newsletter-subtract-bg.svg" alt="" className={styles.newsletterBg} />
          <div className={styles.cardHead}>
            <p className={styles.h2White}>Stay up to date</p>
            <span className={styles.iconChipPinkle}>
              <SendIcon />
            </span>
          </div>
          <p className={styles.h3White} style={{ flex: 1 }}>
            The power of 4insite, delivered daily to your inbox.
          </p>
          <button type="button" className={styles.subscribeButton}>
            <PlusIcon className={styles.subscribeIcon} />
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
}
