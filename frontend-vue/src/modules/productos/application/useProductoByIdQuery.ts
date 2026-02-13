import { useQuery } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";
import {
  createProductosHttpRepository,
  createProductosMockRepository
} from "../infrastructure";
import { runtimeConfig } from "@/shared/config/runtimeConfig";
import { logApiError } from "@/shared/lib/http/httpErrorSummary";
import { queryKeys } from "@/shared/lib/queryKeys";
import { toProductoId } from "@/shared/types/valueObjects";

const productosHttpRepository = createProductosHttpRepository(runtimeConfig.apiBaseUrl);
const productosMockRepository = createProductosMockRepository();

export function useProductoByIdQuery(
  productoId: MaybeRefOrGetter<string | null>
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
      if (runtimeConfig.useMocks) {
        return productosMockRepository.getById(resolvedId.value);
      }
      try {
        return await productosHttpRepository.getById(resolvedId.value);
      } catch (error) {
        if (runtimeConfig.fallbackToMocksOnError) {
          logApiError(
            "Error al cargar producto. Se aplica fallback a mock.",
            error,
            "warn"
          );
          return productosMockRepository.getById(resolvedId.value);
        }
        logApiError("Error al cargar producto", error, "error");
        throw error;
      }
    }
  });
}
