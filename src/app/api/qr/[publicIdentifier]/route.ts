import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/authz";
import { jsonError, handleRouteError } from "@/lib/api-response";
import { isPublicIdentifier } from "@/lib/public-identifier";
import { getFlowerDataProvider } from "@/providers";
import { toPublicFlower } from "@/services/public-flower";
import {
  generateFlowerQrPng,
  generateFlowerQrSvg,
} from "@/services/qr";

type RouteContext = {
  params: Promise<{ publicIdentifier: string }>;
};

async function canGenerateQr(publicIdentifier: string) {
  const provider = getFlowerDataProvider();
  const flower = await provider.getFlowerByPublicIdentifier(publicIdentifier);

  if (!flower) {
    return { allowed: false as const, reason: "not_found" as const };
  }

  const session = await auth();
  if (hasRole(session, ["ADMIN", "BREEDER", "VIEWER"])) {
    return { allowed: true as const, flower };
  }

  if (!toPublicFlower(flower)) {
    return { allowed: false as const, reason: "not_public" as const };
  }

  return { allowed: true as const, flower };
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { publicIdentifier } = await context.params;

    if (!isPublicIdentifier(publicIdentifier)) {
      return jsonError("Invalid public identifier", 404);
    }

    const access = await canGenerateQr(publicIdentifier);
    if (!access.allowed) {
      return jsonError("Not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") ?? "png";
    const download = searchParams.get("download") === "1";

    if (format === "svg") {
      const svg = await generateFlowerQrSvg(publicIdentifier);
      return new NextResponse(svg, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Cache-Control": "public, max-age=86400, immutable",
          "Content-Disposition": `${
            download ? "attachment" : "inline"
          }; filename="${publicIdentifier}.svg"`,
        },
      });
    }

    if (format !== "png") {
      return jsonError("Unsupported format", 400);
    }

    const png = await generateFlowerQrPng(publicIdentifier);
    return new NextResponse(new Uint8Array(png), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, immutable",
        "Content-Disposition": `${
          download ? "attachment" : "inline"
        }; filename="${publicIdentifier}.png"`,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_PUBLIC_IDENTIFIER"
    ) {
      return jsonError("Invalid public identifier", 404);
    }
    return handleRouteError(error);
  }
}
