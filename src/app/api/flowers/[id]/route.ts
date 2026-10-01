import { NextResponse } from "next/server";
import { getFlowerDataProvider } from "@/providers";
import { updateFlowerSchema } from "@/schemas/flower";
import { updateFlowerRecord } from "@/services/flower-write";
import { handleRouteError, jsonError } from "@/lib/api-response";
import { getAuthUserId, requireAuthRoles } from "@/lib/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAuthRoles(["ADMIN", "BREEDER"]);

    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateFlowerSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(parsed.error.message, 400);
    }

    const userId = await getAuthUserId();
    const updated = await updateFlowerRecord(
      id,
      parsed.data,
      userId ? { userId } : undefined,
    );
    if (!updated) {
      return jsonError("Flower not found", 404);
    }

    const provider = getFlowerDataProvider();
    const flower = await provider.getFlower(id);

    return NextResponse.json({ data: flower });
  } catch (error) {
    return handleRouteError(error);
  }
}
