import { useQuery } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";
import type { ProductosRepository } from "../domain";
import { queryKeys } from "@/shared/lib/queryKeys";
import { toProductoId } from "@/shared/types/valueObjects";
import { createLogger } from "@/shared/lib/observability/logger";

const logger = createLogger("MVP useProductoByIdQuery");

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
        logger.warn("Se intento cargar producto sin ID.");
        return null;
      }
      return productosRepository.getById(resolvedId.value);
    }
  });
}
