import type { PublicFlower } from "@/domain/flower";
import { isPublicIdentifier } from "@/lib/public-identifier";
import { getFlowerDataProvider } from "@/providers";
import { toPublicFlower } from "@/services/public-flower";

export type PublicPassportLoadResult =
  | { kind: "ready"; flower: PublicFlower }
  | { kind: "invalid_identifier" }
  | { kind: "not_available" }
  | { kind: "unavailable" };

export async function loadPublicPassport(
  publicIdentifier: string,
): Promise<PublicPassportLoadResult> {
  if (!isPublicIdentifier(publicIdentifier)) {
    return { kind: "invalid_identifier" };
  }

  try {
    const provider = getFlowerDataProvider();
    const flower = await provider.getFlowerByPublicIdentifier(publicIdentifier);

    if (!flower) {
      return { kind: "not_available" };
    }

    const publicFlower = toPublicFlower(flower);
    if (!publicFlower) {
      return { kind: "not_available" };
    }

    return { kind: "ready", flower: publicFlower };
  } catch {
    return { kind: "unavailable" };
  }
}
