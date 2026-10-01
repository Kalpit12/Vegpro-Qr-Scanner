import { NextResponse } from "next/server";
import { syncRequestSchema } from "@/schemas/integration";
import { runSynchronization } from "@/services/sync-service";
import { handleRouteError, jsonError } from "@/lib/api-response";
import { requireAuthRoles } from "@/lib/session";

export async function POST(request: Request) {
  try {
    await requireAuthRoles(["ADMIN"]);

    const body = await request.json();
    const parsed = syncRequestSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.message, 400);
    }

    if (parsed.data.mode === "single" && !parsed.data.externalId) {
      return jsonError("externalId is required for single-flower sync", 400);
    }

    const result = await runSynchronization(parsed.data);

    return NextResponse.json({ data: result });
  } catch (error) {
    return handleRouteError(error);
  }
}
