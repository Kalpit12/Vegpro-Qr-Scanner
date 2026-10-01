import { isPublicIdentifier } from "@/lib/public-identifier";

export function getAppPublicBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!base) {
    throw new Error("NEXT_PUBLIC_APP_URL is not set");
  }
  return base.replace(/\/$/, "");
}

export function buildFlowerPublicPath(publicIdentifier: string): string {
  if (!isPublicIdentifier(publicIdentifier)) {
    throw new Error("INVALID_PUBLIC_IDENTIFIER");
  }
  return `/flowers/${publicIdentifier}`;
}

export function buildFlowerPublicUrl(publicIdentifier: string): string {
  return `${getAppPublicBaseUrl()}${buildFlowerPublicPath(publicIdentifier)}`;
}
