import { describe, expect, it } from "vitest";
import {
  dedupeBaseUrls,
  normalizeBaseUrl,
  parseApiBaseUrls,
  resolveApiBaseUrls
} from "@/shared/config/runtimeConfig";

describe("runtimeConfig base URL helpers", () => {
  it("normalizes trailing slash and whitespace", () => {
    expect(normalizeBaseUrl(" https://api.example.com/ ")).toBe("https://api.example.com");
    expect(normalizeBaseUrl("   ")).toBe("");
  });

  it("parses list values from CSV/newlines", () => {
    expect(parseApiBaseUrls("https://a.example.com, https://b.example.com\nhttps://c.example.com"))
      .toEqual([
        "https://a.example.com",
        "https://b.example.com",
        "https://c.example.com"
      ]);
  });

  it("dedupes normalized URLs preserving order", () => {
    expect(
      dedupeBaseUrls([
        "https://a.example.com/",
        "https://a.example.com",
        " https://b.example.com/ "
      ])
    ).toEqual(["https://a.example.com", "https://b.example.com"]);
  });

  it("resolves up to 3 URLs from VITE_API_BASE_URLS first", () => {
    expect(
      resolveApiBaseUrls({
        envApiBaseUrls:
          "https://one.example.com, https://two.example.com, https://three.example.com, https://four.example.com",
        defaultApiBaseUrls: ["https://default.example.com"]
      })
    ).toEqual([
      "https://one.example.com",
      "https://two.example.com",
      "https://three.example.com"
    ]);
  });

  it("falls back to default URL when env vars are missing", () => {
    expect(
      resolveApiBaseUrls({
        envApiBaseUrls: null,
        defaultApiBaseUrls: ["https://default.example.com", "https://backup.example.com"]
      })
    ).toEqual(["https://default.example.com", "https://backup.example.com"]);
  });
});
