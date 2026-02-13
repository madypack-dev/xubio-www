export type ListaPrecioId = string;

export type ListaPrecio = {
  listaPrecioId: ListaPrecioId | null;
  nombre: string;
  descripcion: string;
  activo: boolean | null;
};

export interface ListasPrecioRepository {
  list(): Promise<ListaPrecio[]>;
}
