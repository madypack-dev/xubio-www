import { ref, watch } from "vue";
import { useRoute, useRouter, type LocationQueryValue } from "vue-router";
import type { AppLogger } from "@/shared/lib/observability/logger";

function readQueryValue(value: LocationQueryValue | LocationQueryValue[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return null;
  }
  const normalized = String(raw).trim();
  return normalized ? normalized : null;
}

export function useComprobantesNavigation(logger: AppLogger) {
  const route = useRoute();
  const router = useRouter();
  const selectedComprobanteId = ref<string | null>(readQueryValue(route.query.comprobanteVenta));

  watch(
    () => route.query.comprobanteVenta,
    (value) => {
      selectedComprobanteId.value = readQueryValue(value);
    }
  );

  function buildComprobanteLink(comprobanteVentaId: string | null) {
    return router.resolve({
      name: "comprobantes",
      query: {
        ...route.query,
        comprobanteVenta: comprobanteVentaId ?? undefined
      }
    }).href;
  }

  function buildDetailLabel(comprobanteVentaId: string | null) {
    if (!comprobanteVentaId) {
      return "Ver detalle de comprobante";
    }
    return `Ver detalle de comprobante ${comprobanteVentaId}`;
  }

  async function selectComprobanteById(comprobanteVentaId: string | null) {
    try {
      if (!comprobanteVentaId) {
        logger.warn("Se intento abrir detalle sin comprobanteVentaId.");
        return;
      }
      selectedComprobanteId.value = comprobanteVentaId;
      await router.replace({
        query: {
          ...route.query,
          comprobanteVenta: comprobanteVentaId
        }
      });
    } catch (error) {
      logger.error("Error al seleccionar comprobante", { comprobanteVentaId, error });
    }
  }

  async function clearSelection() {
    try {
      selectedComprobanteId.value = null;
      await router.replace({
        query: {
          ...route.query,
          comprobanteVenta: undefined
        }
      });
    } catch (error) {
      logger.error("Error al limpiar seleccion de comprobante", { error });
    }
  }

  return {
    router,
    selectedComprobanteId,
    buildComprobanteLink,
    buildDetailLabel,
    selectComprobanteById,
    clearSelection
  };
}
