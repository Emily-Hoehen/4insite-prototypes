import { readFile } from "fs/promises";
import path from "path";
import { parseCsv, toRosterPeople } from "./csv";

/** Shared by every route under app/ — both the decided-direction pages
 * (loaded once in app/(main)/layout.tsx) and the full-comparison pages
 * (app/explore/*, loaded per page.tsx) load the same roster data, just
 * render OliviaDashboard with different props. */
export async function loadRoster(fileName: string) {
  const filePath = path.join(process.cwd(), "data", fileName);
  const text = await readFile(filePath, "utf-8");
  return toRosterPeople(parseCsv(text));
}
