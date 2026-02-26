export const queryKeys = {
  remitos: () => ["remitos"] as const,
  remitoById: (id: string) => ["remitos", "by-id", id] as const,
  listasPrecio: () => ["listas-precio"] as const,
  comprobantes: () => ["comprobantes"] as const,
  comprobanteById: (id: string) => ["comprobantes", "by-id", id] as const,
  clientes: () => ["clientes"] as const,
  clienteById: (id: string) => ["clientes", "by-id", id] as const,
  vendedores: () => ["vendedores"] as const,
  vendedorById: (id: string) => ["vendedores", "by-id", id] as const,
  depositos: () => ["depositos"] as const,
  productos: () => ["productos"] as const,
  productoById: (id: string) => ["productos", "by-id", id] as const
};
