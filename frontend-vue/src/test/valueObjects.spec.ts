import { describe, expect, it } from "vitest";
import {
  toClienteId,
  toFechaComercial,
  toMoney,
  toProductoId,
  toTransaccionId
} from "@/shared/types/valueObjects";

describe("domain value objects", () => {
  it("normalizes IDs from string-like values", () => {
    expect(toTransaccionId(" 38925753 ")).toBe("38925753");
    expect(toClienteId(5182181)).toBe("5182181");
    expect(toProductoId("")).toBeNull();
  });

  it("validates FechaComercial from supported legacy formats", () => {
    expect(toFechaComercial("2023-06-01")).toBe("2023-06-01");
    expect(toFechaComercial("01/06/2023")).toBe("01/06/2023");
    expect(toFechaComercial("fecha-invalida")).toBeNull();
  });

  it("normalizes Money as finite numbers", () => {
    expect(toMoney(123.45)).toBe(123.45);
    expect(toMoney(" 300200 ")).toBe(300200);
    expect(toMoney(Number.NaN)).toBeNull();
  });
});
