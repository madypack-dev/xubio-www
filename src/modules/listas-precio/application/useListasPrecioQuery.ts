import { useQuery } from "@tanstack/vue-query";
import {
  createListasPrecioHttpRepository,
  createListasPrecioMockRepository
} from "../infrastructure";
import { runtimeConfig } from "@/shared/config/runtimeConfig";
import { logApiError } from "@/shared/lib/http/httpErrorSummary";
import { queryKeys } from "@/shared/lib/queryKeys";

const listasPrecioHttpRepository = createListasPrecioHttpRepository(
  runtimeConfig.apiBaseUrl
);
const listasPrecioMockRepository = createListasPrecioMockRepository();

export function useListasPrecioQuery() {
  return useQuery({
    queryKey: queryKeys.listasPrecio(),
    queryFn: async () => {
      if (runtimeConfig.useMocks) {
        return listasPrecioMockRepository.list();
      }
      try {
        return await listasPrecioHttpRepository.list();
      } catch (error) {
        if (runtimeConfig.fallbackToMocksOnError) {
          logApiError(
            "Error al cargar listas de precio. Se aplica fallback a mock.",
            error,
            "warn"
          );
          return listasPrecioMockRepository.list();
        }
        logApiError("Error al cargar listas de precio", error, "error");
        throw error;
      }
    }
  });
}
