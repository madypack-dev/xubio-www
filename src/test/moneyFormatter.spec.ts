import { describe, expect, it } from "vitest";
import { formatMoney } from "@/shared/lib/formatters/money";

describe("formatMoney", () => {
  it("formatea miles con coma y decimales con punto", () => {
    expect(formatMoney(1234.5)).toBe("1,234.50");
    expect(formatMoney(1000000)).toBe("1,000,000.00");
  });

  it("retorna '-' para valores vacios o invalidos", () => {
    expect(formatMoney(null)).toBe("-");
    expect(formatMoney(undefined)).toBe("-");
    expect(formatMoney(Number.NaN)).toBe("-");
  });
});

