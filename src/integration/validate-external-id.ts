const EXTERNAL_ID_PATTERN = /^[A-Za-z0-9._-]{1,128}$/;

export function validateSourceExternalId(externalId: string): {
  valid: boolean;
  message?: string;
} {
  const trimmed = externalId.trim();
  if (!trimmed) {
    return { valid: false, message: "External ID is required" };
  }
  if (trimmed.length > 128) {
    return { valid: false, message: "External ID is too long" };
  }
  if (!EXTERNAL_ID_PATTERN.test(trimmed)) {
    return {
      valid: false,
      message:
        "External ID must use letters, numbers, dots, underscores, or hyphens only",
    };
  }
  return { valid: true };
}

/** publicIdentifier (VP-####) must never be used as a VegPro external key. */
export function assertExternalIdIsNotPublicIdentifier(
  externalId: string,
  publicIdentifier?: string,
): void {
  if (publicIdentifier && externalId === publicIdentifier) {
    throw new Error(
      "INVALID_EXTERNAL_ID: Source external ID must not equal platform publicIdentifier",
    );
  }
}
