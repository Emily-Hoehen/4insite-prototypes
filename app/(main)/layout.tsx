import { loadRoster } from "../../lib/roster";
import { OliviaDashboard } from "../../components/patterns/dashboard/OliviaDashboard";

/**
 * Shared shell for the decided-direction pages — "/", "/quality", and
 * "/safety" (app/(main)/page.tsx and its siblings; the route group's
 * parens are stripped from the URL, so those paths are unaffected).
 * Mounts OliviaDashboard ONCE here, instead of each page.tsx mounting
 * its own fresh copy — so Olivia's open/closed state and her whole
 * conversation (useOliviaSession, owned inside OliviaPanel) survive
 * navigating between these pages instead of resetting on every click,
 * the same way it always did switching tabs *within* a page. Every
 * page.tsx under this group is just a route marker now (see
 * app/(main)/page.tsx and siblings) — OliviaDashboard renders the
 * actual page content itself, reading which page is active from the
 * URL (see its own `activePage` prop's doc comment) rather than from
 * `children`.
 */
export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const associates = await loadRoster("associates.csv");

  return (
    <>
      <OliviaDashboard associates={associates} fixedVariant="fabPanel" />
      {children}
    </>
  );
}
