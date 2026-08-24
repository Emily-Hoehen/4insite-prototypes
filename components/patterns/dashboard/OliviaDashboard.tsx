"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { RosterPerson } from "../../../lib/csv";
import { Nav } from "../Nav";
import {
  BellIcon,
  BriefcaseIcon,
  ClipboardIcon,
  EnvelopeIcon,
  MoreIcon,
  PinIcon,
  PlusIcon,
  StoreIcon,
} from "../icons";
import { DashboardHeader } from "./DashboardHeader";
import { PeopleSection } from "./PeopleSection";
import { SiteHealthSection } from "./SiteHealthSection";
import { CommsSection } from "./CommsSection";
import { SafetyPageContent } from "./SafetyPageContent";
import { QualityPageContent } from "./QualityPageContent";
import { QualityMegaMenu } from "./QualityMegaMenu";
import { CommunicationCenterFullScreen } from "./CommunicationCenterFullScreen";
import { OliviaPanel } from "./olivia/OliviaPanel";
import type { OliviaOpenRequest, OliviaVariant, ReportFlowVariant } from "./olivia/OliviaPanel";
import { QUALITY_PAGE_SUMMARY, type OliviaTopic, type ServiceAnalysis } from "./olivia/oliviaContent";
import { useOliviaSession } from "./olivia/useOliviaSession";
import { CommunicationCenterPanel } from "./olivia/CommunicationCenterPanel";
import type { CommCenterOpenRequest } from "./olivia/CommunicationCenterPanel";
import { OliviaFab } from "./olivia/OliviaFab";
import { OliviaFabModal } from "./olivia/OliviaFabModal";
import { ALL_OLIVIA_VARIANTS, PrototypeSwitcher } from "./olivia/PrototypeSwitcher";
import styles from "./OliviaDashboard.module.css";

/** The /explore comparison pages' Home, Safety, and Communications are
 * separate Next.js routes (see activePage), each still its own fresh
 * mount of OliviaDashboard — without this, the PrototypeSwitcher's
 * selection would silently reset to the default on every navigation.
 * (The decided-direction pages under app/(main)/ don't hit this at
 * all: fixedVariant is always set there, and every read/write below
 * short-circuits on it — see setOliviaVariant's own early return.)
 * localStorage (not a URL param) keeps this a same-browser "remember
 * my last choice" rather than something meant to be shared via link —
 * this is a dev/review control, not part of the product itself. */
const PROTOTYPE_VARIANT_STORAGE_KEY = "olivia-prototype-variant";

function readStoredVariant(): OliviaVariant | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(PROTOTYPE_VARIANT_STORAGE_KEY);
  return (ALL_OLIVIA_VARIANTS as string[]).includes(stored ?? "") ? (stored as OliviaVariant) : null;
}

/** Same shape as OliviaDashboardProps' own `activePage`, split out so
 * derivePageFromPathname (below) can return it without importing the
 * props type just for this. */
type ActivePage = "home" | "safety" | "communications" | "quality";

/** Maps the current URL to `activePage` when the caller doesn't pass
 * one explicitly — see the prop's own doc comment for which callers
 * that is. Strips `basePath` first so this works the same under
 * /explore as it does at the root. */
function derivePageFromPathname(pathname: string, basePath: string): ActivePage {
  const rest = basePath && pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname;
  if (rest.startsWith("/quality")) return "quality";
  if (rest.startsWith("/safety")) return "safety";
  if (rest.startsWith("/communications")) return "communications";
  return "home";
}

