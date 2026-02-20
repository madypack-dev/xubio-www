import { useQuery } from "@tanstack/vue-query";
import type { ListasPrecioRepository } from "../domain";
import { queryKeys } from "@/shared/lib/queryKeys";

export function useListasPrecioQuery(
  listasPrecioRepository: ListasPrecioRepository
) {
  return useQuery({
    queryKey: queryKeys.listasPrecio(),
    queryFn: () => listasPrecioRepository.list()
  });
}
