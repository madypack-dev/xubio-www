import { useQuery } from "@tanstack/vue-query";
import type { ListasPrecioRepository } from "../domain";
import { logApiError } from "@/shared/lib/http/httpErrorSummary";
import { queryKeys } from "@/shared/lib/queryKeys";

export function useListasPrecioQuery(
  listasPrecioRepository: ListasPrecioRepository
) {
  return useQuery({
    queryKey: queryKeys.listasPrecio(),
    queryFn: async () => {
      try {
        return await listasPrecioRepository.list();
      } catch (error) {
        logApiError(
          "Error al cargar listas de precio desde backend",
          error,
          "error"
        );
        throw error;
      }
    }
  });
}
