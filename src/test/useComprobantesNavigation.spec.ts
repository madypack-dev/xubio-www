import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import { describe, expect, it, vi } from "vitest";
import { useComprobantesNavigation } from "@/modules/comprobantes/presentation/useComprobantesNavigation";
import type { AppLogger } from "@/shared/lib/observability/logger";

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/comprobantes", name: "comprobantes", component: { template: "<div />" } }]
  });
}

function mountHarness(
  router: ReturnType<typeof createTestRouter>,
  logger: AppLogger
) {
  let api: ReturnType<typeof useComprobantesNavigation> | undefined;
  mount(
    defineComponent({
      setup() {
        api = useComprobantesNavigation(logger);
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

describe("useComprobantesNavigation", () => {
  it("syncs selected id and builds detail links", async () => {
    const router = createTestRouter();
    await router.push({ name: "comprobantes", query: { comprobanteVenta: "11" } });
    await router.isReady();
    const logger: AppLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const api = mountHarness(router, logger);

    expect(api.selectedComprobanteId.value).toBe("11");
    expect(api.buildComprobanteLink("22")).toContain("comprobanteVenta=22");
    expect(api.buildDetailLabel("22")).toBe("Ver detalle de comprobante 22");

    await router.replace({ name: "comprobantes", query: { comprobanteVenta: "99" } });
    await nextTick();
    expect(api.selectedComprobanteId.value).toBe("99");
  });

  it("warns when selecting empty comprobante id", async () => {
    const router = createTestRouter();
    await router.push({ name: "comprobantes" });
    await router.isReady();
    const logger: AppLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const api = mountHarness(router, logger);

    await api.selectComprobanteById(null);
    expect(logger.warn).toHaveBeenCalledWith("Se intento abrir detalle sin comprobanteVentaId.");
  });
});
