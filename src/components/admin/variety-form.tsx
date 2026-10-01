"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Flower } from "@/domain/flower";
import {
  DEVELOPMENT_STAGES,
  DEVELOPMENT_STAGE_LABELS,
  FLOWER_STATUSES,
  FLOWER_STATUS_LABELS,
  PARAMETER_DATA_TYPES,
} from "@/domain/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type CategoryOption = { id: string; name: string; slug: string; isActive: boolean };
type ParameterDefinitionOption = {
  id: string;
  name: string;
  key: string;
  category: string;
  dataType: (typeof PARAMETER_DATA_TYPES)[number];
  unit: string | null;
  publicVisibility: boolean;
  isActive: boolean;
};

type ParameterRow = {
  parameterDefinitionId: string;
  value: string;
  publicVisible: boolean;
};

type ImageRow = {
  url: string;
  altText: string;
  displayOrder: number;
  publicVisible: boolean;
  isPrimary: boolean;
};

type VarietyOption = {
  recordId: string;
  publicIdentifier: string;
  name: string;
  varietyCode: string;
};

type RelationRow = {
  relationType: "PARENT_OF" | "RELATED_TO";
  otherFlowerRecordId: string;
  publicVisible: boolean;
  thisFlowerIsParent: boolean;
};

type VarietyFormProps = {
  mode: "create" | "edit";
  readOnly?: boolean;
  recordId?: string;
  publicIdentifier?: string;
  initialFlower?: Flower | null;
  categories: CategoryOption[];
  parameterDefinitions: ParameterDefinitionOption[];
  varietyOptions?: VarietyOption[];
};

const workflowSteps = [
  { value: "basic", num: "01", label: "Identity" },
  { value: "parameters", num: "02", label: "Parameters" },
  { value: "breeding", num: "03", label: "Breeding" },
  { value: "images", num: "04", label: "Images" },
  { value: "visibility", num: "05", label: "Visibility" },
  { value: "review", num: "06", label: "Review" },
] as const;

type WorkflowStepValue = (typeof workflowSteps)[number]["value"];

