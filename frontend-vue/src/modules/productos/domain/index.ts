export type ProductoId = string;

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
  precioUltCompra: number | null;
  activo: boolean | null;
  sincronizaStock: boolean | null;
};

export interface ProductosRepository {
  getById(productoId: ProductoId): Promise<Producto | null>;
}
