export class SyncTransportError extends Error {
  constructor(
    readonly code: "NETWORK_ERROR" | "HTTP_ERROR",
    readonly statusCode: number,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "SyncTransportError";
  }
}

// Classify at the fetch boundary, before Start decodes or rethrows server errors.
export async function fetchForOfflineSynchronization(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  let response: Response;
  try {
    response = await globalThis.fetch(input, init);
  } catch (error) {
    if (
      error instanceof TypeError &&
      [
        "Failed to fetch",
        "NetworkError when attempting to fetch resource.",
        "Load failed",
      ].includes(error.message)
    ) {
      throw new SyncTransportError(
        "NETWORK_ERROR",
        0,
        "Não foi possível completar o transporte da sincronização.",
        { cause: error },
      );
    }
    throw error;
  }

  if (!response.ok) {
    throw new SyncTransportError(
      "HTTP_ERROR",
      response.status,
      `O servidor recusou a sincronização (HTTP ${response.status}).`,
    );
  }

  return response;
}
