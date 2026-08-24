"use client";

import { MouseEvent, ReactNode } from "react";
import Link from "next/link";
import styles from "./Nav.module.css";

/**
 * Nav — DS2 | Web Core "Navbar" component
 * Source: Figma fileKey 5lX9s52cSgMPq0IlkgIYIC, node 468:1071.
 * Pulled from the Dark/Light "Size=Full Width (1440)" variants.
 *
 * Figma's utility icons (Clock, Quick Entries, Clipboard,
 * Messages, Notifications, overflow menu) are Font Awesome
 * glyphs this project doesn't have a license for, so they're
 * exposed as slots — pass your own icon elements rather than
 * the component guessing at a substitute icon set. Same for the
 * org/site picker glyphs and the "more options" menu icon.
 *
 * The page-link Hover/Active states aren't defined anywhere in
 * the Figma file (the "Navbar / List Item" instances carry no
 * state variants) — the hover/active colors here extrapolate
 * from the same accent-shift pattern DS2 uses elsewhere (Button,
 * Text Link), not invented from scratch, but flagging that they
 * weren't pulled directly like everything else in this file.
 */

export type NavTheme = "dark" | "light";

export type NavLink = {
  label: string;
  href: string;
  active?: boolean;
  /** A hover-triggered dropdown of the link's own sub-sections (e.g.
   * Quality's Scope of Work, Audits, Verifications, ...) — CSS-only
   * (:hover on the <li>, not JS state), so this stays a "hover to
   * reveal" panel rather than a click-to-toggle menu. Nothing renders
   * if omitted — existing callers are unaffected. */
  megaMenu?: ReactNode;
};

export type NavUtilityItem = {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  hasNotification?: boolean;
};

export type NavProps = {
  theme?: NavTheme;
  logoHref?: string;

  /** Org/business-unit picker, e.g. "SBM". */
  orgLabel?: string;
  orgIcon?: ReactNode;
  onOrgClick?: () => void;

  /** Site picker, e.g. "Delta" / "LaGuardia, NY". */
  siteLabel?: string;
  siteSubLabel?: string;
  siteIcon?: ReactNode;
  onSiteClick?: () => void;

  links?: NavLink[];

  /** Olivia, 4Insite's AI assistant — gradient orb is DS2's identity for
   * her regardless of image. Defaults to shown (the orb still renders
   * even with no image/click handler) — set `showOlivia={false}` for
   * callers where Olivia has no navbar presence at all (a FAB, the
   * Communication Center, embedded-only triggers), rather than relying
   * on both other props being unset. */
  oliviaImageSrc?: string;
  onOliviaClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  showOlivia?: boolean;
  /** A proactive, unread thing Olivia has ready (e.g. an instant page
   * summary) — a purple dot plus a brief pulse ring, distinct from the
   * Bell's red notificationDot so it reads as "Olivia has something for
   * you" rather than an alert. */
  oliviaHasNotification?: boolean;
  /** When set (>0), the dot above becomes a numbered badge instead —
   * e.g. how many personalized suggestions are waiting in Olivia's zero
   * state (see PERSONALIZED_SUGGESTIONS). Still gated on
   * `oliviaHasNotification` for the pulse ring/aria-label; this only
   * decides dot vs. count once that's true. */
  oliviaNotificationCount?: number;

  utilityItems?: NavUtilityItem[];

  avatarSrc?: string;
  avatarAlt?: string;
  /** Shown when `avatarSrc` isn't provided — e.g. initials. */
  avatarFallback?: ReactNode;
  onAvatarClick?: () => void;

  menuIcon?: ReactNode;
  onMenuClick?: () => void;

  className?: string;
};

