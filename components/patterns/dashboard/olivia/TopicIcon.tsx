import { BriefcaseMedicalIcon, CommentExclamationIcon, PersonIcon } from "../../icons";
import type { OliviaTopic } from "./oliviaContent";

/** Consistent glyph per topic, reused across both greeting screens.
 * Per Figma node 2119:1942 — safety/complaint/audit previously used
 * mismatched glyphs (a checkmark, a frown, a clipboard) that didn't
 * read as a consistent family; these three do. */
export function TopicIcon({ topic }: { topic: OliviaTopic }) {
  switch (topic) {
    case "safety":
      return <PersonIcon />;
    case "complaint":
      return <CommentExclamationIcon />;
    case "audit":
      return <BriefcaseMedicalIcon />;
  }
}
