import type { Cliente } from "@/modules/clientes/domain";
import type { ComprobanteVenta } from "@/modules/comprobantes/domain";
import type { ListaPrecio } from "@/modules/listas-precio/domain";
import type { Producto } from "@/modules/productos/domain";
import type { Remito } from "@/modules/remitos/domain";
import type { Vendedor } from "@/modules/vendedores/domain";

export const MOCK_REMITOS: Remito[] = [
  {
    transaccionId: "38925753",
    numeroRemito: "X-0001-00000064",
    fecha: "2023-06-01",
    observacion: "VALOR DECLARADO $340.500",
    clienteId: "5182181",
    vendedorId: "4811",
    comisionVendedor: 0,
    depositoId: "-2",
    circuitoContableId: "-2",
    items: [
      {
        transaccionCVItemId: "48344936",
        transaccionId: "38925753",
        productoID: "1672624",
        productoid: "1672624",
        productoId: "1672624",
        descripcion: "12.5x8x19 Bolsa Marron 100g C/M",
        cantidad: 4000,
        precio: 0
      }
    ]
  },
  {
    transaccionId: "38925754",
    numeroRemito: "X-0001-00000065",
    fecha: "2023-06-02",
    observacion: "ENTREGA PARCIAL",
    clienteId: "5182182",
    vendedorId: "4812",
    comisionVendedor: 0,
    depositoId: "-2",
    circuitoContableId: "-2",
    items: [
      {
        transaccionCVItemId: "48344937",
        transaccionId: "38925754",
        productoID: "1672625",
        productoid: "1672625",
        productoId: "1672625",
        descripcion: "15x10x25 Bolsa Marron 120g C/M",
        cantidad: 2500,
        precio: 0
      }
    ]
  }
];

export const MOCK_CLIENTES: Record<string, Cliente> = {
  "5182181": {
    clienteId: "5182181",
    nombre: "Cliente Demo SA",
    primerApellido: "",
    segundoApellido: "",
    primerNombre: "",
    otrosNombres: "",
    razonSocial: "Cliente Demo Sociedad Anonima",
    nombreComercial: "Cliente Demo",
    identificacionTributaria: {
      ID: "80",
      id: "80",
      nombre: "CUIT",
      codigo: "CUIT"
    },
    digitoVerificacion: "8",
    categoriaFiscal: {
      ID: "1",
      id: "1",
      nombre: "Responsable Inscripto",
      codigo: "RI"
    },
    provincia: {
      provinciaId: "2",
      codigo: "B",
      nombre: "Buenos Aires",
      pais: "Argentina"
    },
    direccion: "Av. Siempreviva 123",
    email: "cliente.demo@example.com",
    telefono: "+54 11 4000-0000",
    codigoPostal: "1000",
    cuentaVenta: null,
    cuentaCompra: null,
    pais: { ID: "AR", id: "AR", nombre: "Argentina", codigo: "AR" },
    localidad: { ID: "CABA", id: "CABA", nombre: "CABA", codigo: "CABA" },
    usrCode: "CLI-5182181",
    listaPrecioVenta: { ID: "1", id: "1", nombre: "Lista Minorista", codigo: "LP1" },
    descripcion: "Cliente de prueba para MVP",
    esClienteExtranjero: false,
    esProveedor: false,
    cuit: "30-71234567-8",
    tipoDeOrganizacion: {
      ID: "EMP",
      id: "EMP",
      nombre: "Empresa",
      codigo: "EMP"
    },
    responsabilidadOrganizacionItem: [],
    cuitUpper: "30-71234567-8"
  },
  "5182182": {
    clienteId: "5182182",
    nombre: "Distribuidora Norte SRL",
    primerApellido: "",
    segundoApellido: "",
    primerNombre: "",
    otrosNombres: "",
    razonSocial: "Distribuidora Norte SRL",
    nombreComercial: "Distribuidora Norte",
    identificacionTributaria: {
      ID: "80",
      id: "80",
      nombre: "CUIT",
      codigo: "CUIT"
    },
    digitoVerificacion: "3",
    categoriaFiscal: {
      ID: "1",
      id: "1",
      nombre: "Responsable Inscripto",
      codigo: "RI"
    },
    provincia: {
      provinciaId: "2",
      codigo: "B",
      nombre: "Buenos Aires",
      pais: "Argentina"
    },
    direccion: "Calle 50 1400",
    email: "norte@example.com",
    telefono: "+54 221 500-1000",
    codigoPostal: "1900",
    cuentaVenta: null,
    cuentaCompra: null,
    pais: { ID: "AR", id: "AR", nombre: "Argentina", codigo: "AR" },
    localidad: { ID: "LP", id: "LP", nombre: "La Plata", codigo: "LP" },
    usrCode: "CLI-5182182",
    listaPrecioVenta: { ID: "2", id: "2", nombre: "Lista Mayorista", codigo: "LP2" },
    descripcion: "Cliente de prueba para MVP",
    esClienteExtranjero: false,
    esProveedor: false,
    cuit: "30-70987654-3",
    tipoDeOrganizacion: {
      ID: "EMP",
      id: "EMP",
      nombre: "Empresa",
      codigo: "EMP"
    },
    responsabilidadOrganizacionItem: [],
    cuitUpper: "30-70987654-3"
  }
};

