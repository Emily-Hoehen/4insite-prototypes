import { loadRoster } from "../lib/roster";
import { OliviaDashboard } from "../components/patterns/dashboard/OliviaDashboard";

/** The decided direction: Olivia's side panel (Output Icons header
 * treatment) opened from a floating action button, with no switcher
 * to pick anything else — see fixedVariant on OliviaDashboard. The
 * full comparison of every option this project explored still lives
 * at /explore, unchanged. */
export default async function Home() {
  const associates = await loadRoster("associates.csv");

  return <OliviaDashboard associates={associates} fixedVariant="fabPanel" />;
}
