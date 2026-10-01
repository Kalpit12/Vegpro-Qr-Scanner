import type { SourceSystem } from "@/domain/flower";
import { DemoSourceAdapter } from "./adapters/demo-source-adapter";
import { VegProSourceAdapter } from "./adapters/vegpro-source-adapter";
import { UnsupportedSourceAdapterError } from "./errors";
import type { SourceAdapter } from "./source-adapter";

const demoAdapter = new DemoSourceAdapter();
const vegProAdapter = new VegProSourceAdapter();

export function getSourceAdapter(source: SourceSystem): SourceAdapter {
  if (source === "Demo") {
    return demoAdapter;
  }
  if (source === "VegPro") {
    return vegProAdapter;
  }
  throw new UnsupportedSourceAdapterError(String(source));
}

export function getConfiguredSourceAdapter(): SourceAdapter {
  return demoAdapter;
}
