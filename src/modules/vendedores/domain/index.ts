export type VendedorId = string;

export type Vendedor = {
  vendedorId: VendedorId | null;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  raw: Record<string, unknown>;
};

export interface VendedoresRepository {
  list(): Promise<Vendedor[]>;
  getById(vendedorId: VendedorId): Promise<Vendedor | null>;
}
