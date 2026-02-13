import { useQuery } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";
import {
  createClientesHttpRepository,
  createClientesMockRepository
} from "../infrastructure";
import { runtimeConfig } from "@/shared/config/runtimeConfig";
import { logApiError } from "@/shared/lib/http/httpErrorSummary";
import { queryKeys } from "@/shared/lib/queryKeys";
import { toClienteId } from "@/shared/types/valueObjects";

const clientesHttpRepository = createClientesHttpRepository(runtimeConfig.apiBaseUrl);
const clientesMockRepository = createClientesMockRepository();

export function useClienteByIdQuery(clienteId: MaybeRefOrGetter<string | null>) {
  const resolvedId = computed(() => {
    return toClienteId(toValue(clienteId));
  });

  return useQuery({
    queryKey: computed(() => queryKeys.clienteById(resolvedId.value ?? "__no-id__")),
    enabled: computed(() => resolvedId.value !== null),
    queryFn: async () => {
      if (!resolvedId.value) {
        console.warn("[MVP] Se intento cargar cliente sin ID.");
        return null;
      }
      if (runtimeConfig.useMocks) {
        return clientesMockRepository.getById(resolvedId.value);
      }
      try {
        return await clientesHttpRepository.getById(resolvedId.value);
      } catch (error) {
        if (runtimeConfig.fallbackToMocksOnError) {
          logApiError(
            "Error al cargar cliente. Se aplica fallback a mock.",
            error,
            "warn"
          );
          return clientesMockRepository.getById(resolvedId.value);
        }
        logApiError("Error al cargar cliente", error, "error");
        throw error;
      }
    }
  });
}
