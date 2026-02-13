import { useQuery } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";
import type { VendedoresRepository } from "../domain";
import { logApiError } from "@/shared/lib/http/httpErrorSummary";
import { queryKeys } from "@/shared/lib/queryKeys";
import { asStringOrNull } from "@/shared/lib/acl/legacyPayload";

export function useVendedorByIdQuery(
  vendedorId: MaybeRefOrGetter<string | null>,
  vendedoresRepository: VendedoresRepository
) {
  const resolvedId = computed(() => {
    return asStringOrNull(toValue(vendedorId));
  });

  return useQuery({
    queryKey: computed(() => queryKeys.vendedorById(resolvedId.value ?? "__no-id__")),
    enabled: computed(() => resolvedId.value !== null),
    queryFn: async () => {
      if (!resolvedId.value) {
        console.warn("[MVP] Se intento cargar vendedor sin ID.");
        return null;
      }

      try {
        return await vendedoresRepository.getById(resolvedId.value);
      } catch (error) {
        logApiError("Error al cargar vendedor desde backend", error, "error");
        throw error;
      }
    }
  });
}
