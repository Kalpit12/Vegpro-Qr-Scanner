import { NextResponse } from "next/server";
import {
  createCategorySchema,
  updateCategorySchema,
} from "@/schemas/catalog";
import {
  createCategory,
  listCategories,
  updateCategory,
} from "@/services/catalog-write";
import { handleRouteError, jsonError } from "@/lib/api-response";
import { getAuthUserId, requireAuthRoles } from "@/lib/session";

export async function GET(request: Request) {
  try {
    await requireAuthRoles(["ADMIN", "BREEDER", "VIEWER"]);
    const activeOnly =
      new URL(request.url).searchParams.get("activeOnly") === "true";
    const data = await listCategories(activeOnly);
    return NextResponse.json({ data });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAuthRoles(["ADMIN"]);
    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.message, 400);
    }

    const userId = await getAuthUserId();
    if (!userId) {
      return jsonError("Unauthorized", 401);
    }

    const data = await createCategory(parsed.data, { userId });
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
      return jsonError("Category id is required", 400);
    }

    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.message, 400);
    }

    const userId = await getAuthUserId();
    if (!userId) {
      return jsonError("Unauthorized", 401);
    }

    const data = await updateCategory(id, parsed.data, { userId });
    if (!data) {
      return jsonError("Category not found", 404);
    }

    return NextResponse.json({ data });
  } catch (error) {
    return handleRouteError(error);
  }
}
