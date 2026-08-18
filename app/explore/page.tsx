import { loadRoster } from "../../lib/roster";
import { OliviaDashboard } from "../../components/patterns/dashboard/OliviaDashboard";

/** The full prototype — every entry-point option, switchable via
 * PrototypeSwitcher (see OliviaDashboard). app/page.tsx and its
 * siblings are the decided direction (FAB + side panel, no switcher);
 * this tree is where all the other options this project explored
 * still live, for comparison. */
export default async function ExploreHome() {
  const associates = await loadRoster("associates.csv");

  return <OliviaDashboard associates={associates} basePath="/explore" />;
}
