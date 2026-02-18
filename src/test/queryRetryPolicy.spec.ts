import { describe, expect, it } from "vitest";
import { HttpClientError, HttpNetworkError } from "@/shared/lib/http/httpClient";
import { decideHttpQueryRetry } from "@/shared/lib/http/queryRetryPolicy";

describe("queryRetryPolicy", () => {
  it("disables retry for ngrok tunnel diagnostics", () => {
    const error = new HttpClientError({
      status: 200,
      url: "https://demo.ngrok-free.dev/API/1.1/remitoVentaBean",
      message: "El tunel ngrok devolvio ERR_NGROK_6024 para https://demo.ngrok-free.dev/API/1.1/remitoVentaBean",
      bodyText: "<!doctype html><html><body>ngrok</body></html>",
      requestId: "http-1"
    });

    const decision = decideHttpQueryRetry({
      failureCount: 0,
      error,
      maxRetries: 2
    });

    expect(decision.allowRetry).toBe(false);
    expect(decision.diagnosis?.kind).toBe("ngrok_tunnel");
  });

  it("disables retry for cors preflight errors", () => {
    const error = new HttpNetworkError({
      url: "https://demo.ngrok-free.dev/API/1.1/remitoVentaBean",
      likelyCors: true,
      originalMessage: "Failed to fetch",
      message: "No se pudo acceder por CORS",
      requestId: "http-2"
    });

    const decision = decideHttpQueryRetry({
      failureCount: 0,
      error,
      maxRetries: 2
    });

    expect(decision.allowRetry).toBe(false);
    expect(decision.diagnosis?.kind).toBe("cors_preflight");
  });

  it("allows retry for transient network errors below max retries", () => {
    const decision = decideHttpQueryRetry({
      failureCount: 0,
      error: new TypeError("Failed to fetch"),
      maxRetries: 2
    });

    expect(decision.allowRetry).toBe(true);
  });
});
