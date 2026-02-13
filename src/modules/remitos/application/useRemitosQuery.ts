import { useQuery } from "@tanstack/vue-query";
import { createRemitosHttpRepository } from "../infrastructure";
import { runtimeConfig } from "@/shared/config/runtimeConfig";
import { logApiError } from "@/shared/lib/http/httpErrorSummary";
import { queryKeys } from "@/shared/lib/queryKeys";

const remitosHttpRepository = createRemitosHttpRepository(runtimeConfig.apiBaseUrl);

export function useRemitosQuery() {
  return useQuery({
    queryKey: queryKeys.remitos(),
    queryFn: async () => {
      try {
        return await remitosHttpRepository.list();
      } catch (error) {
        logApiError("Error al cargar remitos desde backend", error, "error");
        throw error;
      }
    }
  });
}
