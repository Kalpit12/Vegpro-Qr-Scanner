"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FLOWER_STATUSES, FLOWER_STATUS_LABELS } from "@/domain/enums";

export function FlowersFilters({
  categories,
  defaults,
}: {
  categories: { id: string; name: string }[];
  defaults: Record<string, string | string[] | undefined>;
}) {
  const router = useRouter();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string" && value.trim()) {
        params.set(key, value);
      }
    }
    router.push(`/admin/flowers?${params.toString()}`);
  }

  return (
    <form className="vegpro-section space-y-6" onSubmit={onSubmit}>
      <div className="space-y-2">
        <p className="type-editorial-label">Search</p>
        <Label htmlFor="search" className="sr-only">
          Search varieties
        </Label>
        <Input
          id="search"
          name="search"
          defaultValue={typeof defaults.search === "string" ? defaults.search : ""}
          placeholder="Search by name, code, or VP ID"
          className="h-10 text-base sm:max-w-xl"
        />
      </div>

      <div className="space-y-4 border-t border-border pt-5">
        <p className="type-editorial-label">Filters</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={typeof defaults.status === "string" ? defaults.status : ""}
              className="vegpro-select"
            >
              <option value="">All</option>
              {FLOWER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {FLOWER_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={typeof defaults.categoryId === "string" ? defaults.categoryId : ""}
              className="vegpro-select"
            >
              <option value="">All</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="publicVisible">Visibility</Label>
            <select
              id="publicVisible"
              name="publicVisible"
              defaultValue={
                typeof defaults.publicVisible === "string" ? defaults.publicVisible : ""
              }
              className="vegpro-select"
            >
              <option value="">All</option>
              <option value="true">Public only</option>
              <option value="false">Private only</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortBy">Sort</Label>
            <select
              id="sortBy"
              name="sortBy"
              defaultValue={typeof defaults.sortBy === "string" ? defaults.sortBy : "updatedAt"}
              className="vegpro-select"
            >
              <option value="updatedAt">Updated</option>
              <option value="name">Name</option>
              <option value="varietyCode">Code</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Order</Label>
            <select
              id="sortOrder"
              name="sortOrder"
              defaultValue={typeof defaults.sortOrder === "string" ? defaults.sortOrder : "desc"}
              className="vegpro-select"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
          <label className="flex items-end gap-2 pb-1 text-sm">
            <input
              type="checkbox"
              name="includeArchived"
              value="true"
              defaultChecked={defaults.includeArchived === "true"}
            />
            Include archived
          </label>
          <div className="flex items-end sm:col-span-2 lg:col-span-1">
            <Button type="submit">Apply filters</Button>
          </div>
        </div>
        {typeof defaults.view === "string" && defaults.view === "list" ? (
          <input type="hidden" name="view" value="list" />
        ) : null}
      </div>
    </form>
  );
}