export type OliviaDashboardProps = {
  associates: RosterPerson[];
  /** Which nav destination this is — drives the active nav link, the
   * page content below it, and the topic Olivia opens already scoped
   * to (see `initialTopic` on OliviaPanel). The /explore comparison
   * pages each still pass this explicitly (their own page.tsx per
   * route, a fresh OliviaDashboard mount on every navigation — see
   * PROTOTYPE_VARIANT_STORAGE_KEY's own doc comment). The
   * decided-direction pages ("/", "/quality", "/safety") omit it
   * instead: app/(main)/layout.tsx mounts OliviaDashboard ONCE and
   * keeps it mounted across client-side navigation between them (so
   * Olivia's own open/closed state and conversation survive switching
   * pages), which means there's no one static value for a specific
   * page.tsx to pass — derivePageFromPathname derives the current one
   * from the URL itself on every render instead. */
  activePage?: ActivePage;
  /** Locks `oliviaVariant` to one value and hides PrototypeSwitcher —
   * the decided-direction pages (app/(main)/layout.tsx) pass
   * "fabPanel"; the full comparison pages (app/explore/* ) leave this
   * unset and keep the switcher. Ignores localStorage entirely when
   * set, so a lingering choice from the explore pages can't leak in. */
  fixedVariant?: OliviaVariant;
  /** Every nav href and router.push destination is prefixed with this
   * — "" for the decided-direction pages (root paths), "/explore" for
   * the full comparison pages, so the two route trees stay switcher-
   * free vs. switcher-visible respectively without duplicating Nav's
   * link config in four different page files. */
  basePath?: string;
};

/**
 * Full clone of the Figma "Olivia" front page (fileKey
 * TT3MZh4toWNCeKKzqaJHLD, node 2006:979, "Front Page Desktop"),
 * plus the consolidated Olivia AI panel (see
 * components/patterns/dashboard/olivia/). Renders at the design's
 * native 1440px canvas, centered, with the page scrolling normally
 * and the navbar pinned to the top. Also doubles as the Safety page's
 * and Communications Center's shell (see SafetyPageContent,
 * CommunicationCenterFullScreen) so every destination shares one Nav +
 * Olivia wiring instead of duplicating it.
 */
