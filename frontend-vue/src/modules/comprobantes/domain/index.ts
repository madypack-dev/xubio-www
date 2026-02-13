export type ComprobanteVentaId = string;

export type ComprobanteVenta = {
  comprobanteVentaId: ComprobanteVentaId | null;
  nombre: string;
  fecha: string | null;
  fechaVto: string | null;
  tipo: string | null;
  numeroDocumento: string;
  cae: string;
  descripcion: string;
  externalId: string;
  importeTotal: number | null;
  importeImpuestos: number | null;
  importeGravado: number | null;
  clienteNombre: string;
  vendedorNombre: string;
};

export interface ComprobantesRepository {
  list(): Promise<ComprobanteVenta[]>;
  getById(comprobanteVentaId: ComprobanteVentaId): Promise<ComprobanteVenta | null>;
}
