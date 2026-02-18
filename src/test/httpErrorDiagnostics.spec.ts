import { describe, expect, it } from "vitest";
import {
  HttpClientError,
  HttpNetworkError,
  HttpTimeoutError
} from "@/shared/lib/http/httpClient";
import { diagnoseHttpError } from "@/shared/lib/http/httpErrorDiagnostics";

describe("httpErrorDiagnostics", () => {
  it("detects ngrok tunnel failures from HttpClientError message", () => {
    const error = new HttpClientError({
      status: 404,
      url: "https://demo.ngrok-free.dev/API/1.1/remitoVentaBean",
      message: "El tunel ngrok devolvio ERR_NGROK_3200 para https://demo.ngrok-free.dev/API/1.1/remitoVentaBean.",
      bodyText: "<!doctype html><html>Ngrok</html>"
    });

    const diagnosis = diagnoseHttpError(error);

    expect(diagnosis.kind).toBe("ngrok_tunnel");
    expect(diagnosis.retryable).toBe(false);
    expect(diagnosis.ngrokErrorCode).toBe("ERR_NGROK_3200");
  });

  it("marks timeouts as retryable", () => {
    const diagnosis = diagnoseHttpError(
      new HttpTimeoutError({
        timeoutMs: 15000,
        url: "/API/1.1/remitoVentaBean"
      })
    );

    expect(diagnosis.kind).toBe("timeout");
    expect(diagnosis.retryable).toBe(true);
  });

  it("marks html payload as non-retryable parsing mismatch", () => {
    const diagnosis = diagnoseHttpError(
      new HttpClientError({
        status: 200,
        url: "/API/1.1/remitoVentaBean",
        message: "Se esperaba JSON y se recibio HTML",
        bodyText: "<!doctype html><html><body>Error</body></html>"
      })
    );

    expect(diagnosis.kind).toBe("html_instead_of_json");
    expect(diagnosis.retryable).toBe(false);
  });

  it("classifies likely CORS preflight failures as non-retryable", () => {
    const diagnosis = diagnoseHttpError(
      new HttpNetworkError({
        url: "https://demo.ngrok-free.dev/API/1.1/remitoVentaBean",
        likelyCors: true,
        originalMessage: "Failed to fetch",
        message: "No se pudo acceder a https://demo.ngrok-free.dev/API/1.1/remitoVentaBean. Posible bloqueo CORS/preflight desde el navegador."
      })
    );

    expect(diagnosis.kind).toBe("cors_preflight");
    expect(diagnosis.retryable).toBe(false);
    expect(diagnosis.likelyCors).toBe(true);
  });
});
