import type { FlowerDataProvider } from "./flower-data-provider";
import {
  MockFlowerDataProvider,
  getMockFlowerDataProviderInstance,
} from "./mock-flower-data-provider";
import { VegProApiDataProvider } from "./vegpro-api-data-provider";

export type ActiveFlowerDataProviderKind = "demo-postgres" | "vegpro-api";

/**
 * Runtime data reads always use the demo PostgreSQL-backed provider until
 * VegPro configuration and contract are explicitly enabled.
 */
export function getActiveFlowerDataProviderKind(): ActiveFlowerDataProviderKind {
  return "demo-postgres";
}

let vegProProviderInstance: VegProApiDataProvider | undefined;

export function getFlowerDataProvider(): FlowerDataProvider {
  if (getActiveFlowerDataProviderKind() === "vegpro-api") {
    if (!vegProProviderInstance) {
      vegProProviderInstance = new VegProApiDataProvider();
    }
    return vegProProviderInstance;
  }

  return getMockFlowerDataProviderInstance();
}

export { MockFlowerDataProvider };
