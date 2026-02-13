import { useQuery } from "@tanstack/vue-query";
import { createListasPrecioHttpRepository } from "../infrastructure";
import { runtimeConfig } from "@/shared/config/runtimeConfig";
import { logApiError } from "@/shared/lib/http/httpErrorSummary";
import { queryKeys } from "@/shared/lib/queryKeys";

const listasPrecioHttpRepository = createListasPrecioHttpRepository(
  runtimeConfig.apiBaseUrl
);

export function useListasPrecioQuery() {
  return useQuery({
    queryKey: queryKeys.listasPrecio(),
    queryFn: async () => {
      try {
        return await listasPrecioHttpRepository.list();
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
