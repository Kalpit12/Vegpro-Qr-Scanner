import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PageShell } from "@/components/design/page-shell";
import { AdminAnalyticsView } from "@/components/admin/admin-analytics-view";
import {
  getOperationalAnalytics,
  parseAnalyticsRangeDays,
} from "@/services/analytics";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function param(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function AdminAnalyticsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/analytics");
  }

  const params = await searchParams;
  const rangeDays = parseAnalyticsRangeDays(param(params.days));
  const summary = await getOperationalAnalytics(rangeDays);

  return (
    <PageShell
      eyebrow="Operations"
      title="Passport analytics"
      description="Privacy-safe, server-recorded public passport activity. No visitor profiles or fabricated metrics."
    >
      <AdminAnalyticsView summary={summary} />
    </PageShell>
  );
}
