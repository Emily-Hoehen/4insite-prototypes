import styles from "./OliviaAvatar.module.css";

/**
 * Olivia's real photo identity — one component so the header (36px),
 * the home-greeting hero (108px), and the presenter speaker (28px)
 * all render the exact same composited layers instead of three
 * hand-tuned copies. Per Figma node 2038:101/2038:106: a circular
 * radial-gradient base, the real headshot (public/olivia/olivia-photo.png,
 * exported from Figma) cropped/positioned with the design's own
 * percentages — which is why this scales cleanly to any `size` — and
 * a purple "skrim" gradient over the bottom so the photo blends into
 * the gradient instead of sitting on it as a hard-edged rectangle.
 *
 * Figma also layers two blurred color ellipses (blue/coral) behind
 * the photo for ambient rim light. They're fully obscured by the
 * photo + skrim in the actual rendered design (confirmed against the
 * reference screenshot) at this component's sizes, so they're
 * omitted here rather than reproduced for an invisible effect.
 */
export function OliviaAvatar({
  size = 36,
  alt = "",
  className,
}: {
  size?: number;
  alt?: string;
  className?: string;
}) {
  return (
    <span
      className={[styles.avatar, className].filter(Boolean).join(" ")}
      style={{ width: size, height: size }}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    >
      <span className={styles.photoClip}>
        <img src="/olivia/olivia-photo.png" alt="" className={styles.photo} />
      </span>
      <span className={styles.skrim} aria-hidden="true" />
    </span>
  );
}
