import { Suspense } from "react";
import { OliviaReportPage } from "../../components/patterns/dashboard/olivia/OliviaReportPage";

/** The "Download Report" destination behind the in-chat report card
 * (see ReportChatCard). Suspense is required here (not stylistic)
 * because OliviaReportPage reads `useSearchParams()`, which Next.js
 * requires be wrapped for the page to prerender at all. */
export default function OliviaReportRoute() {
  return (
    <Suspense fallback={null}>
      <OliviaReportPage />
    </Suspense>
  );
}
