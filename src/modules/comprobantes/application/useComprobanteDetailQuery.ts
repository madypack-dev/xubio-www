import { useQuery } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { createComprobantesHttpRepository } from "../infrastructure";
import { runtimeConfig } from "@/shared/config/runtimeConfig";
import { logApiError } from "@/shared/lib/http/httpErrorSummary";
import { queryKeys } from "@/shared/lib/queryKeys";
import { toTransaccionId } from "@/shared/types/valueObjects";

const comprobantesHttpRepository = createComprobantesHttpRepository(
  runtimeConfig.apiBaseUrl
);

export function useComprobanteDetailQuery(
  comprobanteVentaId: MaybeRefOrGetter<string | null>
) {
  const resolvedId = computed(() => {
    return toTransaccionId(toValue(comprobanteVentaId));
  });

  return useQuery({
    queryKey: computed(() =>
      queryKeys.comprobanteById(resolvedId.value ?? "__no-selection__")
    ),
    enabled: computed(() => resolvedId.value !== null),
    queryFn: async () => {
      if (!resolvedId.value) {
        console.warn("[MVP] Se intento cargar detalle sin comprobante seleccionado.");
        return null;
      }
      try {
        return await comprobantesHttpRepository.getById(resolvedId.value);
      } catch (error) {
        logApiError(
          "Error al cargar detalle de comprobante desde backend",
          error,
          "error"
        );
        throw error;
      }
    }
  });
}
