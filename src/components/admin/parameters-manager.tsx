"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PARAMETER_DATA_TYPES } from "@/domain/enums";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ParameterDefinition = {
  id: string;
  name: string;
  key: string;
  category: string;
  dataType: (typeof PARAMETER_DATA_TYPES)[number];
  unit: string | null;
  displayOrder: number;
  publicVisibility: boolean;
  validationConfig: string | null;
  isActive: boolean;
};

export function ParametersManager({
  initialItems,
}: {
  initialItems: ParameterDefinition[];
}) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState({
    name: "",
    key: "",
    category: "Key Parameters",
    dataType: "text" as (typeof PARAMETER_DATA_TYPES)[number],
    unit: "",
    displayOrder: 0,
    publicVisibility: true,
    isActive: true,
    validationConfig: "",
  });
  const [message, setMessage] = useState<string | null>(null);

  async function reload() {
    const response = await fetch("/api/parameter-definitions");
    const body = (await response.json()) as { data: ParameterDefinition[] };
    setItems(body.data ?? []);
  }

  async function createDefinition(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    const response = await fetch("/api/parameter-definitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        unit: form.unit || undefined,
        validationConfig: form.validationConfig || undefined,
      }),
    });
    if (!response.ok) {
      setMessage("Unable to create parameter definition.");
      return;
    }
    setForm({ ...form, name: "", key: "" });
    setMessage("Parameter definition created.");
    await reload();
  }

  async function toggleActive(item: ParameterDefinition) {
    await fetch("/api/parameter-definitions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, isActive: !item.isActive }),
    });
    await reload();
  }

  return (
    <>
      <form className="vegpro-section grid gap-4 md:grid-cols-3" onSubmit={createDefinition}>
        <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
        <div className="space-y-2"><Label>Key</Label><Input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} required /></div>
        <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required /></div>
        <div className="space-y-2">
          <Label>Data type</Label>
          <select className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm" value={form.dataType} onChange={(e) => setForm({ ...form, dataType: e.target.value as typeof form.dataType })}>
            {PARAMETER_DATA_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div className="space-y-2"><Label>Unit</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
        <div className="space-y-2 md:col-span-3">
          <Label htmlFor="validationConfig">Validation rules (optional)</Label>
          <Input
            id="validationConfig"
            value={form.validationConfig}
            onChange={(e) => setForm({ ...form, validationConfig: e.target.value })}
            placeholder={
              form.dataType === "select"
                ? '{"options":["A","B","C"]}'
                : form.dataType === "range" || form.dataType === "percentage"
                  ? '{"min":0,"max":100}'
                  : form.dataType === "number" || form.dataType === "decimal"
                    ? '{"min":0,"max":999}'
                    : "Leave empty if not needed"
            }
          />
          <p className="text-xs text-muted-foreground">
            {form.dataType === "select"
              ? "Select types require an options list."
              : form.dataType === "range" || form.dataType === "percentage"
                ? "Use min and max for allowed numeric range."
                : form.dataType === "number" || form.dataType === "decimal"
                  ? "Optional min/max bounds for numeric values."
                  : "Text, boolean, and date types usually need no extra rules."}
          </p>
        </div>
        <div className="space-y-2"><Label>Display order</Label><Input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} /></div>
        <div className="md:col-span-3"><Button type="submit">Create definition</Button></div>
      </form>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <div className="min-w-0 overflow-x-auto">
      <div className="vegpro-table-wrap">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.key}</TableCell>
              <TableCell>{item.dataType}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.isActive ? "Yes" : "No"}</TableCell>
              <TableCell><Button type="button" size="sm" variant="outline" onClick={() => toggleActive(item)}>{item.isActive ? "Deactivate" : "Activate"}</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
      </div>
    </>
  );
}
