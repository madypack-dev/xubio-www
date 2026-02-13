import { describe, expect, it } from "vitest";
import { toClienteDomain } from "@/modules/clientes/infrastructure/clientes.mapper";
import { clienteDtoSchema } from "@/modules/clientes/infrastructure/clientes.schemas";

describe("toClienteDomain", () => {
  it("maps all known backend fields for cliente detail", () => {
    const dto = clienteDtoSchema.parse({
      cliente_id: 123,
      nombre: "Cliente Demo",
      primerApellido: "Perez",
      segundoApellido: "Lopez",
      primerNombre: "Juan",
      otrosNombres: "Carlos",
      razonSocial: "Cliente Demo SA",
      nombreComercial: "Demo",
      identificacionTributaria: {
        ID: 80,
        id: 80,
        nombre: "CUIT",
        codigo: "CUIT"
      },
      digitoVerificacion: 8,
      categoriaFiscal: {
        ID: 1,
        id: 1,
        nombre: "Responsable Inscripto",
        codigo: "RI"
      },
      provincia: {
        provincia_id: 2,
        codigo: "B",
        nombre: "Buenos Aires",
        pais: "Argentina"
      },
      direccion: "Av. Siempreviva 123",
      email: "demo@example.com",
      telefono: "1140000000",
      codigoPostal: "1000",
      cuentaVenta_id: {
        ID: 11,
        id: 11,
        nombre: "Cuenta Venta",
        codigo: "CV-11"
      },
      cuentaCompra_id: {
        ID: 12,
        id: 12,
        nombre: "Cuenta Compra",
        codigo: "CC-12"
      },
      pais: {
        ID: "AR",
        id: "AR",
        nombre: "Argentina",
        codigo: "AR"
      },
      localidad: {
        ID: "CABA",
        id: "CABA",
        nombre: "CABA",
        codigo: "CABA"
      },
      usrCode: "CLI-123",
      listaPrecioVenta: {
        ID: 1,
        id: 1,
        nombre: "Lista Minorista",
        codigo: "LP1"
      },
      descripcion: "Cliente de testing",
      esclienteextranjero: 0,
      esProveedor: 1,
      cuit: "30-71234567-8",
      tipoDeOrganizacion: {
        ID: "EMP",
        id: "EMP",
        nombre: "Empresa",
        codigo: "EMP"
      },
      responsabilidadOrganizacionItem: [
        { ID: 1, id: 1, nombre: "Responsable", codigo: "RESP" },
        { ID: 2, id: 2, nombre: "Agente", codigo: "AGT" }
      ],
      CUIT: "30-71234567-8"
    });

    const cliente = toClienteDomain(dto);

    expect(cliente.clienteId).toBe("123");
    expect(cliente.primerApellido).toBe("Perez");
    expect(cliente.segundoApellido).toBe("Lopez");
    expect(cliente.primerNombre).toBe("Juan");
    expect(cliente.otrosNombres).toBe("Carlos");
    expect(cliente.nombreComercial).toBe("Demo");
    expect(cliente.digitoVerificacion).toBe("8");
    expect(cliente.provincia).toEqual({
      provinciaId: "2",
      codigo: "B",
      nombre: "Buenos Aires",
      pais: "Argentina"
    });
    expect(cliente.codigoPostal).toBe("1000");
    expect(cliente.listaPrecioVenta).toEqual({
      ID: "1",
      id: "1",
      nombre: "Lista Minorista",
      codigo: "LP1"
    });
    expect(cliente.esClienteExtranjero).toBe(false);
    expect(cliente.esProveedor).toBe(true);
    expect(cliente.tipoDeOrganizacion).toEqual({
      ID: "EMP",
      id: "EMP",
      nombre: "Empresa",
      codigo: "EMP"
    });
    expect(cliente.responsabilidadOrganizacionItem).toHaveLength(2);
    expect(cliente.cuitUpper).toBe("30-71234567-8");
  });

  it("filters invalid responsabilidadOrganizacionItem entries", () => {
    const dto = clienteDtoSchema.parse({
      cliente_id: " 999 ",
      responsabilidadOrganizacionItem: [
        null,
        "texto",
        {
          nombre: "Responsable",
          codigo: "RESP"
        }
      ]
    });

    const cliente = toClienteDomain(dto);

    expect(cliente.clienteId).toBe("999");
    expect(cliente.responsabilidadOrganizacionItem).toEqual([
      {
        ID: null,
        id: null,
        nombre: "Responsable",
        codigo: "RESP"
      }
    ]);
  });
});