export const MOCK_VENDEDORES: Record<string, Vendedor> = {
  "4811": {
    vendedorId: "4811",
    nombre: "Juan",
    apellido: "Perez",
    email: "juan.perez@example.com",
    telefono: "+54 11 4444-1111",
    direccion: "Av. Libertador 101",
    raw: {
      vendedor_id: "4811",
      nombre: "Juan",
      apellido: "Perez",
      email: "juan.perez@example.com",
      telefono: "+54 11 4444-1111",
      direccion: "Av. Libertador 101"
    }
  },
  "4812": {
    vendedorId: "4812",
    nombre: "Maria",
    apellido: "Gomez",
    email: "maria.gomez@example.com",
    telefono: "+54 221 555-2222",
    direccion: "Calle 8 123",
    raw: {
      vendedor_id: "4812",
      nombre: "Maria",
      apellido: "Gomez",
      email: "maria.gomez@example.com",
      telefono: "+54 221 555-2222",
      direccion: "Calle 8 123"
    }
  }
};

export const MOCK_PRODUCTOS: Record<string, Producto> = {
  "1672624": {
    productoId: "1672624",
    nombre: "Bolsa Marron 12.5x8x19",
    codigo: "BOL-125-819",
    usrCode: "PRD-1672624",
    codigoBarra: "7790000000011",
    unidadMedida: { ID: "1", id: "1", nombre: "Unidad", codigo: "UN" },
    categoria: "Bolsas",
    stockNegativo: false,
    tasaIva: { ID: "5", id: "5", nombre: "21%", codigo: "21" },
    cuentaContable: { ID: "100", id: "100", nombre: "Ventas", codigo: "VTA" },
    catFormIVA2002: null,
    precioUltCompra: 120.5,
    activo: true,
    sincronizaStock: true
  },
  "1672625": {
    productoId: "1672625",
    nombre: "Bolsa Marron 15x10x25",
    codigo: "BOL-1510-25",
    usrCode: "PRD-1672625",
    codigoBarra: "7790000000012",
    unidadMedida: { ID: "1", id: "1", nombre: "Unidad", codigo: "UN" },
    categoria: "Bolsas",
    stockNegativo: false,
    tasaIva: { ID: "5", id: "5", nombre: "21%", codigo: "21" },
    cuentaContable: { ID: "100", id: "100", nombre: "Ventas", codigo: "VTA" },
    catFormIVA2002: null,
    precioUltCompra: 145.8,
    activo: true,
    sincronizaStock: true
  }
};

export const MOCK_LISTAS_PRECIO: ListaPrecio[] = [
  {
    listaPrecioId: "1",
    nombre: "Lista Minorista",
    descripcion: "Precios de mostrador",
    activo: true
  },
  {
    listaPrecioId: "2",
    nombre: "Lista Mayorista",
    descripcion: "Precios por volumen",
    activo: true
  }
];

export const MOCK_COMPROBANTES: ComprobanteVenta[] = [
  {
    comprobanteVentaId: "5001",
    nombre: "Factura A",
    fecha: "2023-06-03",
    fechaVto: "2023-06-30",
    tipo: "A",
    numeroDocumento: "0001-00005001",
    cae: "12345678901234",
    descripcion: "Factura de prueba",
    externalId: "EXT-5001",
    importeTotal: 250000,
    importeImpuestos: 52500,
    importeGravado: 197500,
    clienteNombre: "Cliente Demo SA",
    vendedorNombre: "Juan Perez"
  },
  {
    comprobanteVentaId: "5002",
    nombre: "Factura A",
    fecha: "2023-06-04",
    fechaVto: "2023-07-01",
    tipo: "A",
    numeroDocumento: "0001-00005002",
    cae: "12345678901235",
    descripcion: "Factura de prueba 2",
    externalId: "EXT-5002",
    importeTotal: 380000,
    importeImpuestos: 79800,
    importeGravado: 300200,
    clienteNombre: "Distribuidora Norte SRL",
    vendedorNombre: "Maria Gomez"
  }
];
