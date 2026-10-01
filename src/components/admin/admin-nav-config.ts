export type AdminNavLink = {
  href: string;
  label: string;
  adminOnly?: boolean;
};

export type AdminNavGroup = {
  title: string;
  items: AdminNavLink[];
};

export const adminNavGroups: AdminNavGroup[] = [
  {
    title: "Overview",
    items: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/analytics", label: "Analytics" },
    ],
  },
  {
    title: "Catalog",
    items: [
      { href: "/admin/flowers", label: "Varieties" },
      { href: "/admin/categories", label: "Categories", adminOnly: true },
      { href: "/admin/parameters", label: "Parameters", adminOnly: true },
    ],
  },
  {
    title: "Identity",
    items: [{ href: "/admin/flowers#qr", label: "QR access" }],
  },
  {
    title: "Governance",
    items: [
      { href: "/admin/audit", label: "Audit", adminOnly: true },
      { href: "/admin/integration", label: "Integration", adminOnly: true },
    ],
  },
];

export function getVisibleAdminNavGroups(role: "ADMIN" | "BREEDER" | "VIEWER") {
  return adminNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.adminOnly || role === "ADMIN"),
    }))
    .filter((group) => group.items.length > 0);
}

export function flattenAdminNav(groups: AdminNavGroup[]) {
  const seen = new Set<string>();
  const flat: AdminNavLink[] = [];
  for (const group of groups) {
    for (const item of group.items) {
      if (seen.has(item.href) && item.label !== "QR access") continue;
      if (item.label === "QR access") {
        flat.push(item);
        continue;
      }
      if (!seen.has(item.href)) {
        seen.add(item.href);
        flat.push(item);
      }
    }
  }
  return flat;
}

export function isAdminNavActive(href: string, currentPath?: string) {
  if (!currentPath) return false;
  if (href === "/admin") return currentPath === "/admin";
  return currentPath === href || currentPath.startsWith(`${href}/`);
}
