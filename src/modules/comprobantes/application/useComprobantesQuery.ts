import { useQuery } from "@tanstack/vue-query";
import { createComprobantesHttpRepository } from "../infrastructure";
import { runtimeConfig } from "@/shared/config/runtimeConfig";
import { logApiError } from "@/shared/lib/http/httpErrorSummary";
import { queryKeys } from "@/shared/lib/queryKeys";

const comprobantesHttpRepository = createComprobantesHttpRepository(
  runtimeConfig.apiBaseUrl
);

export function useComprobantesQuery() {
  return useQuery({
    queryKey: queryKeys.comprobantes(),
    queryFn: async () => {
      try {
        return await comprobantesHttpRepository.list();
      } catch (error) {
        logApiError("Error al cargar comprobantes desde backend", error, "error");
        throw error;
      }
    }
  });
}
