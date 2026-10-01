"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Category = {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  isActive: boolean;
};

export function CategoriesManager({
  initialItems,
}: {
  initialItems: Category[];
}) {
  const [items, setItems] = useState(initialItems);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function reload() {
    const response = await fetch("/api/categories");
    const body = (await response.json()) as { data: Category[] };
    setItems(body.data ?? []);
  }

  async function createCategory(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, displayOrder: items.length + 1 }),
    });
    if (!response.ok) {
      setMessage("Unable to create category.");
      return;
    }
    setName("");
    setSlug("");
    setMessage("Demo category created.");
    await reload();
  }

  async function toggleActive(item: Category) {
    await fetch("/api/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, isActive: !item.isActive }),
    });
    await reload();
  }

  return (
    <>
      <form className="vegpro-section grid gap-4 md:grid-cols-3" onSubmit={createCategory}>
        <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
        <div className="space-y-2"><Label>Slug</Label><Input value={slug} onChange={(e) => setSlug(e.target.value)} required /></div>
        <div className="flex items-end"><Button type="submit">Create category</Button></div>
      </form>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <div className="vegpro-table-wrap">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.slug}</TableCell>
              <TableCell>{item.isActive ? "Yes" : "No"}</TableCell>
              <TableCell><Button type="button" size="sm" variant="outline" onClick={() => toggleActive(item)}>{item.isActive ? "Deactivate" : "Activate"}</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </>
  );
}
