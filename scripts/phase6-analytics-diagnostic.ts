import {
  clearAllAnalyticsEvents,
  closeQaDb,
  countPassportViews,
} from "./qa-analytics-db";

async function waitForCount(maxMs: number, intervalMs: number) {
  const attempts = Math.ceil(maxMs / intervalMs);
  for (let i = 0; i < attempts; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    const stats = await countPassportViews(7);
    if (stats.passportViews > 0) {
      return { stats, waitedMs: (i + 1) * intervalMs };
    }
  }
  return { stats: await countPassportViews(7), waitedMs: maxMs };
}

async function probe(
  label: string,
  init?: RequestInit,
): Promise<void> {
  await clearAllAnalyticsEvents();
  const response = await fetch("http://localhost:5001/flowers/VP-0001", init);
  const bodyPreview = (await response.text()).slice(0, 120).replace(/\s+/g, " ");
  console.log(`\n=== ${label} ===`);
  console.log("status", response.status);
  console.log(
    "response headers:",
    JSON.stringify(
      {
        "x-nextjs-cache": response.headers.get("x-nextjs-cache"),
        "cache-control": response.headers.get("cache-control"),
        "content-type": response.headers.get("content-type"),
        vary: response.headers.get("vary"),
      },
      null,
      0,
    ),
  );
  console.log("body preview:", bodyPreview);
  const { stats, waitedMs } = await waitForCount(10_000, 500);
  console.log(`counts after ${waitedMs}ms:`, stats);
}

async function main() {
  const health = await fetch("http://localhost:5001/").catch(() => null);
  if (!health?.ok) {
    console.error("Server not reachable at http://localhost:5001");
    process.exit(1);
  }

  await probe("node-fetch-default");
  await probe("browser-document", {
    headers: {
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  await probe("prefetch-purpose", {
    headers: { purpose: "prefetch" },
  });
}

main()
  .then(() => closeQaDb())
  .catch(async (error) => {
    console.error(error);
    await closeQaDb();
    process.exit(1);
  });
