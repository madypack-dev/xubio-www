import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  fetchLegacyByIdOrNull,
  fetchLegacyList,
  getMockByIdOrNull,
  getMockRecordByIdOrNull
} from "@/shared/lib/http/legacyRepository";

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
});
