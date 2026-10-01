import "../src/env/load-local-env";
import { getOperationalAnalytics, recordEvent } from "../src/services/analytics";

async function main() {
  await recordEvent({
    eventType: "PASSPORT_VIEW",
    publicIdentifier: "VP-0001",
  });
  const summary = await getOperationalAnalytics(30);
  console.log("passportViews:", summary.passportViews);
  console.log("uniqueVarieties:", summary.uniqueVarietiesViewed);
  console.log("recent:", summary.recentActivity[0]?.publicIdentifier ?? "(none)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
