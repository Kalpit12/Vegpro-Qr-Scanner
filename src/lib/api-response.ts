import { NextResponse } from "next/server";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof Error && error.message === "FORBIDDEN") {
    return jsonError("Forbidden", 403);
  }
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return jsonError("Unauthorized", 401);
  }
  if (error instanceof Error && error.message.startsWith("INVALID_PARAMETER:")) {
    return jsonError(error.message.replace("INVALID_PARAMETER:", "").trim(), 400);
  }
  if (error instanceof Error && error.message.startsWith("INVALID_RELATION:")) {
    return jsonError(error.message.replace("INVALID_RELATION:", "").trim(), 400);
  }
  console.error(error);
  return jsonError("Internal server error", 500);
}
