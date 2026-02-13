import type {
  FechaComercial as SharedFechaComercial,
  Money as SharedMoney,
  TransaccionId as SharedTransaccionId
} from "@/shared/types/valueObjects";

export type TransaccionId = SharedTransaccionId;
export type FechaComercial = SharedFechaComercial;
export type Money = SharedMoney;

export type ComprobanteVentaId = TransaccionId;

export type ComprobanteVenta = {
  comprobanteVentaId: ComprobanteVentaId | null;
  nombre: string;
  fecha: FechaComercial | null;
  fechaVto: FechaComercial | null;
  tipo: string | null;
  numeroDocumento: string;
  cae: string;
  descripcion: string;
  externalId: string;
  importeTotal: Money | null;
  importeImpuestos: Money | null;
  importeGravado: Money | null;
  clienteNombre: string;
  vendedorNombre: string;
};

export interface ComprobantesRepository {
  list(): Promise<ComprobanteVenta[]>;
  getById(comprobanteVentaId: ComprobanteVentaId): Promise<ComprobanteVenta | null>;
}
