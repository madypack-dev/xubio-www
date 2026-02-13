import { describe, expect, it } from "vitest";
import { toVendedorDomain } from "@/modules/vendedores/infrastructure/vendedores.mapper";
import { vendedorDtoSchema } from "@/modules/vendedores/infrastructure/vendedores.schemas";

describe("toVendedorDomain", () => {
  it("maps vendedor using legacy id and person aliases", () => {
    const dto = vendedorDtoSchema.parse({
      vendedor_id: 4811,
      primerNombre: "Juan",
      primerApellido: "Perez",
      email: "juan.perez@example.com",
      telefono: "1144441111",
      direccion: "Av. Libertador 101",
      zona: "Norte"
    });

    const vendedor = toVendedorDomain(dto);

    expect(vendedor.vendedorId).toBe("4811");
    expect(vendedor.nombre).toBe("Juan");
    expect(vendedor.apellido).toBe("Perez");
    expect(vendedor.email).toBe("juan.perez@example.com");
    expect(vendedor.telefono).toBe("1144441111");
    expect(vendedor.direccion).toBe("Av. Libertador 101");
    expect(vendedor.raw.zona).toBe("Norte");
  });

  it("falls back to id aliases when vendedor_id is absent", () => {
    const dto = vendedorDtoSchema.parse({
      ID: " 777 ",
      nombre: "Ana",
      apellido: "Lopez"
    });

    const vendedor = toVendedorDomain(dto);

    expect(vendedor.vendedorId).toBe("777");
    expect(vendedor.nombre).toBe("Ana");
    expect(vendedor.apellido).toBe("Lopez");
  });
});
