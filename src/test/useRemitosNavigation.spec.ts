import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import { describe, expect, it, vi } from "vitest";
import { useRemitosNavigation } from "@/modules/remitos/presentation/useRemitosNavigation";
import type { AppLogger } from "@/shared/lib/observability/logger";

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/remitos", name: "remitos", component: { template: "<div />" } },
      { path: "/clientes", name: "clientes", component: { template: "<div />" } },
      { path: "/vendedores", name: "vendedores", component: { template: "<div />" } },
      { path: "/productos", name: "productos", component: { template: "<div />" } }
    ]
  });
}

function mountNavigationHarness(
  router: ReturnType<typeof createTestRouter>,
  logger: AppLogger
) {
  let api: ReturnType<typeof useRemitosNavigation> | undefined;
  mount(
    defineComponent({
      setup() {
        api = useRemitosNavigation(logger);
        return () => h("div");
      }
    }),
    { global: { plugins: [router] } }
  );

  if (!api) {
    throw new Error("Navigation api was not initialized.");
  }
  return api;
}

describe("useRemitosNavigation", () => {
  it("syncs selected remito from query and builds links", async () => {
    const router = createTestRouter();
    await router.push({ name: "remitos", query: { remitoVenta: "45" } });
    await router.isReady();

    const logger: AppLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };

    const api = mountNavigationHarness(router, logger);

    expect(api.selectedRemitoId.value).toBe("45");
    expect(api.buildClienteLink("10")).toContain("/clientes");

    await router.replace({ name: "remitos", query: { remitoVenta: "99" } });
    await nextTick();

    expect(api.selectedRemitoId.value).toBe("99");
  });

  it("navigates and logs when invalid ids are passed", async () => {
    const router = createTestRouter();
    await router.push({ name: "remitos" });
    await router.isReady();

    const logger: AppLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };

    const api = mountNavigationHarness(router, logger);

    await api.goToCliente("77");
    expect(router.currentRoute.value.name).toBe("clientes");

    await api.goToProducto(null);
    expect(logger.warn).toHaveBeenCalledWith("Se intento navegar a producto sin productoId.");
  });
});
