import { useQuery } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";
import type { ProductosRepository } from "../domain";
import { logApiError } from "@/shared/lib/http/httpErrorSummary";
import { queryKeys } from "@/shared/lib/queryKeys";
import { toProductoId } from "@/shared/types/valueObjects";

export function useProductoByIdQuery(
  productoId: MaybeRefOrGetter<string | null>,
  productosRepository: ProductosRepository
) {
  const resolvedId = computed(() => {
    return toProductoId(toValue(productoId));
  });

  return useQuery({
    queryKey: computed(() => queryKeys.productoById(resolvedId.value ?? "__no-id__")),
    enabled: computed(() => resolvedId.value !== null),
    queryFn: async () => {
      if (!resolvedId.value) {
        console.warn("[MVP] Se intento cargar producto sin ID.");
        return null;
      }
      try {
        return await productosRepository.getById(resolvedId.value);
      } catch (error) {
        logApiError("Error al cargar producto desde backend", error, "error");
        throw error;
      }
    }
  });
}
