import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  buildCandidateBaseUrls,
  fetchLegacyByIdOrNull,
  fetchLegacyList,
  getMockByIdOrNull,
  getMockRecordByIdOrNull,
  shouldFallback
} from "@/shared/lib/http/legacyRepository";
import {
  HttpClientError,
  HttpNetworkError,
  HttpTimeoutError
} from "@/shared/lib/http/httpClient";

const originalFetch = globalThis.fetch;
const itemDtoSchema = z.object({
  id: z.string(),
  nombre: z.string().optional()
});

describe("legacyRepository helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = originalFetch;
  });

  it("parses list payloads and applies transform", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ items: [{ id: "1" }, { id: "2" }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    ) as unknown as typeof fetch;

    const result = await fetchLegacyList({
      endpoint: "/api/items",
      schema: itemDtoSchema,
      context: "items.list",
      transform: (dtos) => dtos.map((dto) => dto.id)
    });

    expect(result).toEqual(["1", "2"]);
  });

  it("normalizes trailing slash in baseUrl to avoid duplicated separators", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ items: [{ id: "1" }] }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      ) as unknown as typeof fetch;
    globalThis.fetch = fetchMock;

    await fetchLegacyList({
      baseUrl: "https://api.example.com/",
      endpoint: "/api/items",
      schema: itemDtoSchema,
      context: "items.list",
      transform: (dtos) => dtos.map((dto) => dto.id)
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/api/items",
      expect.any(Object)
    );
  });

  it("returns null on 404 for detail endpoints", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response("Not Found", { status: 404 })) as unknown as typeof fetch;
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const result = await fetchLegacyByIdOrNull({
      endpoint: "/api/items",
      id: "99",
      schema: itemDtoSchema,
      context: "items.getById",
      map: (dto) => dto.id,
      notFound: {
        message: "[MVP] Item no encontrado",
        meta: { itemId: "99" }
      }
    });

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith("[MVP] Item no encontrado", { itemId: "99" });
  });

  it("returns deep-cloned records from mock dictionaries", () => {
    const record = {
      "10": { id: "10", nombre: "Original" }
    };

    const value = getMockRecordByIdOrNull({
      record,
      id: "10",
      notFound: {
        message: "missing",
        meta: { id: "10" }
      }
    });

    expect(value).not.toBeNull();
    expect(value).toEqual({ id: "10", nombre: "Original" });
    if (!value) {
      return;
    }

    value.nombre = "Changed";
    expect(record["10"].nombre).toBe("Original");
  });

  it("returns null and logs when mock array item is missing", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const value = getMockByIdOrNull({
      collection: [{ id: "1", nombre: "Uno" }],
      id: "2",
      resolveItemId: (item) => item.id,
      notFound: {
        message: "[MVP] Item no encontrado en mock",
        meta: { itemId: "2" }
      }
    });

    expect(value).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith("[MVP] Item no encontrado en mock", {
      itemId: "2"
    });
  });

  it("uses URL2 when URL1 fails with network error", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [{ id: "2" }] }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      ) as unknown as typeof fetch;
    globalThis.fetch = fetchMock;

    const result = await fetchLegacyList({
      baseUrls: ["https://api-1.example.com", "https://api-2.example.com"],
      endpoint: "/api/items",
      schema: itemDtoSchema,
      context: "items.list",
      transform: (dtos) => dtos.map((dto) => dto.id)
    });

    expect(result).toEqual(["2"]);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://api-1.example.com/api/items",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://api-2.example.com/api/items",
      expect.any(Object)
    );
  });

  it("uses URL3 when URL1 and URL2 fail with 5xx", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("bad gateway", { status: 502 }))
      .mockResolvedValueOnce(new Response("service unavailable", { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [{ id: "3" }] }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      ) as unknown as typeof fetch;
    globalThis.fetch = fetchMock;

    const result = await fetchLegacyList({
      baseUrls: [
        "https://api-1.example.com",
        "https://api-2.example.com",
        "https://api-3.example.com"
      ],
      endpoint: "/api/items",
      schema: itemDtoSchema,
      context: "items.list",
      transform: (dtos) => dtos.map((dto) => dto.id)
    });

    expect(result).toEqual(["3"]);
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "https://api-3.example.com/api/items",
      expect.any(Object)
    );
  });

  it("does not fallback on 404 in detail endpoint", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("Not Found", { status: 404 })) as unknown as typeof fetch;
    globalThis.fetch = fetchMock;
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const result = await fetchLegacyByIdOrNull({
      baseUrls: ["https://api-1.example.com", "https://api-2.example.com"],
      endpoint: "/api/items",
      id: "999",
      schema: itemDtoSchema,
      context: "items.getById",
      map: (dto) => dto.id,
      notFound: {
        message: "missing",
        meta: { id: "999" }
      }
    });

    expect(result).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith("missing", { id: "999" });
  });

  it("builds candidate URLs from list and dedupes entries", () => {
    expect(
      buildCandidateBaseUrls({
        baseUrl: "https://api-legacy.example.com",
        baseUrls: ["https://api-1.example.com/", "https://api-1.example.com", ""]
      })
    ).toEqual(["https://api-1.example.com", ""]);
  });

  it("marks network, timeout and 5xx as fallback errors", () => {
    expect(
      shouldFallback(
        new HttpNetworkError({
          url: "https://api-1.example.com",
          likelyCors: false,
          originalMessage: "Failed to fetch",
          message: "network"
        })
      )
    ).toBe(true);
    expect(
      shouldFallback(
        new HttpTimeoutError({ timeoutMs: 1000, url: "https://api-1.example.com" })
      )
    ).toBe(true);
    expect(
      shouldFallback(
        new HttpClientError({
          status: 503,
          url: "https://api-1.example.com",
          bodyText: "down",
          message: "down"
        })
      )
    ).toBe(true);
    expect(
      shouldFallback(
        new HttpClientError({
          status: 404,
          url: "https://api-1.example.com",
          bodyText: "missing",
          message: "missing"
        })
      )
    ).toBe(false);
  });
});