export function Nav({
  theme = "dark",
  logoHref = "/",
  orgLabel,
  orgIcon,
  onOrgClick,
  siteLabel,
  siteSubLabel,
  siteIcon,
  onSiteClick,
  links = [],
  oliviaImageSrc,
  onOliviaClick,
  showOlivia = true,
  oliviaHasNotification = false,
  oliviaNotificationCount,
  utilityItems = [],
  avatarSrc,
  avatarAlt = "Account",
  avatarFallback,
  onAvatarClick,
  menuIcon,
  onMenuClick,
  className,
}: NavProps) {
  const logoSrc =
    theme === "dark" ? "/brand/4insite-logo-dark.svg" : "/brand/4insite-logo-light.svg";

  return (
    <nav className={[styles.nav, className].filter(Boolean).join(" ")} data-theme={theme}>
      {/* The bar itself (background) spans whatever width .nav is given;
          this inner wrapper keeps the actual content on the design's
          1440px canvas and centered, same as the rest of the page,
          however wide the viewport actually is. */}
      <div className={styles.navInner}>
        <div className={styles.left}>
          <a href={logoHref} aria-label="4Insite home">
            <img src={logoSrc} alt="4Insite" className={styles.logo} width={32} height={32} />
          </a>

          {orgLabel && (
            <button type="button" className={styles.picker} onClick={onOrgClick}>
              {orgIcon && <span className={styles.pickerIcon}>{orgIcon}</span>}
              <span>{orgLabel}</span>
            </button>
          )}

          {siteLabel && (
            <button type="button" className={styles.picker} onClick={onSiteClick}>
              {siteIcon && <span className={styles.pickerIcon}>{siteIcon}</span>}
              <span>{siteLabel}</span>
              {siteSubLabel && (
                <>
                  <span className={styles.pickerDivider} />
                  <span>{siteSubLabel}</span>
                </>
              )}
            </button>
          )}
        </div>

        {links.length > 0 && (
          <ul className={styles.links}>
            {links.map((link) => (
              <li
                key={link.href}
                className={[
                  styles.linkItem,
                  link.megaMenu && link.label && link.label.toLowerCase() === "quality"
                    ? styles.hasMega
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <Link
                  href={link.href}
                  className={[styles.link, link.active ? styles.linkActive : ""]
                    .filter(Boolean)
                    .join(" ")}
                  aria-current={link.active ? "page" : undefined}
                >
                  {link.label}
                </Link>
                {link.megaMenu && <div className={styles.megaMenu}>{link.megaMenu}</div>}
              </li>
            ))}
          </ul>
        )}

        <div className={styles.right}>
          {/* The divider used to sit before Olivia; now it sits after her
              instead, still marking the boundary between her and the
              utility icons — when she's hidden entirely (showOlivia=false)
              it stays in its original spot as a plain separator. */}
          {showOlivia ? (
            <>
              {onOliviaClick !== undefined || oliviaImageSrc ? (
                <span
                  className={[styles.oliviaWrap, oliviaHasNotification ? styles.oliviaPulse : ""]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <button
                    type="button"
                    className={styles.olivia}
                    onClick={onOliviaClick}
                    aria-label={
                      oliviaHasNotification
                        ? oliviaNotificationCount
                          ? `Ask Olivia — ${oliviaNotificationCount} new suggestions ready`
                          : "Ask Olivia — new summary ready"
                        : "Ask Olivia"
                    }
                  >
                    {oliviaImageSrc && (
                      <img src={oliviaImageSrc} alt="" className={styles.oliviaImage} />
                    )}
                  </button>
                  {oliviaHasNotification &&
                    (oliviaNotificationCount ? (
                      <span className={styles.oliviaNotificationBadge} aria-hidden="true">
                        {oliviaNotificationCount}
                      </span>
                    ) : (
                      <span className={styles.oliviaNotificationDot} aria-hidden="true" />
                    ))}
                </span>
              ) : (
                <div className={styles.olivia} aria-hidden="true" />
              )}
              <span className={styles.divider} />
            </>
          ) : (
            <span className={styles.divider} />
          )}

          {utilityItems.map((item, i) =>
            item.hasNotification ? (
              <button
                key={i}
                type="button"
                className={styles.notification}
                onClick={item.onClick}
                aria-label={item.label}
              >
                <span className={styles.iconButton}>{item.icon}</span>
                <span className={styles.notificationDot} />
              </button>
            ) : (
              <button
                key={i}
                type="button"
                className={styles.iconButton}
                onClick={item.onClick}
                aria-label={item.label}
              >
                {item.icon}
              </button>
            )
          )}

          <span className={styles.divider} />

          {avatarSrc ? (
            <button type="button" onClick={onAvatarClick} aria-label={avatarAlt}>
              <img src={avatarSrc} alt={avatarAlt} className={styles.avatar} />
            </button>
          ) : (
            <button
              type="button"
              className={styles.avatarFallback}
              onClick={onAvatarClick}
              aria-label={avatarAlt}
            >
              {avatarFallback}
            </button>
          )}

          <button
            type="button"
            className={styles.menuButton}
            onClick={onMenuClick}
            aria-label="More options"
          >
            {menuIcon}
          </button>
        </div>
      </div>
    </nav>
  );
}
