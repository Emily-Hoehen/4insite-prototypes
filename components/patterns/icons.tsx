/**
 * Icon set for the whole app, backed by the project's Font Awesome
 * Pro Kit (95881adc33) — see `.font-awesome.md` at the repo root for
 * the full integration record. The Kit is loaded as Web Fonts + CSS
 * (`app/layout.tsx`), not the SVG+JS auto-replacer, so a plain
 * `<i className="fa-solid fa-...">` is all any of these need — no
 * DOM mutation outside React's control.
 *
 * Every export below keeps the same name and `{ className }` prop
 * shape this file always had, so no caller changed when this
 * migrated off hand-drawn SVGs (see git history for that version).
 * Callers that need a specific pixel size still do it the same way
 * they always did — sizing a parent/wrapper — except the sized
 * property is `font-size` now, not `width`/`height`.
 */

type IconProps = { className?: string };

function fa(style: "solid" | "regular", name: string, className?: string) {
  return <i className={["fa-" + style, "fa-" + name, className].filter(Boolean).join(" ")} aria-hidden="true" />;
}

export function SearchIcon({ className }: IconProps) {
  return fa("solid", "magnifying-glass", className);
}

export function PlusIcon({ className }: IconProps) {
  return fa("solid", "plus", className);
}

export function ClockIcon({ className }: IconProps) {
  return fa("solid", "clock", className);
}

export function ClipboardIcon({ className }: IconProps) {
  return fa("solid", "clipboard-list", className);
}

export function EnvelopeIcon({ className }: IconProps) {
  return fa("solid", "envelope", className);
}

export function BellIcon({ className }: IconProps) {
  return fa("solid", "bell", className);
}

export function MoreIcon({ className }: IconProps) {
  return fa("solid", "ellipsis-vertical", className);
}

export function BriefcaseIcon({ className }: IconProps) {
  return fa("solid", "briefcase", className);
}

export function PinIcon({ className }: IconProps) {
  return fa("solid", "location-dot", className);
}

export function StoreIcon({ className }: IconProps) {
  return fa("solid", "store", className);
}

export function PersonIcon({ className }: IconProps) {
  return fa("solid", "user", className);
}

export function ChartBarIcon({ className }: IconProps) {
  return fa("solid", "chart-simple", className);
}

export function UserGroupIcon({ className }: IconProps) {
  return fa("solid", "users", className);
}

export function FrownIcon({ className }: IconProps) {
  return fa("solid", "face-frown", className);
}

export function ArrowUpIcon({ className }: IconProps) {
  return fa("solid", "arrow-up", className);
}

export function ArrowDownIcon({ className }: IconProps) {
  return fa("solid", "arrow-down", className);
}

export function ArrowLeftIcon({ className }: IconProps) {
  return fa("solid", "arrow-left", className);
}

/** "Reset conversation" — per Figma's "rotate-left-solid-full" glyph
 * (node 2082:484/2085:484), used in the side panel/FAB headers. */
export function RotateLeftIcon({ className }: IconProps) {
  return fa("solid", "rotate-left", className);
}

export function ChevronRightIcon({ className }: IconProps) {
  return fa("solid", "chevron-right", className);
}

export function ChevronLeftIcon({ className }: IconProps) {
  return fa("solid", "chevron-left", className);
}

export function ChevronDownIcon({ className }: IconProps) {
  return fa("solid", "chevron-down", className);
}

/** "This page" scope. Confirmed against Figma's own export (node 2038:188,
 * whose ligature failed to render and fell back to literal glyph text). */
export function PageIcon({ className }: IconProps) {
  return fa("solid", "table-layout", className);
}

/** "Entire site" scope. */
export function GlobeIcon({ className }: IconProps) {
  return fa("solid", "globe", className);
}

export function CheckCircleIcon({ className }: IconProps) {
  return fa("solid", "circle-check", className);
}

export function InfoCircleIcon({ className }: IconProps) {
  return fa("solid", "circle-info", className);
}

export function ExternalLinkIcon({ className }: IconProps) {
  return fa("solid", "arrow-up-right-from-square", className);
}

export function SyncIcon({ className }: IconProps) {
  return fa("solid", "sync", className);
}

export function ThumbsUpIcon({ className }: IconProps) {
  return fa("solid", "thumbs-up", className);
}

export function ThumbsDownIcon({ className }: IconProps) {
  return fa("solid", "thumbs-down", className);
}

export function CalendarIcon({ className }: IconProps) {
  return fa("solid", "calendar", className);
}

export function NewspaperIcon({ className }: IconProps) {
  return fa("solid", "newspaper", className);
}

