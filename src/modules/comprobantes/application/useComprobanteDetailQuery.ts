import { useQuery } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";
import type { ComprobantesRepository } from "../domain";
import { queryKeys } from "@/shared/lib/queryKeys";
import { toTransaccionId } from "@/shared/types/valueObjects";
import { createLogger } from "@/shared/lib/observability/logger";

const logger = createLogger("MVP useComprobanteDetailQuery");

export function useComprobanteDetailQuery(
  comprobanteVentaId: MaybeRefOrGetter<string | null>,
  comprobantesRepository: ComprobantesRepository
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
        logger.warn("Se intento cargar detalle sin comprobante seleccionado.");
        return null;
      }
      return comprobantesRepository.getById(resolvedId.value);
    }
  });
}
