export type ClienteId = string;

export type SimpleCatalog = {
  id: string | null;
  ID: string | null;
  nombre: string;
  codigo: string;
};

export type Cliente = {
  clienteId: ClienteId | null;
  nombre: string;
  razonSocial: string;
  identificacionTributaria: SimpleCatalog | null;
  categoriaFiscal: SimpleCatalog | null;
  cuit: string;
  cuitUpper: string;
  responsabilidadOrganizacionItem: unknown[];
  esClienteExtranjero: boolean | null;
  esProveedor: boolean | null;
  direccion: string;
  email: string;
  telefono: string;
  provincia: Record<string, unknown> | null;
  pais: SimpleCatalog | null;
  cuentaVenta: SimpleCatalog | null;
  cuentaCompra: SimpleCatalog | null;
  usrCode: string;
  descripcion: string;
};

export interface ClientesRepository {
  getById(clienteId: ClienteId): Promise<Cliente | null>;
}
