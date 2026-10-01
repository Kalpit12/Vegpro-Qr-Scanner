import { eq } from "drizzle-orm";
import type { Flower, FlowerQueryOptions } from "@/domain/flower";
import { getDb } from "@/db";
import { flowerIdentities, flowerRecords } from "@/db/schema";
import { mapRecordToFlower } from "@/db/mappers/flower-mapper";
import {
  countFlowerRecords,
  loadFlowerGraph,
  queryFlowerRecordIds,
} from "@/db/queries/flowers";
import type { FlowerDataProvider } from "./flower-data-provider";

export class MockFlowerDataProvider implements FlowerDataProvider {
  async getFlower(id: string): Promise<Flower | null> {
    const graph = await loadFlowerGraph(id);
    if (!graph) {
      return null;
    }
    return mapRecordToFlower({
      record: graph.record,
      publicIdentifier: graph.identity.publicIdentifier,
      categoryName: graph.category.name,
      parameters: graph.parameters,
      images: graph.images,
      breeding: graph.breeding,
      varietyRelations: graph.varietyRelations,
    });
  }

  async getFlowerByPublicIdentifier(
    publicIdentifier: string,
  ): Promise<Flower | null> {
    const db = getDb();
    const [identity] = await db
      .select()
      .from(flowerIdentities)
      .where(eq(flowerIdentities.publicIdentifier, publicIdentifier))
      .limit(1);

    if (!identity) {
      return null;
    }

    const [record] = await db
      .select()
      .from(flowerRecords)
      .where(eq(flowerRecords.flowerIdentityId, identity.id))
      .limit(1);

    if (!record) {
      return null;
    }

    return this.getFlower(record.id);
  }

  async getFlowers(options?: FlowerQueryOptions): Promise<Flower[]> {
    const rows = await queryFlowerRecordIds(options);
    const flowers: Flower[] = [];

    for (const row of rows) {
      const flower = await this.getFlower(row.id);
      if (flower) {
        flowers.push(flower);
      }
    }

    return flowers;
  }

  async countFlowers(
    options?: Omit<FlowerQueryOptions, "limit" | "offset">,
  ): Promise<number> {
    return countFlowerRecords(options);
  }

  async searchFlowers(query: string): Promise<Flower[]> {
    return this.getFlowers({ search: query, limit: 25 });
  }

  async getFlowerParameters(id: string) {
    const flower = await this.getFlower(id);
    return flower?.parameters ?? [];
  }

  async getFlowerLastUpdated(id: string): Promise<Date | null> {
    const flower = await this.getFlower(id);
    if (!flower) {
      return null;
    }
    return new Date(flower.source.lastUpdatedAt);
  }
}

let providerInstance: MockFlowerDataProvider | undefined;

export function getMockFlowerDataProviderInstance(): MockFlowerDataProvider {
  if (!providerInstance) {
    providerInstance = new MockFlowerDataProvider();
  }
  return providerInstance;
}

/** @deprecated Use getFlowerDataProvider from provider-factory */
export function getFlowerDataProvider(): FlowerDataProvider {
  return getMockFlowerDataProviderInstance();
}
