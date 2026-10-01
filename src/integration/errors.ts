export class IntegrationNotConfiguredError extends Error {
  readonly code = "INTEGRATION_NOT_CONFIGURED";

  constructor(message = "VegPro integration is not configured yet.") {
    super(message);
    this.name = "IntegrationNotConfiguredError";
  }
}

export class UnsupportedSourceAdapterError extends Error {
  readonly code = "UNSUPPORTED_SOURCE_ADAPTER";

  constructor(source: string) {
    super(`No source adapter is available for: ${source}`);
    this.name = "UnsupportedSourceAdapterError";
  }
}

export function isIntegrationNotConfiguredError(
  error: unknown,
): error is IntegrationNotConfiguredError {
  return (
    error instanceof IntegrationNotConfiguredError ||
    (error instanceof Error && error.message.includes("not configured"))
  );
}
