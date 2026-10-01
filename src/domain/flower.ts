export type FlowerStatus =
  | "DRAFT"
  | "TRIAL"
  | "EVALUATION"
  | "APPROVED"
  | "COMMERCIAL"
  | "ARCHIVED";

export type DevelopmentStage =
  | "PARENT"
  | "CROSS"
  | "SEEDLING"
  | "TRIAL"
  | "EVALUATION"
  | "SELECTED"
  | "APPROVED"
  | "COMMERCIAL";

export type ParameterDataType =
  | "text"
  | "number"
  | "decimal"
  | "boolean"
  | "date"
  | "percentage"
  | "range"
  | "select";

export type SourceSystem = "Demo" | "VegPro";

export type FlowerSourceMetadata = {
  system: SourceSystem;
  externalId: string;
  lastUpdatedAt: string;
  synchronizedAt: string | null;
};

export type FlowerParameter = {
  id: string;
  definitionId: string;
  name: string;
  key: string;
  category: string;
  dataType: ParameterDataType;
  unit: string | null;
  value: string;
  displayOrder: number;
  publicVisible: boolean;
};

export type FlowerImage = {
  id: string;
  url: string;
  altText: string | null;
  displayOrder: number;
  publicVisible: boolean;
  isPrimary: boolean;
};

export type BreedingInformation = {
  breedingCode: string | null;
  publicSummary: string | null;
  publicVisible: boolean;
  /** Staff-only; never mapped to PublicFlower. */
  breederNotesInternal?: string | null;
  trialNotesInternal?: string | null;
};

export type VarietyRelationKind = "PARENT_OF" | "RELATED_TO";

export type VarietyRelation = {
  id: string;
  relationType: VarietyRelationKind;
  otherFlowerRecordId: string;
  otherPublicIdentifier: string;
  otherName: string;
  otherVarietyCode: string;
  otherPubliclyVisible: boolean;
  publicVisible: boolean;
  /** For PARENT_OF: true when this flower is the parent of the other variety. */
  thisFlowerIsParent: boolean;
};

export type Flower = {
  id: string;
  externalId: string;
  publicIdentifier: string;

  varietyCode: string;
  name: string;
  slug: string | null;

  categoryId: string;
  category: string;
  flowerType: string | null;

  shortDescription: string | null;
  description: string | null;

  status: FlowerStatus;
  developmentStage: DevelopmentStage | null;

  origin: string | null;
  breeder: string | null;
  breedingProgram: string | null;
  breedingYear: number | null;

  publicVisible: boolean;
  featured: boolean;

  images: FlowerImage[];
  parameters: FlowerParameter[];

  breeding: BreedingInformation | null;
  varietyRelations: VarietyRelation[];

  source: FlowerSourceMetadata;

  createdAt: string;
  updatedAt: string;
};

export type PublicFlowerImage = {
  url: string;
  altText: string | null;
  displayOrder: number;
  isPrimary: boolean;
};

export type PublicFlowerParameter = {
  name: string;
  key: string;
  category: string;
  dataType: ParameterDataType;
  unit: string | null;
  value: string;
  displayOrder: number;
};

export type PublicBreedingInformation = {
  origin: string | null;
  breeder: string | null;
  breedingProgram: string | null;
  breedingYear: number | null;
  publicSummary: string | null;
};

export type PublicVarietyRelation = {
  relationType: VarietyRelationKind;
  publicIdentifier: string;
  name: string;
  varietyCode: string;
  /** When relationType is PARENT_OF, true if the related variety is the parent. */
  relatedVarietyIsParent: boolean;
};

export type PublicFlower = {
  publicIdentifier: string;
  varietyCode: string;
  name: string;
  category: string;
  flowerType: string | null;
  shortDescription: string | null;
  description: string | null;
  status: FlowerStatus;
  featured: boolean;
  images: PublicFlowerImage[];
  parameters: PublicFlowerParameter[];
  breeding: PublicBreedingInformation | null;
  varietyRelations: PublicVarietyRelation[];
  source: Pick<FlowerSourceMetadata, "system" | "lastUpdatedAt">;
};

export type FlowerQueryOptions = {
  limit?: number;
  offset?: number;
  publicOnly?: boolean;
  search?: string;
  status?: FlowerStatus;
  categoryId?: string;
  publicVisible?: boolean;
  includeArchived?: boolean;
  sortBy?: "name" | "varietyCode" | "updatedAt";
  sortOrder?: "asc" | "desc";
};
