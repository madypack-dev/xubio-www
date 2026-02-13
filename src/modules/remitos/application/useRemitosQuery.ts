import { useQuery } from "@tanstack/vue-query";
import {
  createRemitosHttpRepository,
  createRemitosMockRepository
} from "../infrastructure";
import { runtimeConfig } from "@/shared/config/runtimeConfig";
import { logApiError } from "@/shared/lib/http/httpErrorSummary";
import { queryKeys } from "@/shared/lib/queryKeys";

const remitosHttpRepository = createRemitosHttpRepository(runtimeConfig.apiBaseUrl);
const remitosMockRepository = createRemitosMockRepository();

export function useRemitosQuery() {
  return useQuery({
    queryKey: queryKeys.remitos(),
    queryFn: async () => {
      if (runtimeConfig.useMocks) {
        return remitosMockRepository.list();
      }
      try {
        return await remitosHttpRepository.list();
      } catch (error) {
        if (runtimeConfig.fallbackToMocksOnError) {
          logApiError(
            "Error al cargar remitos. Se aplica fallback a mock.",
            error,
            "warn"
          );
          return remitosMockRepository.list();
        }
        logApiError("Error al cargar remitos", error, "error");
        throw error;
      }
    }
  });
}
