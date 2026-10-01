import { NextResponse } from "next/server";
import { flowerListQuerySchema } from "@/schemas/flower";
import { createFlowerSchema } from "@/schemas/flower";
import { getFlowerDataProvider } from "@/providers";
import { createFlowerRecord } from "@/services/flower-write";
import { handleRouteError, jsonError } from "@/lib/api-response";
import { getAuthUserId, requireAuthRoles } from "@/lib/session";

function toListItem(flower: Awaited<
  ReturnType<ReturnType<typeof getFlowerDataProvider>["getFlower"]>
>) {
  if (!flower) {
    return null;
  }
  return {
        id: flower.id,
        publicIdentifier: flower.publicIdentifier,
        varietyCode: flower.varietyCode,
        name: flower.name,
        categoryId: flower.categoryId,
        category: flower.category,
    flowerType: flower.flowerType,
    status: flower.status,
    developmentStage: flower.developmentStage,
    publicVisible: flower.publicVisible,
    featured: flower.featured,
    updatedAt: flower.updatedAt,
    source: flower.source,
  };
}

export async function GET(request: Request) {
  try {
    await requireAuthRoles(["ADMIN", "BREEDER", "VIEWER"]);

    const params = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = flowerListQuerySchema.safeParse(params);

    if (!parsed.success) {
      return jsonError(parsed.error.message, 400);
    }

    const page = parsed.data.page ?? 1;
    const pageSize = parsed.data.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const provider = getFlowerDataProvider();
    const queryOptions = {
      search: parsed.data.search,
      status: parsed.data.status,
      categoryId: parsed.data.categoryId,
      publicVisible: parsed.data.publicVisible,
      includeArchived: parsed.data.includeArchived,
      sortBy: parsed.data.sortBy,
      sortOrder: parsed.data.sortOrder,
    };

    const [flowers, total] = await Promise.all([
      provider.getFlowers({ ...queryOptions, limit: pageSize, offset }),
      provider.countFlowers(queryOptions),
    ]);

    return NextResponse.json({
      data: flowers.map((flower) => toListItem(flower)),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAuthRoles(["ADMIN", "BREEDER"]);

    const body = await request.json();
    const parsed = createFlowerSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(parsed.error.message, 400);
    }

    const userId = await getAuthUserId();
    const created = await createFlowerRecord(
      parsed.data,
      userId ? { userId } : undefined,
    );
    const provider = getFlowerDataProvider();
    const flower = await provider.getFlower(created.recordId);

    return NextResponse.json({ data: flower }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
