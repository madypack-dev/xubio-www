import { useQuery } from "@tanstack/vue-query";
import type { ProductosRepository } from "../domain";
import { queryKeys } from "@/shared/lib/queryKeys";

export function useProductosQuery(productosRepository: ProductosRepository) {
  return useQuery({
    queryKey: queryKeys.productos(),
    queryFn: () => productosRepository.list()
  });
}
