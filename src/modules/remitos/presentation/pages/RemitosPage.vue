<template>
  <div class="d-flex flex-column gap-3">
    <section class="card shadow-sm" :aria-busy="remitosQuery.isLoading.value">
      <div class="card-body">
        <div class="fitba-toolbar d-flex justify-content-between align-items-center mb-3">
          <h2 class="h5 mb-0">Remitos</h2>
          <div class="fitba-toolbar-actions d-flex gap-2">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
              aria-label="Limpiar remito seleccionado"
              ref="clearButtonRef"
              @click="clearSelectedRemito"
            >
              Limpiar
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-success"
              aria-label="Recargar listado de remitos"
              @click="reloadRemitos"
            >
              Recargar
            </button>
          </div>
        </div>

        <AsyncLoadingMessage
          v-if="remitosQuery.isLoading.value"
          message="Cargando remitos..."
        />

        <AsyncErrorMessage v-else-if="errorMessage" :message="errorMessage" />

        <AsyncEmptyMessage
          v-else-if="visibleRemitos.length === 0"
          message="No hay remitos disponibles."
        />

        <div v-else class="fitba-table-shell">
          <DataPaginationControls
            v-if="remitosPagination.isActive.value"
            entity-label="remitos"
            :page="remitosPagination.page.value"
            :page-size="remitosPagination.pageSize.value"
            :page-size-options="remitosPagination.pageSizeOptions"
            :total-rows="remitosPagination.totalRows.value"
            :total-pages="remitosPagination.totalPages.value"
            :page-start="remitosPagination.pageStart.value"
            :page-end="remitosPagination.pageEnd.value"
            @update:page="remitosPagination.setPage"
            @update:page-size="remitosPagination.setPageSize"
          />

          <div class="table-responsive fitba-table-responsive fitba-table-responsive--wide">
            <table
              class="table table-sm table-striped table-hover align-middle fitba-table-grid"
              data-nav-table="true"
              aria-label="Tabla de remitos de venta"
            >
              <caption class="visually-hidden">
                Listado de remitos con acceso a detalle de items y cliente.
              </caption>
              <thead class="table-dark">
                <tr>
                  <th scope="col">transaccionId</th>
                  <th scope="col" class="remitos-numero-remito-col">numeroRemito</th>
                  <th scope="col" class="remitos-fecha-col">fecha</th>
                  <th scope="col">observacion</th>
                  <th scope="col">clienteId</th>
                  <th scope="col">vendedorId</th>
                  <th scope="col" class="text-center">comisionVendedor</th>
                  <th scope="col" class="text-center">depositoId</th>
                  <th scope="col" class="text-center">circuitoContableId</th>
                  <th scope="col" class="text-center">items</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="remito in paginatedVisibleRemitos"
                  :key="rowKey(remito)"
                  data-nav-row="true"
                  tabindex="-1"
                  :class="{ 'table-primary': isSelectedRemito(remito) }"
                >
                  <td>
                    <a
                      v-if="remito.transaccionId"
                      class="fitba-inline-link"
                      data-nav-main="true"
                      :href="buildRemitoLink(remito.transaccionId)"
                      :aria-label="buildSelectRemitoIdLabel(remito.transaccionId)"
                      :aria-current="isSelectedRemito(remito) ? 'true' : undefined"
                      @click.prevent="selectRemito(remito.transaccionId)"
                    >
                      {{ remito.transaccionId }}
                    </a>
                    <span v-else>-</span>
                  </td>
                  <td class="remitos-numero-remito-col">{{ remito.numeroRemito || "-" }}</td>
                  <td class="remitos-fecha-col">{{ formatDateDdMmYyyy(remito.fecha) }}</td>
                  <td
                    class="fitba-cell-truncate fitba-cell-truncate--lg"
                    :title="remito.observacion || undefined"
                  >
                    {{ remito.observacion || "-" }}
                  </td>
                  <td>
                    <a
                      v-if="remito.clienteId"
                      class="fitba-inline-link"
                      :href="buildClienteLink(remito.clienteId)"
                      :aria-label="buildGoToClienteLabel(remito.clienteId)"
                      @click.prevent="goToCliente(remito.clienteId)"
                    >
                      {{ remito.clienteId }}
                    </a>
                    <span v-else>-</span>
                  </td>
                  <td>
                    <a
                      v-if="remito.vendedorId"
                      class="fitba-inline-link"
                      :href="buildVendedorLink(remito.vendedorId)"
                      :aria-label="buildGoToVendedorLabel(remito.vendedorId)"
                      @click.prevent="goToVendedor(remito.vendedorId)"
                    >
                      {{ remito.vendedorId }}
                    </a>
                    <span v-else>-</span>
                  </td>
                  <td class="fitba-cell-num text-center">{{ remito.comisionVendedor ?? "-" }}</td>
                  <td class="text-center">{{ remito.depositoId ?? "-" }}</td>
                  <td class="text-center">{{ remito.circuitoContableId ?? "-" }}</td>
                  <td class="fitba-cell-num text-center">{{ remito.items.length }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <section class="card shadow-sm">
      <div class="card-body">
        <h3 class="h6 mb-3">Detalle de items del remito</h3>

        <AsyncEmptyMessage
          v-if="!selectedRemito"
          message="Selecciona un remito para ver sus items."
        />

        <AsyncEmptyMessage
          v-else-if="selectedRemito.items.length === 0"
          message="El remito seleccionado no tiene items."
        />

        <div
          v-else
          class="fitba-table-shell table-responsive fitba-table-responsive fitba-table-responsive--wide"
        >
          <table
            class="table table-sm table-striped align-middle fitba-table-grid"
            data-nav-table="true"
            aria-label="Items del remito"
          >
            <caption class="visually-hidden">
              Items del remito seleccionado con acceso directo al producto.
            </caption>
            <thead class="table-dark">
              <tr>
                <th scope="col">itemId</th>
                <th scope="col">transaccionId</th>
                <th scope="col">productoId</th>
                <th scope="col">descripcion</th>
                <th scope="col">cantidad</th>
                <th scope="col">precio</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in selectedRemito.items" :key="itemRowKey(item)" data-nav-row="true" tabindex="-1">
                <td>{{ item.transaccionCVItemId ?? "-" }}</td>
                <td>{{ item.transaccionId ?? "-" }}</td>
                <td>
                  <a
                    v-if="item.productoId"
                    class="fitba-inline-link"
                    data-nav-main="true"
                    :href="buildProductoLink(item.productoId)"
                    :aria-label="buildGoToProductoLabel(item.productoId)"
                    @click.prevent="goToProducto(item.productoId)"
                  >
                    {{ item.productoId }}
                  </a>
                  <span v-else>-</span>
                </td>
                <td>{{ item.descripcion || "-" }}</td>
                <td class="fitba-cell-num">{{ item.cantidad ?? "-" }}</td>
                <td class="fitba-cell-num">{{ item.precio ?? "-" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRemitosQuery } from "../useRemitosQuery";
import type { Remito } from "../../domain";
import { runtimeConfig } from "@/shared/config/runtimeConfig";
import { usePaginatedRows } from "@/shared/lib/performance/usePaginatedRows";
import { useAs400Shortcuts } from "@/shared/lib/keyboard/useAs400Shortcuts";
import { useTableRowNavigation } from "@/shared/lib/keyboard/useTableRowNavigation";
import AsyncLoadingMessage from "@/shared/ui/AsyncLoadingMessage.vue";
import AsyncErrorMessage from "@/shared/ui/AsyncErrorMessage.vue";
import AsyncEmptyMessage from "@/shared/ui/AsyncEmptyMessage.vue";
import DataPaginationControls from "@/shared/ui/DataPaginationControls.vue";
import { resolveErrorMessage } from "@/shared/lib/http/resolveErrorMessage";
import { buildHttpErrorLogContext } from "@/shared/lib/http/httpErrorDiagnostics";
import { useRemitosDependencies } from "../remitosDependencies";
import { createLogger } from "@/shared/lib/observability/logger";
import { useRemitosNavigation } from "../useRemitosNavigation";
import {
  buildGoToClienteLabel,
  buildGoToProductoLabel,
  buildGoToVendedorLabel,
  buildSelectRemitoIdLabel,
  formatDateDdMmYyyy,
  itemRowKey,
  rowKey
} from "../remitosViewFormatters";

const logger = createLogger("MVP RemitosPage");
const { remitosRepository } = useRemitosDependencies();
const remitosQuery = useRemitosQuery(remitosRepository);
const {
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
} = useRemitosNavigation(logger);
const clearButtonRef = ref<HTMLButtonElement | null>(null);

watch(
  () => [selectedRemitoId.value, remitosQuery.data.value] as const,
  ([remitoId, remitosData]) => {
    if (!remitoId) {
      return;
    }
    const remitos = remitosData ?? [];
    const exists = remitos.some(
      (remito) => String(remito.transaccionId ?? "") === remitoId
    );
    if (!exists) {
      logger.warn("remitoVenta no existe en dataset actual", {
        remitoVenta: remitoId
      });
    }
  }
);

const remitos = computed(() => remitosQuery.data.value ?? []);

watch(
  () => remitos.value,
  (remitosData) => {
    if (!runtimeConfig.debugRemitos) {
      return;
    }

    const sample = remitosData.slice(0, 5).map((remito) => ({
      transaccionId: remito.transaccionId,
      numeroRemito: remito.numeroRemito,
      observacion: remito.observacion
    }));

    logger.info("Muestra de observaciones normalizadas", {
      total: remitosData.length,
      sample
    });
  },
  { immediate: true }
);

const selectedRemito = computed(() =>
  remitos.value.find(
    (remito) => String(remito.transaccionId ?? "") === selectedRemitoId.value
  ) ?? null
);

const visibleRemitos = computed(() => {
  if (selectedRemito.value) {
    return [selectedRemito.value];
  }
  return remitos.value;
});

const remitosPagination = usePaginatedRows(visibleRemitos, {
  threshold: 120,
  defaultPageSize: 100,
  pageSizeOptions: [50, 100, 250, 500]
});

const paginatedVisibleRemitos = computed(() => remitosPagination.rows.value);

const errorMessage = computed(() => {
  const error = remitosQuery.error.value;
  if (!error) {
    return null;
  }
  logger.warn("RemitosPage detecto error en query", {
    ...buildHttpErrorLogContext(error, "Error inesperado al cargar remitos."),
    hasData: Boolean(remitosQuery.data.value)
  });
  return resolveErrorMessage(error, "Error inesperado al cargar remitos.");
});

useTableRowNavigation();

useAs400Shortcuts({
  onF2: () => {
    const firstContextLink = document.querySelector<HTMLAnchorElement>(
      ".fitba-table-shell tbody a.fitba-inline-link"
    );
    if (firstContextLink) {
      firstContextLink.focus();
      return;
    }
    clearButtonRef.value?.focus();
  },
  onF3: clearSelectedRemito,
  onF5: reloadRemitos,
  onBack: () => router.back()
});

function isSelectedRemito(remito: Remito) {
  return String(remito.transaccionId ?? "") === selectedRemitoId.value;
}

async function reloadRemitos() {
  try {
    logger.info("Recarga manual de remitos iniciada");
    await remitosQuery.refetch();
    logger.info("Recarga manual de remitos finalizada");
  } catch (error) {
    logger.error("Error al recargar remitos", {
      ...buildHttpErrorLogContext(error),
      triggeredBy: "manual_reload"
    });
  }
}

</script>

<style scoped>
.remitos-numero-remito-col {
  min-width: 165px;
  white-space: nowrap;
}

.remitos-fecha-col {
  min-width: 120px;
  white-space: nowrap;
}
</style>
