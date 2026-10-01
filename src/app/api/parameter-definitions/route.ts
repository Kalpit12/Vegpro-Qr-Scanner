import { NextResponse } from "next/server";
import {
  createParameterDefinitionSchema,
  updateParameterDefinitionSchema,
} from "@/schemas/catalog";
import {
  createParameterDefinition,
  listParameterDefinitions,
  updateParameterDefinition,
} from "@/services/catalog-write";
import { handleRouteError, jsonError } from "@/lib/api-response";
import { getAuthUserId, requireAuthRoles } from "@/lib/session";

export async function GET(request: Request) {
  try {
    await requireAuthRoles(["ADMIN", "BREEDER", "VIEWER"]);
    const activeOnly =
      new URL(request.url).searchParams.get("activeOnly") === "true";
    const data = await listParameterDefinitions(activeOnly);
    return NextResponse.json({ data });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAuthRoles(["ADMIN"]);
    const body = await request.json();
    const parsed = createParameterDefinitionSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.message, 400);
    }

    const userId = await getAuthUserId();
    if (!userId) {
      return jsonError("Unauthorized", 401);
    }

    const data = await createParameterDefinition(parsed.data, { userId });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAuthRoles(["ADMIN"]);
    const body = await request.json();
    const id = body.id as string | undefined;
    if (!id) {
      return jsonError("Parameter definition id is required", 400);
    }

    const parsed = updateParameterDefinitionSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.message, 400);
    }

    const userId = await getAuthUserId();
    if (!userId) {
      return jsonError("Unauthorized", 401);
    }

    const data = await updateParameterDefinition(id, parsed.data, { userId });
    if (!data) {
      return jsonError("Parameter definition not found", 404);
    }

    return NextResponse.json({ data });
  } catch (error) {
    return handleRouteError(error);
  }
}
