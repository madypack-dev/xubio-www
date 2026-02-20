import { describe, expect, it } from "vitest";
import {
  buildGoToClienteLabel,
  buildGoToProductoLabel,
  buildGoToVendedorLabel,
  buildSelectRemitoIdLabel,
  formatDateDdMmYyyy,
  itemRowKey,
  rowKey
} from "@/modules/remitos/presentation/remitosViewFormatters";

describe("remitosViewFormatters", () => {
  it("builds stable row keys", () => {
    expect(
      rowKey({
        transaccionId: "10",
        numeroRemito: "R-1",
        fecha: "2024-01-10",
        observacion: "",
        clienteId: null,
        vendedorId: null,
        comisionVendedor: null,
        depositoId: null,
        circuitoContableId: null,
        items: []
      })
    ).toBe("10");

    expect(
      itemRowKey({
        transaccionCVItemId: null,
        transaccionId: "10",
        productoId: "20",
        descripcion: "",
        cantidad: null,
        precio: null
      })
    ).toBe("10-20");
  });

  it("builds fallback and detailed labels", () => {
    expect(buildSelectRemitoIdLabel(null)).toBe("Seleccionar remito");
    expect(buildSelectRemitoIdLabel("123")).toBe("Seleccionar remito 123");
    expect(buildGoToClienteLabel(null)).toBe("Abrir cliente");
    expect(buildGoToClienteLabel("9")).toBe("Abrir cliente 9");
    expect(buildGoToVendedorLabel(null)).toBe("Abrir vendedor");
    expect(buildGoToVendedorLabel("7")).toBe("Abrir vendedor 7");
    expect(buildGoToProductoLabel(null)).toBe("Abrir producto");
    expect(buildGoToProductoLabel("5")).toBe("Abrir producto 5");
  });

  it("formats legacy and iso dates", () => {
    expect(formatDateDdMmYyyy("2024-02-03")).toBe("03/02/2024");
    expect(formatDateDdMmYyyy("3/2/2024")).toBe("03/02/2024");
    expect(formatDateDdMmYyyy("")).toBe("-");
    expect(formatDateDdMmYyyy(null)).toBe("-");
    expect(formatDateDdMmYyyy("texto")).toBe("texto");
  });
});
