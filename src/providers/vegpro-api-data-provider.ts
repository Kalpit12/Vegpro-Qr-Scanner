import type {
  Flower,
  FlowerParameter,
  FlowerQueryOptions,
} from "@/domain/flower";
import type { FlowerDataProvider } from "./flower-data-provider";
import { IntegrationNotConfiguredError } from "@/integration/errors";

function notConfigured(): never {
  throw new IntegrationNotConfiguredError(
    "VegProApiDataProvider is not active. Flower reads continue through the Demo PostgreSQL provider until VegPro integration is configured.",
  );
}

/**
 * Placeholder FlowerDataProvider for a future VegPro API connector.
 * Must not be selected by the factory until configuration and contract exist.
 */
export class VegProApiDataProvider implements FlowerDataProvider {
  async getFlower(_id: string): Promise<Flower | null> {
    void _id;
    return notConfigured();
  }

  async getFlowerByPublicIdentifier(
    _publicIdentifier: string,
  ): Promise<Flower | null> {
    void _publicIdentifier;
    return notConfigured();
  }

  async getFlowers(_options?: FlowerQueryOptions): Promise<Flower[]> {
    void _options;
    return notConfigured();
  }

  async countFlowers(
    _options?: Omit<FlowerQueryOptions, "limit" | "offset">,
  ): Promise<number> {
    void _options;
    return notConfigured();
  }

  async searchFlowers(_query: string): Promise<Flower[]> {
    void _query;
    return notConfigured();
  }

  async getFlowerParameters(_id: string): Promise<FlowerParameter[]> {
    void _id;
    return notConfigured();
  }

  async getFlowerLastUpdated(_id: string): Promise<Date | null> {
    void _id;
    return notConfigured();
  }
}