export function OliviaDashboard({
  associates,
  activePage: activePageProp,
  fixedVariant,
  basePath = "",
}: OliviaDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const activePage = activePageProp ?? derivePageFromPathname(pathname, basePath);
  const homeHref = basePath || "/";
  const withBase = (path: string) => `${basePath}${path}`;
  const withAvatar = associates.filter((p) => p.avatar);
  const clockedIn = withAvatar.slice(0, 17);
  const auditor =
    withAvatar.find((p) => p.name === "Francisco Navarro") ?? withAvatar[17] ?? withAvatar[0];
  const sender = withAvatar[18] ?? withAvatar[1];
  const goodCatchReporter = withAvatar[19] ?? withAvatar[2] ?? withAvatar[0];

  const initialTopic = activePage === "safety" ? "safety" : null;
  const initialPageLabel = activePage === "quality" ? "Quality" : undefined;

  const [isOliviaOpen, setIsOliviaOpen] = useState(false);
  const [openRequest, setOpenRequest] = useState<OliviaOpenRequest | null>(null);
  // "fabPanel" is the only variant with a FAB of its own to worry about
  // — suppressed while OliviaPanel's own mini presenter bar is up (see
  // its onPresenterMinimizedChange), since both are real buttons
  // anchored at the same right:24/bottom:24 spot and would otherwise
  // stack on top of each other.
  const [isPresenterMinimized, setIsPresenterMinimized] = useState(false);
  const oliviaTriggerRef = useRef<HTMLButtonElement | null>(null);
  // Which entry-point pattern renders — see PrototypeSwitcher and the
  // OliviaVariant doc comment (OliviaPanel.tsx) for what each means.
  // Owned here, not by any one panel, so the control for it lives on
  // the page itself. Starts at the same default on every render (server
  // and client) to avoid a hydration mismatch; readStoredVariant's
  // localStorage lookup only happens after mount, in the effect below.
  const [oliviaVariant, setOliviaVariantState] = useState<OliviaVariant>(fixedVariant ?? "panelIcons");

  useEffect(() => {
    // A locked-variant page (fixedVariant set) never reads or writes
    // the shared localStorage choice — it must not drift away from the
    // one variant it exists to show, and switching it there (were the
    // switcher even rendered) shouldn't affect the explore pages either.
    if (fixedVariant) return;
    const stored = readStoredVariant();
    if (stored) setOliviaVariantState(stored);
  }, [fixedVariant]);

  const setOliviaVariant = (next: OliviaVariant) => {
    if (fixedVariant) return;
    setOliviaVariantState(next);
    if (typeof window !== "undefined") window.localStorage.setItem(PROTOTYPE_VARIANT_STORAGE_KEY, next);
  };

  // "Generate a Report" always lands inline in the chat now — the
  // "external" flow (a separate toast + new tab) was only ever reachable
  // via ReportFlowSwitcher, which no longer renders anywhere; OliviaPanel/
  // OliviaFabModal/useOliviaSession all still accept a reportFlowVariant
  // in case that comparison is ever needed again, so this is a plain
  // constant rather than deleting the parameter from every one of them.
  const reportFlowVariant: ReportFlowVariant = "chat";

  // Option 2 (Communications Center) only — Olivia's navbar entry is
  // replaced by the Communication Center's own "Olivia" tab.
  const [isCommCenterOpen, setIsCommCenterOpen] = useState(false);
  const [commCenterRequest, setCommCenterRequest] = useState<CommCenterOpenRequest | null>(null);

  // Option 1's "fab" sub-variant only — its own session instance, since
  // the floating modal isn't a child of OliviaPanel (see OliviaFabModal).
  const [isFabModalOpen, setIsFabModalOpen] = useState(false);
  const fabSession = useOliviaSession(initialTopic, reportFlowVariant, activePage);

  const showNavOliviaAvatar = oliviaVariant === "panelIcons" || oliviaVariant === "panelContext";

  // Quality's instant summary, Option 1 only (see the task this was
  // built for) — true for the rest of THIS page visit until whichever
  // Option 1 entry point is open first clears it, so landing on
  // Quality always re-announces it rather than only ever once per
  // browser. The /explore comparison pages are still a fresh mount per
  // route (see PROTOTYPE_VARIANT_STORAGE_KEY above), so this initial
  // value already covers them; the decided-direction pages now share
  // ONE persistent OliviaDashboard mount across routes (see
  // activePage's own doc comment), so the effect just below re-arms
  // this by hand whenever `activePage` actually changes TO "quality"
  // instead — the same "landing on Quality" moment, just without a
  // remount to fall back on for a fresh initial value.
  const [hasUnseenQualitySummary, setHasUnseenQualitySummary] = useState(activePage === "quality");
  const previousActivePageRef = useRef(activePage);
  useEffect(() => {
    if (activePage === "quality" && previousActivePageRef.current !== "quality") {
      setHasUnseenQualitySummary(true);
    }
    previousActivePageRef.current = activePage;
  }, [activePage]);

  // The zero state's own "Here are your suggestions" ping (see
  // PersonalizedSuggestions/PERSONALIZED_SUGGESTIONS) — unlike
  // hasUnseenQualitySummary, this isn't tied to any one page: it's
  // Olivia flagging she has proactive picks ready, cleared the first
  // time any entry point (nav avatar, FAB) is opened this session, same
  // "seen it" moment as Quality's own flag just clears independently
  // of it.
  const [hasUnseenSuggestions, setHasUnseenSuggestions] = useState(true);

  // Global entry point — the navbar avatar (panelIcons/panelContext
  // only; see showNavOliviaAvatar). No specific card in context, so
  // Olivia opens on her general "Welcome back" greeting — except the
  // Safety page IS a context on its own (see initialTopic above), even
  // though this click itself doesn't carry a topic explicitly. Quality's
  // unseen summary (see hasUnseenQualitySummary) takes priority over
  // both: the first click opens straight to it instead.
  const openOlivia = (event: React.MouseEvent<HTMLButtonElement>) => {
    oliviaTriggerRef.current = event.currentTarget;
    setIsOliviaOpen(true);
    setHasUnseenSuggestions(false);
    if (hasUnseenQualitySummary) {
      setHasUnseenQualitySummary(false);
      setOpenRequest({ kind: "home", requestId: Date.now(), pageSummary: QUALITY_PAGE_SUMMARY });
    } else {
      setOpenRequest({ kind: "home", requestId: Date.now() });
    }
  };

  /** The FAB's click handler — same "unseen summary takes priority"
   * rule as openOlivia, but calls straight into fabSession (this
   * variant owns its session directly; see the comment above it)
   * instead of going through an openRequest. */
  const toggleFabModal = () => {
    const opening = !isFabModalOpen;
    setIsFabModalOpen(opening);
    if (opening) setHasUnseenSuggestions(false);
    if (opening && hasUnseenQualitySummary) {
      setHasUnseenQualitySummary(false);
      fabSession.showPageSummary(QUALITY_PAGE_SUMMARY, "qualitySummary");
    }
  };

  const closeOlivia = () => {
    setIsOliviaOpen(false);
    oliviaTriggerRef.current?.focus();
  };

  /** "fabPanel"'s FAB click handler — opens the real side panel
   * (OliviaPanel, "panelIcons" styled) instead of the small floating
   * modal "fab" opens; same "unseen summary takes priority" rule as
   * openOlivia (the nav-avatar equivalent for panelIcons/panelContext),
   * just without a MouseEvent to capture focus-return from. */
  const openOliviaViaFab = () => {
    setIsOliviaOpen(true);
    setHasUnseenSuggestions(false);
    if (hasUnseenQualitySummary) {
      setHasUnseenQualitySummary(false);
      setOpenRequest({ kind: "home", requestId: Date.now(), pageSummary: QUALITY_PAGE_SUMMARY });
    } else {
      setOpenRequest({ kind: "home", requestId: Date.now() });
    }
  };

  /** Contextual entry point — "Open Olivia" from a trigger's popover.
   * Option 3 (Embedded Triggers) only; see the onAskOlivia/onAskQuestion
   * props below, gated to that variant. */
  const askOliviaAbout = (topic: OliviaTopic) => {
    setIsOliviaOpen(true);
    setOpenRequest({ kind: "topic", topic, requestId: Date.now() });
  };

  /** A trigger's popover question — opens Olivia and asks it immediately. */
  const askOliviaQuestion = (topic: OliviaTopic, questionText: string) => {
    setIsOliviaOpen(true);
    setOpenRequest({ kind: "topic", topic, requestId: Date.now(), questionText });
  };

  const openCommCenter = () => {
    setCommCenterRequest({ requestId: Date.now(), tab: "messages" });
    setIsCommCenterOpen(true);
  };

  /** ServiceHistoryModal's own Olivia FAB — reuses whichever entry
   * point this page's active variant already uses instead of
   * inventing a fourth: the FAB modal's own toggle for "fab", the
   * Communication Center for "commsCenter" (no persistent Olivia
   * surface otherwise), and the real side panel — same as the navbar
   * avatar/FAB use — for everything else, including "embeddedTriggers"
   * (no persistent entry of its own either, but the panel itself still
   * renders). */
  const openOliviaFromOverlay =
    oliviaVariant === "fab" ? toggleFabModal : oliviaVariant === "commsCenter" ? openCommCenter : openOliviaViaFab;

  /** Whether opening Olivia from on top of ServiceHistoryModal means
   * the real docked side panel (OliviaPanel, a flex sibling of the
   * page that pushes it rather than overlaying it — see appShell's own
   * doc comment) — true for every variant except "fab" (a small
   * `position: fixed` modal floating near its own FAB) and
   * "commsCenter" (the Communication Center panel, also `position:
   * fixed`) — neither of those pushes layout, so there's no page-edge
   * space to dock the overlay itself beside. Only for THIS pair does
   * ServiceHistoryModal narrow itself to share the screen with her
   * instead of closing when she opens (see its own `oliviaDocksBeside`
   * prop). */
  const oliviaDocksBeside = oliviaVariant !== "fab" && oliviaVariant !== "commsCenter";

  /** ServiceHistoryModal's own "click a service" trigger — same
   * per-variant branching as openOliviaFromOverlay, except "fab" needs
   * its own branch here rather than reusing toggleFabModal directly:
   * that own function's session access (fabSession) is exactly what
   * this also needs, to actually post the analysis into her
   * conversation rather than just opening an empty one. "commsCenter"
   * has no session reachable from here at all (CommunicationCenterPanel
   * owns its own, opaque to this component) — opens the Communication
   * Center same as the plain open would, without an analysis message;
   * a real gap, but only for a variant this prototype uses to compare
   * entry points, not the shipped one. */
  const analyzeServiceFromOverlay = (analysis: ServiceAnalysis) => {
    if (oliviaVariant === "fab") {
      setIsFabModalOpen(true);
      fabSession.showServiceAnalysis(analysis);
      return;
    }
    if (oliviaVariant === "commsCenter") {
      openCommCenter();
      return;
    }
    setIsOliviaOpen(true);
    setOpenRequest({ kind: "home", requestId: Date.now(), serviceAnalysis: analysis });
  };

  /** The Communication Center's Recent Chats handing off to the real
   * side panel — closes the comms center and opens OliviaPanel (forced
   * to "panelIcons" below) with the given request instead of embedding
   * a conversation inline. Shared by the compact panel and the
   * full-screen "View All" destination. */
  const openChatSidePanel = (request: OliviaOpenRequest) => {
    setIsCommCenterOpen(false);
    setIsOliviaOpen(true);
    setOpenRequest(request);
  };

  return (
    <>
      {/* .appShell is a flex row of [pageColumn, OliviaPanel] — the
          panel is a real layout sibling now, not a `position: fixed`
          overlay, so opening it actually pushes pageColumn (Nav
          included) into less width rather than floating on top of it.
          See OliviaPanel.module.css's .panelSlot doc comment. */}
      <div className={styles.appShell}>
        <div className={styles.pageColumn}>
          {/* Nav sits directly in pageColumn (not inside .pageScroll
              below), so it compresses with the available width instead
              of scrolling out of view along with the wider, fixed-
              1440px page canvas beneath it — Nav's own layout is
              already fluid (see Nav.module.css), unlike .page. */}
          <Nav
            theme="dark"
            className={styles.stickyNav}
            logoHref="#"
            orgLabel="SBM"
            orgIcon={<BriefcaseIcon />}
            siteLabel="Delta"
            siteSubLabel="Detroit, MI (DTW)"
            siteIcon={<PinIcon />}
            links={[
              { label: "Home", href: homeHref, active: activePage === "home" },
              {
                label: "Quality",
                href: withBase("/quality"),
                active: activePage === "quality",
                megaMenu: <QualityMegaMenu basePath={basePath} />,
              },
              { label: "People", href: "#" },
              { label: "Safety", href: withBase("/safety"), active: activePage === "safety" },
              { label: "Financials", href: "#" },
            ]}
            showOlivia={showNavOliviaAvatar}
            onOliviaClick={showNavOliviaAvatar ? openOlivia : undefined}
            oliviaImageSrc={showNavOliviaAvatar ? "/dashboard/Olivia Avatar.png" : undefined}
            oliviaHasNotification={showNavOliviaAvatar && (hasUnseenQualitySummary || hasUnseenSuggestions)}
            utilityItems={[
              { icon: <StoreIcon />, label: "Store" },
              { icon: <PlusIcon />, label: "Quick entries" },
              { icon: <ClipboardIcon />, label: "Reports" },
              {
                icon: <EnvelopeIcon />,
                label: "Messages",
                // Communications Center only — every other variant leaves
                // this inert, same as before that category existed.
                onClick: oliviaVariant === "commsCenter" ? openCommCenter : undefined,
              },
              { icon: <BellIcon />, label: "Notifications", hasNotification: true },
            ]}
            avatarFallback="EH"
            avatarAlt="Emily Hoehenrieder"
            menuIcon={<MoreIcon />}
          />

          {/* Scopes horizontal scrolling to just the fixed-1440px page
              canvas — see the .appShell doc comment above; Nav, outside
              this, never needs to scroll horizontally itself. */}
          <div className={styles.pageScroll}>
            <div className={styles.page}>
              {activePage === "safety" ? (
                <div className={styles.safetyPagePad}>
                  {!fixedVariant && <PrototypeSwitcher variant={oliviaVariant} onChange={setOliviaVariant} />}
                  <SafetyPageContent reporter={goodCatchReporter} />
                </div>
              ) : activePage === "communications" ? (
                <div className={styles.safetyPagePad}>
                  {!fixedVariant && <PrototypeSwitcher variant={oliviaVariant} onChange={setOliviaVariant} />}
                  <CommunicationCenterFullScreen
                    people={withAvatar}
                    onOpenNewChat={() => openChatSidePanel({ kind: "home", requestId: Date.now() })}
                    onResumeChat={(topic, question, reply) =>
                      openChatSidePanel({ kind: "topic", topic, requestId: Date.now(), questionText: question, resumeReply: reply })
                    }
                  />
                </div>
              ) : activePage === "quality" ? (
                <div className={styles.safetyPagePad}>
                  <QualityPageContent
                    people={withAvatar}
                    variant={fixedVariant ? undefined : oliviaVariant}
                    onVariantChange={fixedVariant ? undefined : setOliviaVariant}
                    onOpenOlivia={openOliviaFromOverlay}
                    onAnalyzeService={analyzeServiceFromOverlay}
                    isOliviaSidePanelOpen={oliviaDocksBeside && isOliviaOpen}
                    oliviaDocksBeside={oliviaDocksBeside}
                  />
                </div>
              ) : (
                <>
                  <DashboardHeader siteName="Detroit, MI (DTW)" greeting="Good morning, it’s Friday, May 5" />

                  {!fixedVariant && <PrototypeSwitcher variant={oliviaVariant} onChange={setOliviaVariant} />}

                  <div className={styles.stack}>
                    <PeopleSection clockedIn={clockedIn} />
                    <SiteHealthSection
                      auditor={auditor}
                      // Option 3 (Embedded Triggers) only — every other
                      // variant reaches Olivia some other persistent way, so
                      // these contextual sparkle triggers stay hidden there.
                      onAskOlivia={oliviaVariant === "embeddedTriggers" ? askOliviaAbout : undefined}
                      onAskQuestion={oliviaVariant === "embeddedTriggers" ? askOliviaQuestion : undefined}
                    />
                    <CommsSection sender={sender} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {oliviaVariant !== "fab" && (
          // Renders for panelIcons, panelContext, fabPanel, commsCenter (as
          // the Recent Chats hand-off target), and embeddedTriggers (as the
          // triggers' own destination) — only "panelContext" gets its own
          // header treatment; everything else uses "panelIcons". A flex
          // sibling of pageColumn (see .appShell above), so it pushes
          // pageColumn instead of overlaying it.
          <OliviaPanel
            isOpen={isOliviaOpen}
            onClose={closeOlivia}
            onRequestOpen={() => setIsOliviaOpen(true)}
            openRequest={openRequest}
            variant={oliviaVariant === "panelContext" ? "panelContext" : "panelIcons"}
            reportFlowVariant={reportFlowVariant}
            initialTopic={initialTopic}
            initialPageLabel={initialPageLabel}
            activePage={activePage}
            onPresenterMinimizedChange={setIsPresenterMinimized}
          />
        )}
      </div>

      {oliviaVariant === "commsCenter" && (
        <CommunicationCenterPanel
          isOpen={isCommCenterOpen}
          onClose={() => setIsCommCenterOpen(false)}
          openRequest={commCenterRequest}
          people={withAvatar}
          onViewAll={() => {
            setIsCommCenterOpen(false);
            router.push(withBase("/communications"));
          }}
          onOpenNewChat={() => openChatSidePanel({ kind: "home", requestId: Date.now() })}
          onResumeChat={(topic, question, reply) =>
            openChatSidePanel({ kind: "topic", topic, requestId: Date.now(), questionText: question, resumeReply: reply })
          }
        />
      )}

      {oliviaVariant === "fab" && (
        <>
          <OliviaFab
            onClick={toggleFabModal}
            isOpen={isFabModalOpen}
            hasNotification={hasUnseenQualitySummary || hasUnseenSuggestions}
          />
          <OliviaFabModal
            isOpen={isFabModalOpen}
            onClose={() => setIsFabModalOpen(false)}
            onRequestOpen={() => setIsFabModalOpen(true)}
            session={fabSession}
            reportFlowVariant={reportFlowVariant}
          />
        </>
      )}

      {/* "fabPanel" gets both: the FAB as its trigger, and the same real
          side panel every other variant here uses — it's the decided
          direction (FAB entry + the full "panelIcons" panel), not a
          third panel design of its own. Suppressed while the mini
          presenter bar is up (see isPresenterMinimized) — it already
          offers its own way back into the panel, at this exact spot. */}
      {oliviaVariant === "fabPanel" && !isOliviaOpen && !isPresenterMinimized && (
        <OliviaFab
          onClick={openOliviaViaFab}
          isOpen={isOliviaOpen}
          hasNotification={hasUnseenQualitySummary || hasUnseenSuggestions}
        />
      )}
    </>
  );
}
