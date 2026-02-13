import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  HttpClientError,
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
});
