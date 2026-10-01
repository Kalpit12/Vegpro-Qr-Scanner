import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/authz";
import { PageShell, EmptyState } from "@/components/design/page-shell";
import { listAdminAuditEntries } from "@/services/admin-dashboard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminAuditPage() {
  const session = await auth();
  if (!session?.user || !hasRole(session, ["ADMIN"])) {
    redirect("/admin");
  }

  const recentAudit = await listAdminAuditEntries(50);

  return (
    <PageShell
      eyebrow="Governance"
      title="Administrative activity"
      description="Read-only view of existing audit log entries. Mutations continue to be recorded server-side."
    >
      {recentAudit.length === 0 ? (
        <EmptyState
          badge="Audit log"
          title="No activity recorded yet"
          description="When varieties, categories, or parameters change, entries will appear here with action, entity, and user details."
        />
      ) : (
        <>
          <div className="vegpro-table-wrap hidden min-w-0 md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>When</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAudit.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {entry.createdAt.toLocaleString()}
                    </TableCell>
                    <TableCell>{entry.action}</TableCell>
                    <TableCell>{entry.entityType}</TableCell>
                    <TableCell className="max-w-[12rem] truncate font-mono text-xs">
                      {entry.entityId}
                    </TableCell>
                    <TableCell>
                      {entry.userName ?? entry.userEmail ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ul className="space-y-3 md:hidden">
            {recentAudit.map((entry) => (
              <li key={entry.id} className="border border-border bg-background p-4 text-sm">
                <p className="font-medium">{entry.action}</p>
                <p className="text-muted-foreground">
                  {entry.entityType} · {entry.entityId}
                </p>
                <p className="mt-2 type-meta">
                  {entry.userName ?? entry.userEmail ?? "System"} ·{" "}
                  {entry.createdAt.toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </PageShell>
  );
}
