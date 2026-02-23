import type {
  Money as SharedMoney,
  ProductoId as SharedProductoId
} from "@/shared/types/valueObjects";

export type ProductoId = SharedProductoId;
export type Money = SharedMoney;

export type SimpleCatalog = {
  id: string | null;
  ID: string | null;
  nombre: string;
  codigo: string;
};

export type Producto = {
  productoId: ProductoId | null;
  nombre: string;
  codigo: string;
  usrCode: string;
  codigoBarra: string;
  unidadMedida: SimpleCatalog | null;
  categoria: string | null;
  stockNegativo: boolean | null;
  tasaIva: SimpleCatalog | null;
  cuentaContable: SimpleCatalog | null;
  catFormIVA2002: string | null;
  precioUltCompra: Money | null;
  activo: boolean | null;
  sincronizaStock: boolean | null;
};

export interface ProductosRepository {
  list(): Promise<Producto[]>;
  getById(productoId: ProductoId): Promise<Producto | null>;
}
