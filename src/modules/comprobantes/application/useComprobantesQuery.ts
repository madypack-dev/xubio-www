import { useQuery } from "@tanstack/vue-query";
import {
  createComprobantesHttpRepository,
  createComprobantesMockRepository
} from "../infrastructure";
import { runtimeConfig } from "@/shared/config/runtimeConfig";
import { logApiError } from "@/shared/lib/http/httpErrorSummary";
import { queryKeys } from "@/shared/lib/queryKeys";

const comprobantesHttpRepository = createComprobantesHttpRepository(
  runtimeConfig.apiBaseUrl
);
const comprobantesMockRepository = createComprobantesMockRepository();

export function useComprobantesQuery() {
  return useQuery({
    queryKey: queryKeys.comprobantes(),
    queryFn: async () => {
      if (runtimeConfig.useMocks) {
        return comprobantesMockRepository.list();
      }
      try {
        return await comprobantesHttpRepository.list();
      } catch (error) {
        if (runtimeConfig.fallbackToMocksOnError) {
          logApiError(
            "Error al cargar comprobantes. Se aplica fallback a mock.",
            error,
            "warn"
          );
          return comprobantesMockRepository.list();
        }
        logApiError("Error al cargar comprobantes", error, "error");
        throw error;
      }
    }
  });
}
