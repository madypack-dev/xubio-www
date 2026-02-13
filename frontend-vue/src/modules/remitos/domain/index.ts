import type {
  ClienteId as SharedClienteId,
  FechaComercial as SharedFechaComercial,
  Money as SharedMoney,
  ProductoId as SharedProductoId,
  TransaccionId as SharedTransaccionId
} from "@/shared/types/valueObjects";

export type TransaccionId = SharedTransaccionId;
export type ProductoId = SharedProductoId;
export type ClienteId = SharedClienteId;
export type FechaComercial = SharedFechaComercial;
export type Money = SharedMoney;

export type RemitoId = TransaccionId;
export type VendedorId = string;

export type RemitoItem = {
  transaccionCVItemId: string | null;
  transaccionId: TransaccionId | null;
  productoID: ProductoId | null;
  productoid: ProductoId | null;
  productoId: ProductoId | null;
  descripcion: string;
  cantidad: number | null;
  precio: Money | null;
};

export type Remito = {
  transaccionId: TransaccionId | null;
  numeroRemito: string;
  fecha: FechaComercial | null;
  observacion: string;
  clienteId: ClienteId | null;
  vendedorId: VendedorId | null;
  comisionVendedor: Money | null;
  depositoId: string | null;
  circuitoContableId: string | null;
  items: RemitoItem[];
};

export interface RemitosRepository {
  list(): Promise<Remito[]>;
}
