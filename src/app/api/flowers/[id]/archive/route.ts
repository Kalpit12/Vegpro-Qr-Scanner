import { NextResponse } from "next/server";
import { getFlowerDataProvider } from "@/providers";
import { archiveFlowerRecord } from "@/services/flower-write";
import { handleRouteError, jsonError } from "@/lib/api-response";
import { getAuthUserId, requireAuthRoles } from "@/lib/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    await requireAuthRoles(["ADMIN", "BREEDER"]);

    const { id } = await context.params;
    const userId = await getAuthUserId();
    const archived = await archiveFlowerRecord(
      id,
      userId ? { userId } : undefined,
    );

    if (!archived) {
      return jsonError("Flower not found", 404);
    }

    const provider = getFlowerDataProvider();
    const flower = await provider.getFlower(id);

    return NextResponse.json({ data: flower });
  } catch (error) {
    return handleRouteError(error);
  }
}
