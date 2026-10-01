import type { VarietyRelationKind } from "@/domain/flower";

export type VarietyRelationInput = {
  relationType: VarietyRelationKind;
  otherFlowerRecordId: string;
  publicVisible?: boolean;
  /** For PARENT_OF: when false, other flower is the parent of this variety. */
  thisFlowerIsParent?: boolean;
};

export type ResolvedVarietyRelationEdge = {
  fromFlowerRecordId: string;
  toFlowerRecordId: string;
  dbRelationType: "PARENT" | "RELATED";
  publicVisible: boolean;
};

function edgeKey(
  fromId: string,
  toId: string,
  type: "PARENT" | "RELATED",
): string {
  return `${fromId}:${toId}:${type}`;
}

function canonicalRelatedIds(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export function resolveVarietyRelationEdges(
  recordId: string,
  relations: VarietyRelationInput[] | undefined,
): ResolvedVarietyRelationEdge[] {
  if (!relations?.length) {
    return [];
  }

  const edges: ResolvedVarietyRelationEdge[] = [];
  const seen = new Set<string>();

  for (const relation of relations) {
    const otherId = relation.otherFlowerRecordId;

    if (otherId === recordId) {
      throw new Error("INVALID_RELATION: A variety cannot relate to itself");
    }

    if (relation.relationType === "RELATED_TO") {
      const [fromId, toId] = canonicalRelatedIds(recordId, otherId);
      const key = edgeKey(fromId, toId, "RELATED");
      if (seen.has(key)) {
        throw new Error("INVALID_RELATION: Duplicate relationship");
      }
      seen.add(key);
      edges.push({
        fromFlowerRecordId: fromId,
        toFlowerRecordId: toId,
        dbRelationType: "RELATED",
        publicVisible: relation.publicVisible ?? false,
      });
      continue;
    }

    const thisIsParent = relation.thisFlowerIsParent !== false;
    const fromId = thisIsParent ? recordId : otherId;
    const toId = thisIsParent ? otherId : recordId;
    const key = edgeKey(fromId, toId, "PARENT");
    if (seen.has(key)) {
      throw new Error("INVALID_RELATION: Duplicate relationship");
    }
    seen.add(key);
    edges.push({
      fromFlowerRecordId: fromId,
      toFlowerRecordId: toId,
      dbRelationType: "PARENT",
      publicVisible: relation.publicVisible ?? false,
    });
  }

  return edges;
}

export function mapDbRelationTypeToKind(
  type: "PARENT" | "CHILD" | "RELATED" | "PREDECESSOR" | "SUCCESSOR",
): VarietyRelationKind | null {
  if (type === "PARENT" || type === "CHILD") {
    return "PARENT_OF";
  }
  if (type === "RELATED") {
    return "RELATED_TO";
  }
  return null;
}
