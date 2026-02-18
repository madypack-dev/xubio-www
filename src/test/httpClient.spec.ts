import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  HttpClientError,
  HttpNetworkError,
  HttpTimeoutError,
  httpClient
} from "@/shared/lib/http/httpClient";

const originalFetch = globalThis.fetch;

describe("httpClient", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    globalThis.fetch = originalFetch;
  });

  it("returns parsed json on successful GET", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const response = await httpClient.get<{ ok: boolean }>("/api/ping");

    expect(response.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws HttpClientError on non-2xx response", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response("Not Found", { status: 404 })) as unknown as typeof fetch;

    await expect(httpClient.get("/api/missing")).rejects.toBeInstanceOf(
      HttpClientError
    );
  });

  it("surfaces ngrok tunnel errors with actionable message", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response("<!doctype html><html><body>Ngrok Error</body></html>", {
        status: 404,
        headers: {
          "Content-Type": "text/html",
          "ngrok-error-code": "ERR_NGROK_3200"
        }
      })
    ) as unknown as typeof fetch;

    await expect(httpClient.get("https://demo.ngrok-free.dev/API/1.1/remitoVentaBean")).rejects.toThrow(
      /tunel ngrok devolvio ERR_NGROK_3200/i
    );
  });

  it("throws HttpClientError when server returns html instead of json", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response("<!doctype html><html><body>Not JSON</body></html>", {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      })
    ) as unknown as typeof fetch;

    await expect(httpClient.get("/API/1.1/remitoVentaBean")).rejects.toThrow(
      /Se esperaba JSON y se recibio HTML/i
    );
  });

  it("throws HttpTimeoutError when request exceeds timeout", async () => {
    globalThis.fetch = vi
      .fn()
      .mockImplementation(
        (_url: RequestInfo | URL, init?: RequestInit) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => {
              reject(new DOMException("The operation was aborted.", "AbortError"));
            });
          })
      ) as unknown as typeof fetch;

    const pendingRequest = httpClient.get("/api/slow", { timeoutMs: 5 });
    const assertion = expect(pendingRequest).rejects.toBeInstanceOf(HttpTimeoutError);
    await vi.advanceTimersByTimeAsync(10);
    await assertion;
  });

  it("maps failed fetch to HttpNetworkError with CORS hint on cross-origin URLs", async () => {
    globalThis.fetch = vi
      .fn()
      .mockRejectedValue(new TypeError("Failed to fetch")) as unknown as typeof fetch;

    await expect(
      httpClient.get("https://demo.ngrok-free.dev/API/1.1/remitoVentaBean")
    ).rejects.toBeInstanceOf(HttpNetworkError);

    await expect(
      httpClient.get("https://demo.ngrok-free.dev/API/1.1/remitoVentaBean")
    ).rejects.toThrow(/Posible bloqueo CORS\/preflight/i);
  });

  it("injects ngrok bypass header automatically for ngrok URLs", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await httpClient.get("https://demo.ngrok-free.dev/API/1.1/remitoVentaBean");

    const fetchInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const requestHeaders = new Headers(fetchInit?.headers);
    expect(requestHeaders.get("ngrok-skip-browser-warning")).toBe("true");
    expect(requestHeaders.get("accept")).toBe("application/json");
  });
});
