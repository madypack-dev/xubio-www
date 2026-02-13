import type { ClienteId as SharedClienteId } from "@/shared/types/valueObjects";

export type ClienteId = SharedClienteId;

export type SimpleCatalog = {
  id: string | null;
  ID: string | null;
  nombre: string;
  codigo: string;
};

export type ProvinciaCatalog = {
  provinciaId: string | null;
  codigo: string;
  nombre: string;
  pais: string;
};

export type Cliente = {
  clienteId: ClienteId | null;
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  primerNombre: string;
  otrosNombres: string;
  razonSocial: string;
  nombreComercial: string;
  identificacionTributaria: SimpleCatalog | null;
  digitoVerificacion: string;
  categoriaFiscal: SimpleCatalog | null;
  provincia: ProvinciaCatalog | null;
  direccion: string;
  email: string;
  telefono: string;
  codigoPostal: string;
  cuentaVenta: SimpleCatalog | null;
  cuentaCompra: SimpleCatalog | null;
  pais: SimpleCatalog | null;
  localidad: SimpleCatalog | null;
  usrCode: string;
  listaPrecioVenta: SimpleCatalog | null;
  descripcion: string;
  esClienteExtranjero: boolean | null;
  esProveedor: boolean | null;
  cuit: string;
  tipoDeOrganizacion: SimpleCatalog | null;
  responsabilidadOrganizacionItem: SimpleCatalog[];
  cuitUpper: string;
};

export interface ClientesRepository {
  getById(clienteId: ClienteId): Promise<Cliente | null>;
}
