import type {
  Flower,
  FlowerImage,
  FlowerParameter,
  FlowerQueryOptions,
} from "@/domain/flower";

export interface FlowerDataProvider {
  getFlower(id: string): Promise<Flower | null>;
  getFlowerByPublicIdentifier(
    publicIdentifier: string,
  ): Promise<Flower | null>;
  getFlowers(options?: FlowerQueryOptions): Promise<Flower[]>;
  countFlowers(options?: Omit<FlowerQueryOptions, "limit" | "offset">): Promise<number>;
  searchFlowers(query: string): Promise<Flower[]>;
  getFlowerParameters(id: string): Promise<FlowerParameter[]>;
  getFlowerLastUpdated(id: string): Promise<Date | null>;
}

export type { Flower, FlowerImage, FlowerParameter, FlowerQueryOptions };
