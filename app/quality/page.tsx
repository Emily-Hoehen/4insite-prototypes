import { loadRoster } from "../../lib/roster";
import { OliviaDashboard } from "../../components/patterns/dashboard/OliviaDashboard";

export default async function Quality() {
  const associates = await loadRoster("associates.csv");

  return <OliviaDashboard associates={associates} activePage="quality" fixedVariant="fabPanel" />;
}
