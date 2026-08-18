"use client";

import type { OliviaVariant } from "./OliviaPanel";
import styles from "./PrototypeSwitcher.module.css";

type Category = {
  id: string;
  label: string;
  variants: OliviaVariant[];
};

/** Three ways to compare Olivia's entry points, each a distinct
 * philosophy rather than a visual tweak — see the doc comment on
 * OliviaVariant (OliviaPanel.tsx) for what each one means. Option 1
 * bundles three sub-variants (all "always reachable the same way,
 * everywhere"); Options 2 and 3 are single implementations, so they
 * render as a plain button with no sub-row. */
const CATEGORIES: Category[] = [
  {
    id: "global",
    label: "Option 1: Global Persistent Entry",
    variants: ["panelIcons", "panelContext", "fab", "fabPanel"],
  },
  { id: "commsCenter", label: "Option 2: Communications Center", variants: ["commsCenter"] },
  { id: "embeddedTriggers", label: "Option 3: Embedded Triggers", variants: ["embeddedTriggers"] },
];

const VARIANT_LABEL: Record<OliviaVariant, string> = {
  panelIcons: "Side Panel - output icons",
  panelContext: "Side Panel - Context Tag",
  fab: "FAB + Modal Chat",
  fabPanel: "FAB + Side Panel",
  commsCenter: "Communications Center",
  embeddedTriggers: "Embedded Triggers",
};

/** Every valid variant, flattened out of CATEGORIES — one source of
 * truth so OliviaDashboard's localStorage persistence can validate a
 * stored value without duplicating this list. */
export const ALL_OLIVIA_VARIANTS: OliviaVariant[] = CATEGORIES.flatMap((c) => c.variants);

/**
 * Dev/review control, not part of any Figma design — lets whoever's
 * looking at this compare every entry-point pattern built here
 * without maintaining separate builds. Two rows: which category
 * (Option 1/2/3), and — only for Option 1, which has more than one
 * implementation — which of its sub-variants. Lives on the dashboard
 * page itself rather than inside any one panel, since it's a property
 * of the whole prototype. OliviaDashboard owns the `variant` state and
 * routes every entry point (nav avatar, FAB, card triggers, comms
 * center envelope) based on it.
 */
export function PrototypeSwitcher({
  variant,
  onChange,
}: {
  variant: OliviaVariant;
  onChange: (variant: OliviaVariant) => void;
}) {
  const activeCategory = CATEGORIES.find((c) => c.variants.includes(variant)) ?? CATEGORIES[0];

  return (
    <div className={styles.switcher}>
      <div className={styles.row}>
        <p className={styles.label}>Prototype</p>
        <div className={styles.group} role="radiogroup" aria-label="Olivia entry-point category">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              role="radio"
              aria-checked={category.id === activeCategory.id}
              className={[styles.option, category.id === activeCategory.id ? styles.optionActive : ""].join(" ")}
              onClick={() => onChange(category.variants[0])}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {activeCategory.variants.length > 1 && (
        <div className={styles.row}>
          <p className={styles.label}>Variant</p>
          <div className={styles.group} role="radiogroup" aria-label="Global Persistent Entry variant">
            {activeCategory.variants.map((v) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={variant === v}
                className={[styles.option, variant === v ? styles.optionActive : ""].join(" ")}
                onClick={() => onChange(v)}
              >
                {VARIANT_LABEL[v]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