export function VarietyForm({
  mode,
  readOnly = false,
  recordId,
  publicIdentifier,
  initialFlower,
  categories,
  parameterDefinitions,
  varietyOptions = [],
}: VarietyFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<WorkflowStepValue>("basic");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initialFlower?.name ?? "");
  const [varietyCode, setVarietyCode] = useState(initialFlower?.varietyCode ?? "");
  const [categoryId, setCategoryId] = useState(
    initialFlower?.categoryId ?? categories[0]?.id ?? "",
  );
  const [flowerType, setFlowerType] = useState(initialFlower?.flowerType ?? "");
  const [status, setStatus] = useState<(typeof FLOWER_STATUSES)[number]>(
    initialFlower?.status ?? "DRAFT",
  );
  const [developmentStage, setDevelopmentStage] = useState<
    (typeof DEVELOPMENT_STAGES)[number] | ""
  >(initialFlower?.developmentStage ?? "");
  const [shortDescription, setShortDescription] = useState(
    initialFlower?.shortDescription ?? "",
  );
  const [description, setDescription] = useState(initialFlower?.description ?? "");
  const [origin, setOrigin] = useState(initialFlower?.origin ?? "");
  const [breeder, setBreeder] = useState(initialFlower?.breeder ?? "");
  const [breedingProgram, setBreedingProgram] = useState(
    initialFlower?.breedingProgram ?? "",
  );
  const [breedingYear, setBreedingYear] = useState(
    initialFlower?.breedingYear?.toString() ?? "",
  );
  const [publicVisible, setPublicVisible] = useState(
    initialFlower?.publicVisible ?? false,
  );
  const [featured, setFeatured] = useState(initialFlower?.featured ?? false);

  const [breedingCode, setBreedingCode] = useState(
    initialFlower?.breeding?.breedingCode ?? "",
  );
  const [publicSummary, setPublicSummary] = useState(
    initialFlower?.breeding?.publicSummary ?? "",
  );
  const [breedingPublicVisible, setBreedingPublicVisible] = useState(
    initialFlower?.breeding?.publicVisible ?? false,
  );
  const [breederNotesInternal, setBreederNotesInternal] = useState(
    initialFlower?.breeding?.breederNotesInternal ?? "",
  );
  const [trialNotesInternal, setTrialNotesInternal] = useState(
    initialFlower?.breeding?.trialNotesInternal ?? "",
  );

  const [varietyRelations, setVarietyRelations] = useState<RelationRow[]>(
    initialFlower?.varietyRelations.map((relation) => ({
      relationType: relation.relationType,
      otherFlowerRecordId: relation.otherFlowerRecordId,
      publicVisible: relation.publicVisible,
      thisFlowerIsParent: relation.thisFlowerIsParent,
    })) ?? [],
  );

  const [parameters, setParameters] = useState<ParameterRow[]>(
    initialFlower?.parameters.map((parameter) => ({
      parameterDefinitionId: parameter.definitionId,
      value: parameter.value,
      publicVisible: parameter.publicVisible,
    })) ?? [],
  );

  const [images, setImages] = useState<ImageRow[]>(
    initialFlower?.images.map((image, index) => ({
      url: image.url,
      altText: image.altText ?? "",
      displayOrder: image.displayOrder ?? index,
      publicVisible: image.publicVisible,
      isPrimary: image.isPrimary,
    })) ?? [],
  );

  const activeDefinitions = useMemo(
    () => parameterDefinitions.filter((definition) => definition.isActive),
    [parameterDefinitions],
  );

  const selectableVarieties = useMemo(
    () =>
      varietyOptions.filter(
        (option) => !recordId || option.recordId !== recordId,
      ),
    [recordId, varietyOptions],
  );

  function addRelationRow() {
    const firstOption = selectableVarieties[0];
    if (!firstOption) {
      return;
    }
    setVarietyRelations((current) => [
      ...current,
      {
        relationType: "RELATED_TO",
        otherFlowerRecordId: firstOption.recordId,
        publicVisible: false,
        thisFlowerIsParent: true,
      },
    ]);
  }

  function addParameter(definitionId: string) {
    if (parameters.some((row) => row.parameterDefinitionId === definitionId)) {
      return;
    }
    setParameters((current) => [
      ...current,
      {
        parameterDefinitionId: definitionId,
        value: "",
        publicVisible: true,
      },
    ]);
  }

  function addImageRow() {
    setImages((current) => [
      ...current,
      {
        url: "",
        altText: "",
        displayOrder: current.length,
        publicVisible: true,
        isPrimary: current.length === 0,
      },
    ]);
  }

  async function handleSubmit() {
    if (readOnly) {
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      name,
      varietyCode,
      categoryId,
      flowerType: flowerType || undefined,
      status,
      developmentStage: developmentStage || undefined,
      shortDescription: shortDescription || undefined,
      description: description || undefined,
      origin: origin || undefined,
      breeder: breeder || undefined,
      breedingProgram: breedingProgram || undefined,
      breedingYear: breedingYear ? Number(breedingYear) : undefined,
      publicVisible,
      featured,
      parameters,
      images: images.filter((image) => image.url.trim()),
      breeding: {
        breedingCode: breedingCode || undefined,
        publicSummary: publicSummary || undefined,
        publicVisible: breedingPublicVisible,
        breederNotesInternal: breederNotesInternal || undefined,
        trialNotesInternal: trialNotesInternal || undefined,
      },
      varietyRelations,
    };

    const response =
      mode === "create"
        ? await fetch("/api/flowers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/flowers/${recordId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

    setSubmitting(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(body?.error ?? "Unable to save variety.");
      return;
    }

    const body = (await response.json()) as { data: Flower };
    router.push(`/admin/flowers/${body.data.publicIdentifier}`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {publicIdentifier ? (
        <p className="type-meta border-l border-border pl-3 text-muted-foreground">
          <span className="font-mono text-foreground/75">{publicIdentifier}</span>
          {" · Permanent identifier · cannot be changed"}
        </p>
      ) : null}

      <Tabs value={step} onValueChange={(value) => setStep(value as typeof step)}>
        <TabsList variant="line" className="h-auto w-full flex-wrap justify-start gap-1 border-b border-border pb-0">
          {workflowSteps.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className="rounded-none px-3 py-2.5 data-active:text-botanical"
            >
              <span className="mr-2 font-mono text-xs text-muted-foreground">{item.num}</span>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <WorkflowStepSection
            editorialLabel="Profile"
            title="Identity"
            description="Core variety details stored in the demo data provider."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Name" htmlFor="name">
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={readOnly} required />
              </Field>
              <Field label="Variety code" htmlFor="varietyCode">
                <Input id="varietyCode" value={varietyCode} onChange={(e) => setVarietyCode(e.target.value)} disabled={readOnly} required />
              </Field>
              <Field label="Category" htmlFor="categoryId">
                <select id="categoryId" className="vegpro-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} disabled={readOnly}>
                  {categories.filter((item) => item.isActive).map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Flower type" htmlFor="flowerType">
                <Input id="flowerType" value={flowerType} onChange={(e) => setFlowerType(e.target.value)} disabled={readOnly} />
              </Field>
              <Field label="Status" htmlFor="status">
                <select id="status" className="vegpro-select" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} disabled={readOnly}>
                  {FLOWER_STATUSES.map((value) => (
                    <option key={value} value={value}>{FLOWER_STATUS_LABELS[value]}</option>
                  ))}
                </select>
              </Field>
              <Field label="Development stage" htmlFor="developmentStage">
                <select id="developmentStage" className="vegpro-select" value={developmentStage} onChange={(e) => setDevelopmentStage(e.target.value as typeof developmentStage)} disabled={readOnly}>
                  <option value="">Not set</option>
                  {DEVELOPMENT_STAGES.map((value) => (
                    <option key={value} value={value}>{DEVELOPMENT_STAGE_LABELS[value]}</option>
                  ))}
                </select>
              </Field>
              <div className="md:col-span-2">
                <Field label="Short description" htmlFor="shortDescription">
                  <Textarea id="shortDescription" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} disabled={readOnly} />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Description" htmlFor="description">
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={readOnly} />
                </Field>
              </div>
            </div>
          </WorkflowStepSection>
        </TabsContent>

        <TabsContent value="parameters" className="mt-6">
          <WorkflowStepSection
            editorialLabel="Catalog"
            title="Parameters"
            description="Select definitions and enter values. No hard-coded parameter columns."
          >
            <div className="space-y-4">
              {!readOnly ? (
                <div className="flex flex-wrap gap-2">
                  {activeDefinitions.map((definition) => (
                    <Button key={definition.id} type="button" variant="outline" size="sm" onClick={() => addParameter(definition.id)}>
                      Add {definition.name}
                    </Button>
                  ))}
                </div>
              ) : null}
              {parameters.length === 0 ? (
                <p className="text-sm text-muted-foreground">No parameters selected yet.</p>
              ) : (
                parameters.map((row, index) => {
                  const definition = activeDefinitions.find((item) => item.id === row.parameterDefinitionId);
                  if (!definition) return null;
                  return (
                    <div key={row.parameterDefinitionId} className="grid gap-3 border border-border p-4 md:grid-cols-[1fr_auto]">
                      <div className="space-y-2">
                        <Label>{definition.name} ({definition.dataType}{definition.unit ? ` · ${definition.unit}` : ""})</Label>
                        <ParameterInput
                          dataType={definition.dataType}
                          value={row.value}
                          disabled={readOnly}
                          onChange={(value) =>
                            setParameters((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, value } : item,
                              ),
                            )
                          }
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={row.publicVisible} disabled={readOnly} onCheckedChange={(checked) => setParameters((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, publicVisible: checked === true } : item))} />
                        Public
                      </label>
                    </div>
                  );
                })
              )}
            </div>
          </WorkflowStepSection>
        </TabsContent>

        <TabsContent value="breeding" className="mt-6">
          <WorkflowStepSection
            editorialLabel="Origin"
            title="Breeding information"
            description="Internal notes stay server-side; only approved public summary can become public."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Origin" htmlFor="origin"><Input id="origin" value={origin} onChange={(e) => setOrigin(e.target.value)} disabled={readOnly} /></Field>
              <Field label="Breeder" htmlFor="breeder"><Input id="breeder" value={breeder} onChange={(e) => setBreeder(e.target.value)} disabled={readOnly} /></Field>
              <Field label="Breeding program" htmlFor="breedingProgram"><Input id="breedingProgram" value={breedingProgram} onChange={(e) => setBreedingProgram(e.target.value)} disabled={readOnly} /></Field>
              <Field label="Breeding year" htmlFor="breedingYear"><Input id="breedingYear" type="number" value={breedingYear} onChange={(e) => setBreedingYear(e.target.value)} disabled={readOnly} /></Field>
              <Field label="Breeding code" htmlFor="breedingCode"><Input id="breedingCode" value={breedingCode} onChange={(e) => setBreedingCode(e.target.value)} disabled={readOnly} /></Field>
              <div className="md:col-span-2">
                <Field label="Public breeding summary" htmlFor="publicSummary"><Textarea id="publicSummary" value={publicSummary} onChange={(e) => setPublicSummary(e.target.value)} disabled={readOnly} /></Field>
              </div>
              {!readOnly ? (
                <>
                  <div className="md:col-span-2">
                    <Field label="Internal breeder notes" htmlFor="breederNotesInternal"><Textarea id="breederNotesInternal" value={breederNotesInternal} onChange={(e) => setBreederNotesInternal(e.target.value)} /></Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Internal trial notes" htmlFor="trialNotesInternal"><Textarea id="trialNotesInternal" value={trialNotesInternal} onChange={(e) => setTrialNotesInternal(e.target.value)} /></Field>
                  </div>
                </>
              ) : null}
              <label className="flex items-center gap-2 text-sm md:col-span-2">
                <Checkbox checked={breedingPublicVisible} disabled={readOnly} onCheckedChange={(checked) => setBreedingPublicVisible(checked === true)} />
                Public breeding information visible on passport when approved
              </label>
            </div>
          </WorkflowStepSection>

          <WorkflowStepSection
            editorialLabel="Links"
            title="Variety relationships"
            description="Parent and related links use stable internal record IDs. Public passport shows only approved, public links."
          >
            <div className="space-y-4">
              {!readOnly ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addRelationRow}
                  disabled={selectableVarieties.length === 0}
                >
                  Add relationship
                </Button>
              ) : null}
              {selectableVarieties.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Add another variety before creating relationships.
                </p>
              ) : varietyRelations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No relationships recorded yet.
                </p>
              ) : (
                varietyRelations.map((relation, index) => (
                  <div
                    key={`${relation.otherFlowerRecordId}-${index}`}
                    className="grid gap-3 border border-border p-4 md:grid-cols-2"
                  >
                    <Field label="Relationship" htmlFor={`relation-type-${index}`}>
                      <select
                        id={`relation-type-${index}`}
                        className="vegpro-select"
                        value={
                          relation.relationType === "PARENT_OF" &&
                          !relation.thisFlowerIsParent
                            ? "OFFSPRING_OF"
                            : relation.relationType
                        }
                        disabled={readOnly}
                        onChange={(event) => {
                          const value = event.target.value;
                          setVarietyRelations((current) =>
                            current.map((item, itemIndex) => {
                              if (itemIndex !== index) {
                                return item;
                              }
                              if (value === "OFFSPRING_OF") {
                                return {
                                  ...item,
                                  relationType: "PARENT_OF",
                                  thisFlowerIsParent: false,
                                };
                              }
                              return {
                                ...item,
                                relationType: value as RelationRow["relationType"],
                                thisFlowerIsParent: true,
                              };
                            }),
                          );
                        }}
                      >
                        <option value="PARENT_OF">Parent of another variety</option>
                        <option value="OFFSPRING_OF">Offspring of another variety</option>
                        <option value="RELATED_TO">Related to</option>
                      </select>
                    </Field>
                    <Field label="Variety" htmlFor={`relation-target-${index}`}>
                      <select
                        id={`relation-target-${index}`}
                        className="vegpro-select"
                        value={relation.otherFlowerRecordId}
                        disabled={readOnly}
                        onChange={(event) =>
                          setVarietyRelations((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...item,
                                    otherFlowerRecordId: event.target.value,
                                  }
                                : item,
                            ),
                          )
                        }
                      >
                        {selectableVarieties.map((option) => (
                          <option key={option.recordId} value={option.recordId}>
                            {option.name} ({option.varietyCode} ·{" "}
                            {option.publicIdentifier})
                          </option>
                        ))}
                      </select>
                    </Field>
                    <label className="flex items-center gap-2 text-sm md:col-span-2">
                      <Checkbox
                        checked={relation.publicVisible}
                        disabled={readOnly}
                        onCheckedChange={(checked) =>
                          setVarietyRelations((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, publicVisible: checked === true }
                                : item,
                            ),
                          )
                        }
                      />
                      Show on public passport when approved
                    </label>
                    {!readOnly ? (
                      <div className="md:col-span-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setVarietyRelations((current) =>
                              current.filter((_, itemIndex) => itemIndex !== index),
                            )
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </WorkflowStepSection>
        </TabsContent>

        <TabsContent value="images" className="mt-6">
          <WorkflowStepSection
            editorialLabel="Media"
            title="Images"
            description="URL-based image references for Phase 2. Object storage can replace this later."
          >
            <div className="space-y-4">
              {!readOnly ? (
                <Button type="button" variant="outline" onClick={addImageRow}>Add image URL</Button>
              ) : null}
              {images.length === 0 ? (
                <p className="text-sm text-muted-foreground">No images added yet.</p>
              ) : (
                images.map((image, index) => (
                  <div key={index} className="grid gap-3 border border-border p-4">
                    <Input placeholder="https://..." value={image.url} disabled={readOnly} onChange={(e) => setImages((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, url: e.target.value } : item))} />
                    <Input placeholder="Alt text" value={image.altText} disabled={readOnly} onChange={(e) => setImages((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, altText: e.target.value } : item))} />
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={image.publicVisible} disabled={readOnly} onCheckedChange={(checked) => setImages((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, publicVisible: checked === true } : item))} />
                        Public
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={image.isPrimary} disabled={readOnly} onCheckedChange={(checked) => setImages((current) => current.map((item, itemIndex) => ({ ...item, isPrimary: itemIndex === index ? checked === true : false })))} />
                        Primary
                      </label>
                    </div>
                  </div>
                ))
              )}
            </div>
          </WorkflowStepSection>
        </TabsContent>

        <TabsContent value="visibility" className="mt-6">
          <WorkflowStepSection
            editorialLabel="Passport"
            title="Public visibility"
            description="Public passport visibility is enforced server-side via `toPublicFlower()`."
          >
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={publicVisible} disabled={readOnly} onCheckedChange={(checked) => setPublicVisible(checked === true)} />
                Variety is publicly visible
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={featured} disabled={readOnly} onCheckedChange={(checked) => setFeatured(checked === true)} />
                Featured in future public catalog
              </label>
            </div>
          </WorkflowStepSection>
        </TabsContent>

        <TabsContent value="review" className="mt-6">
          <WorkflowStepSection
            editorialLabel="Summary"
            title="Review"
            description={
              mode === "create"
                ? "A new immutable public identifier will be allocated from the PostgreSQL sequence on save."
                : "Saving will not change the public identifier."
            }
          >
            <div className="space-y-2 type-body">
              <p><strong>Name:</strong> {name || "—"}</p>
              <p><strong>Code:</strong> {varietyCode || "—"}</p>
              <p><strong>Category:</strong> {categories.find((item) => item.id === categoryId)?.name ?? "—"}</p>
              <p><strong>Status:</strong> {FLOWER_STATUS_LABELS[status]}</p>
              <p><strong>Parameters:</strong> {parameters.length}</p>
              <p><strong>Images:</strong> {images.filter((image) => image.url).length}</p>
              <p><strong>Public:</strong> {publicVisible ? "Yes" : "No"}</p>
              <p className="type-meta">Source system remains Demo for Phase 2.</p>
            </div>
          </WorkflowStepSection>
        </TabsContent>
      </Tabs>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        {!readOnly ? (
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving…" : mode === "create" ? "Create variety" : "Save changes"}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const index = workflowSteps.findIndex((item) => item.value === step);
            setStep(workflowSteps[Math.max(0, index - 1)]?.value ?? "basic");
          }}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const index = workflowSteps.findIndex((item) => item.value === step);
            setStep(workflowSteps[Math.min(workflowSteps.length - 1, index + 1)]?.value ?? "review");
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function WorkflowStepSection({
  editorialLabel,
  title,
  description,
  children,
}: {
  editorialLabel: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="vegpro-section">
      <p className="type-editorial-label">{editorialLabel}</p>
      <h3 className="mt-2 type-section-title text-xl">{title}</h3>
      {description ? <p className="mt-2 type-meta">{description}</p> : null}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function ParameterInput({
  dataType,
  value,
  onChange,
  disabled,
}: {
  dataType: (typeof PARAMETER_DATA_TYPES)[number];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  if (dataType === "boolean") {
    return (
      <select className="vegpro-select" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select</option>
        <option value="true">True</option>
        <option value="false">False</option>
      </select>
    );
  }

  const inputType =
    dataType === "number" || dataType === "decimal" || dataType === "percentage"
      ? "number"
      : dataType === "date"
        ? "date"
        : "text";

  return (
    <Input
      type={inputType}
      step={dataType === "decimal" ? "0.01" : undefined}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