export function SendIcon({ className }: IconProps) {
  return fa("solid", "paper-plane", className);
}

export function CloseIcon({ className }: IconProps) {
  return fa("solid", "xmark", className);
}

export function ChatIcon({ className }: IconProps) {
  return fa("solid", "comment", className);
}

export function PlayCircleIcon({ className }: IconProps) {
  return fa("solid", "circle-play", className);
}

export function PauseIcon({ className }: IconProps) {
  return fa("solid", "pause", className);
}

export function StopIcon({ className }: IconProps) {
  return fa("solid", "stop", className);
}

export function DocumentIcon({ className }: IconProps) {
  return fa("solid", "file-lines", className);
}

export function DownloadIcon({ className }: IconProps) {
  return fa("solid", "download", className);
}

export function CopyIcon({ className }: IconProps) {
  return fa("solid", "copy", className);
}

export function GridIcon({ className }: IconProps) {
  return fa("solid", "table-cells", className);
}

export function SparkleIcon({ className }: IconProps) {
  return fa("solid", "sparkles", className);
}

export function SendArrowIcon({ className }: IconProps) {
  return fa("solid", "arrow-up", className);
}

/** Composer send button — Figma's own export names this glyph "microphone". */
export function MicrophoneIcon({ className }: IconProps) {
  return fa("solid", "microphone", className);
}

/** Composer "Tools" trigger — confirmed against Figma's own export (node
 * 2059:110/"Work Orders", whose ligature fell back to literal text "wrench"). */
export function WrenchIcon({ className }: IconProps) {
  return fa("solid", "wrench", className);
}

export function StarIcon({ className, filled = true }: IconProps & { filled?: boolean }) {
  return fa(filled ? "solid" : "regular", "star", className);
}

/** Presentation Mode — confirmed against Figma's own component name (node 2038:226/"Bullhorn"). */
export function BullhornIcon({ className }: IconProps) {
  return fa("solid", "bullhorn", className);
}

/** Reports — a generic document glyph (Figma's own zero-state export,
 * node 2196:15001's "file-lines-solid-full"), not the literal PDF
 * icon this used to be — the report itself is mobile-ready HTML, not
 * necessarily a PDF, so "a page of lines" reads more accurately than
 * a format-specific file-type icon. Kept the component name (still
 * "Reports" everywhere it's used) rather than a rename that would
 * touch every call site for a glyph swap. */
export function PdfIcon({ className }: IconProps) {
  return fa("solid", "file-lines", className);
}

export function FilePdfIcon({ className }: IconProps) {
  return fa("solid", "file-pdf", className);
}

/** Live Dashboard — a trend/analytics glyph per design direction. */
export function FinancialsIcon({ className }: IconProps) {
  return fa("solid", "chart-line", className);
}

/** Audit topic — confirmed against Figma's own export (node 2038:191's
 * ligature fell back to literal glyph text: "clipboard-check"). */
export function ClipboardCheckIcon({ className }: IconProps) {
  return fa("solid", "clipboard-check", className);
}

/** Zero state's "Summarize page view" suggested prompt (Figma node 2187:12076). */
export function ListIcon({ className }: IconProps) {
  return fa("solid", "list", className);
}

/** Zero state's "Tell me about the last safety recordable." suggested prompt (Figma node 2188:12085). */
export function GearIcon({ className }: IconProps) {
  return fa("solid", "gear", className);
}

/** "Spot Clean" activity type, Quality page's Recent Activity feed. */
export function SprayCanIcon({ className }: IconProps) {
  return fa("solid", "spray-can-sparkles", className);
}

/** "Full Service" activity type, Quality page's Recent Activity feed. */
export function HandSparklesIcon({ className }: IconProps) {
  return fa("solid", "hand-sparkles", className);
}

/** "On-Time Departure Services", Olivia's Quality summary cards. */
export function PlaneDepartureIcon({ className }: IconProps) {
  return fa("solid", "plane-departure", className);
}

/** Complaint topic — a speech-bubble-with-exclamation glyph, per Figma
 * node 2119:1942 ("Ask about your site performance"). */
export function CommentExclamationIcon({ className }: IconProps) {
  return fa("solid", "comment-exclamation", className);
}

/** Audit topic (framed as "incidents" in the zero-state prompts) — a
 * medical-bag glyph, per Figma node 2119:1942. */
export function BriefcaseMedicalIcon({ className }: IconProps) {
  return fa("solid", "briefcase-medical", className);
}

/** Outputs pill, "panelContext"'s composer — Figma node 2119:1922. */
export function FileChartIcon({ className }: IconProps) {
  return fa("solid", "file-chart-column", className);
}
