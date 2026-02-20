import { useQuery } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";
import type { ClientesRepository } from "../domain";
import { logApiError } from "@/shared/lib/http/httpErrorSummary";
import { queryKeys } from "@/shared/lib/queryKeys";
import { toClienteId } from "@/shared/types/valueObjects";
import { createLogger } from "@/shared/lib/observability/logger";

const logger = createLogger("MVP useClienteByIdQuery");

export function useClienteByIdQuery(
  clienteId: MaybeRefOrGetter<string | null>,
  clientesRepository: ClientesRepository
) {
  const resolvedId = computed(() => {
    return toClienteId(toValue(clienteId));
  });

  return useQuery({
    queryKey: computed(() => queryKeys.clienteById(resolvedId.value ?? "__no-id__")),
    enabled: computed(() => resolvedId.value !== null),
    queryFn: async () => {
      if (!resolvedId.value) {
        logger.warn("Se intento cargar cliente sin ID.");
        return null;
      }
      try {
        return await clientesRepository.getById(resolvedId.value);
      } catch (error) {
        logApiError("Error al cargar cliente desde backend", error, "error");
        throw error;
      }
    }
  });
}
