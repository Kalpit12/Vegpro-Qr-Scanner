import { NextResponse } from "next/server";
import { getFlowerDataProvider } from "@/providers";
import { toPublicFlower } from "@/services/public-flower";
import { handleRouteError, jsonError } from "@/lib/api-response";

type RouteContext = {
  params: Promise<{ publicIdentifier: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { publicIdentifier } = await context.params;
    const provider = getFlowerDataProvider();
    const flower = await provider.getFlowerByPublicIdentifier(publicIdentifier);

    if (!flower) {
      return jsonError("Flower not found", 404);
    }

    const publicFlower = toPublicFlower(flower);
    if (!publicFlower) {
      return jsonError("Flower is not publicly available", 404);
    }

    return NextResponse.json({ data: publicFlower });
  } catch (error) {
    return handleRouteError(error);
  }
}
