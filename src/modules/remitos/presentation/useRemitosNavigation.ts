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

export function useRemitosNavigation(logger: AppLogger) {
  const route = useRoute();
  const router = useRouter();
  const selectedRemitoId = ref<string | null>(readQueryValue(route.query.remitoVenta));

  watch(
    () => route.query.remitoVenta,
    (value) => {
      selectedRemitoId.value = readQueryValue(value);
    }
  );

  function buildRemitoLink(transaccionId: string | null) {
    return router.resolve({
      name: "remitos",
      query: {
        ...route.query,
        remitoVenta: transaccionId ?? undefined
      }
    }).href;
  }

  function buildClienteLink(clienteId: string | null) {
    return router.resolve({
      name: "clientes",
      query: {
        ...route.query,
        cliente: clienteId ?? undefined
      }
    }).href;
  }

  function buildVendedorLink(vendedorId: string | null) {
    return router.resolve({
      name: "vendedores",
      query: {
        ...route.query,
        vendedor: vendedorId ?? undefined
      }
    }).href;
  }

  function buildProductoLink(productoId: string | null) {
    return router.resolve({
      name: "productos",
      query: {
        ...route.query,
        producto: productoId ?? undefined
      }
    }).href;
  }

  async function selectRemito(transaccionId: string | null) {
    if (!transaccionId) {
      logger.warn("Se intento seleccionar remito sin transaccionId.");
      return;
    }

    try {
      selectedRemitoId.value = transaccionId;
      await router.replace({
        query: {
          ...route.query,
          remitoVenta: transaccionId
        }
      });
    } catch (error) {
      logger.error("Error al seleccionar remito", { transaccionId, error });
    }
  }

  async function clearSelectedRemito() {
    try {
      selectedRemitoId.value = null;
      await router.replace({
        query: {
          ...route.query,
          remitoVenta: undefined
        }
      });
    } catch (error) {
      logger.error("Error al limpiar remito seleccionado", { error });
    }
  }

  async function goToCliente(clienteId: string | null) {
    if (!clienteId) {
      logger.warn("Se intento navegar a cliente sin clienteId.");
      return;
    }

    try {
      await router.push({
        name: "clientes",
        query: {
          ...route.query,
          cliente: clienteId
        }
      });
    } catch (error) {
      logger.error("Error al navegar a cliente", { clienteId, error });
    }
  }

  async function goToVendedor(vendedorId: string | null) {
    if (!vendedorId) {
      logger.warn("Se intento navegar a vendedor sin vendedorId.");
      return;
    }

    try {
      await router.push({
        name: "vendedores",
        query: {
          ...route.query,
          vendedor: vendedorId
        }
      });
    } catch (error) {
      logger.error("Error al navegar a vendedor", { vendedorId, error });
    }
  }

  async function goToProducto(productoId: string | null) {
    if (!productoId) {
      logger.warn("Se intento navegar a producto sin productoId.");
      return;
    }

    try {
      await router.push({
        name: "productos",
        query: {
          ...route.query,
          producto: productoId
        }
      });
    } catch (error) {
      logger.error("Error al navegar a producto", { productoId, error });
    }
  }

  return {
    router,
    selectedRemitoId,
    buildRemitoLink,
    buildClienteLink,
    buildVendedorLink,
    buildProductoLink,
    selectRemito,
    clearSelectedRemito,
    goToCliente,
    goToVendedor,
    goToProducto
  };
}
