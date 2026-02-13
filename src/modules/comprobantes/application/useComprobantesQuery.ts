import { useQuery } from "@tanstack/vue-query";
import type { ComprobantesRepository } from "../domain";
import { logApiError } from "@/shared/lib/http/httpErrorSummary";
import { queryKeys } from "@/shared/lib/queryKeys";

export function useComprobantesQuery(
  comprobantesRepository: ComprobantesRepository
) {
  return useQuery({
    queryKey: queryKeys.comprobantes(),
    queryFn: async () => {
      try {
        return await comprobantesRepository.list();
      } catch (error) {
        logApiError("Error al cargar comprobantes desde backend", error, "error");
        throw error;
      }
    }
  });
}
