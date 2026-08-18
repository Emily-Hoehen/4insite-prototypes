import { readFile } from "fs/promises";
import path from "path";
import { parseCsv, toRosterPeople } from "./csv";

/** Shared by every route under app/ — both the decided-direction pages
 * (app/page.tsx and its siblings) and the full-comparison pages
 * (app/explore/*) load the same roster data, just render OliviaDashboard
 * with different props. */
export async function loadRoster(fileName: string) {
  const filePath = path.join(process.cwd(), "data", fileName);
  const text = await readFile(filePath, "utf-8");
  return toRosterPeople(parseCsv(text));
}
