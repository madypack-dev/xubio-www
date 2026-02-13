import { useQuery } from "@tanstack/vue-query";
import type { RemitosRepository } from "../domain";
import { logApiError } from "@/shared/lib/http/httpErrorSummary";
import { queryKeys } from "@/shared/lib/queryKeys";

export function useRemitosQuery(remitosRepository: RemitosRepository) {
  return useQuery({
    queryKey: queryKeys.remitos(),
    queryFn: async () => {
      try {
        return await remitosRepository.list();
      } catch (error) {
        logApiError("Error al cargar remitos desde backend", error, "error");
        throw error;
      }
    }
  });
}
