export type RemitoId = string;
export type ProductoId = string;
export type ClienteId = string;
export type VendedorId = string;

export type RemitoItem = {
  transaccionCVItemId: string | null;
  transaccionId: string | null;
  productoID: ProductoId | null;
  productoid: ProductoId | null;
  productoId: ProductoId | null;
  descripcion: string;
  cantidad: number | null;
  precio: number | null;
};

export type Remito = {
  transaccionId: RemitoId | null;
  numeroRemito: string;
  fecha: string | null;
  observacion: string;
  clienteId: ClienteId | null;
  vendedorId: VendedorId | null;
  comisionVendedor: number | null;
  depositoId: string | null;
  circuitoContableId: string | null;
  items: RemitoItem[];
};

export interface RemitosRepository {
  list(): Promise<Remito[]>;
}
