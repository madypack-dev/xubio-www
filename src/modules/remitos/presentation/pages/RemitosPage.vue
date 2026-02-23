<template>
  <div class="d-flex flex-column gap-3 remitos-screen fitba-screen--phosphor">
    <section v-if="!selectedRemito" class="card shadow-sm" :aria-busy="remitosQuery.isLoading.value">
      <div class="card-body">
        <div class="fitba-statusbar mb-3" role="status" aria-live="polite">
          <span class="fitba-statusbar-item">MODULO: REMITOS</span>
          <span class="fitba-statusbar-item">VISTA: LISTADO</span>
          <span class="fitba-statusbar-item">TOTAL: {{ remitos.length }}</span>
        </div>

        <div class="fitba-toolbar d-flex justify-content-between align-items-center mb-3">
          <h2 class="h5 mb-0">Remitos</h2>
          <div class="fitba-toolbar-actions d-flex gap-2">
            <button
              type="button"
              class="btn btn-sm btn-outline-success"
              aria-label="Recargar listado de remitos"
              ref="reloadButtonRef"
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
            :show-page-size-selector="false"
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

          <div class="d-md-none">
            <div
              v-for="remito in paginatedVisibleRemitos"
              :key="`${rowKey(remito)}-card`"
              class="card mb-2 remito-mobile-card"
              :class="{ 'border-primary': isSelectedRemito(remito) }"
            >
              <div class="card-body py-2 px-3">
                <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
                  <a
                    v-if="remito.transaccionId"
                    class="fitba-inline-link fitba-key-link fw-semibold"
                    :href="buildRemitoLink(remito.transaccionId)"
                    :aria-label="buildSelectRemitoIdLabel(remito.transaccionId)"
                    @click.prevent="selectRemito(remito.transaccionId)"
                  >
                    {{ remito.transaccionId }}
                  </a>
                  <span v-else class="fw-semibold">-</span>
                  <span class="small remito-mobile-meta">
                    {{ formatDateDdMmYyyy(remito.fecha) }}
                  </span>
                </div>
                <div class="small mb-1">
                  <span class="remito-mobile-label">Rto:</span>
                  <a
                    v-if="remito.transaccionId"
                    class="fitba-inline-link fitba-key-link fw-semibold"
                    :href="buildRemitoLink(remito.transaccionId)"
                    :aria-label="buildSelectRemitoIdLabel(remito.transaccionId)"
                    @click.prevent="selectRemito(remito.transaccionId)"
                  >
                    {{ remito.numeroRemito || "-" }}
                  </a>
                  <span v-else class="remito-mobile-value fw-semibold">{{ remito.numeroRemito || "-" }}</span>
                </div>
                <div class="small mb-1">
                  <span class="remito-mobile-label">Cliente:</span>
                  <a
                    v-if="remito.clienteId"
                    class="fitba-inline-link fitba-key-link"
                    :href="buildClienteLink(remito.clienteId)"
                    :aria-label="buildGoToClienteLabel(remito.clienteId)"
                    @click.prevent="goToCliente(remito.clienteId)"
                  >
                    {{ remito.clienteId }}
                  </a>
                  <span v-else class="remito-mobile-value">-</span>
                </div>
                <div class="small remito-mobile-observacion">
                  {{ remito.observacion || "-" }}
                </div>
                <div class="small mt-1">
                  <span class="remito-mobile-label">Items:</span>
                  <span class="fw-semibold">{{ remito.items.length }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="table-responsive fitba-table-responsive fitba-table-responsive--wide d-none d-md-block">
            <table
              class="table table-sm table-hover align-middle fitba-table-grid fitba-table-sticky fitba-table-readable"
              data-nav-table="true"
              aria-label="Tabla de remitos de venta"
            >
              <caption class="visually-hidden">
                Listado de remitos con acceso a detalle de items y cliente.
              </caption>
              <thead class="table-dark">
                <tr>
                  <th scope="col">TRX_ID</th>
                  <th scope="col" class="remitos-numero-remito-col">RTO_NRO</th>
                  <th scope="col" class="remitos-fecha-col">FEC</th>
                  <th scope="col">OBS</th>
                  <th scope="col">CLI_ID</th>
                  <th scope="col" class="d-none d-lg-table-cell">VND_ID</th>
                  <th scope="col" class="text-center d-none d-xl-table-cell">COM_%</th>
                  <th scope="col" class="text-center d-none d-xl-table-cell">DEP_ID</th>
                  <th scope="col" class="text-center d-none d-xl-table-cell">CC_ID</th>
                  <th scope="col" class="text-center">ITMS</th>
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
                      class="fitba-inline-link fitba-key-link"
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
                  <td class="remitos-numero-remito-col">
                    <a
                      v-if="remito.transaccionId"
                      class="fitba-inline-link fitba-key-link fw-semibold"
                      :href="buildRemitoLink(remito.transaccionId)"
                      :aria-label="buildSelectRemitoIdLabel(remito.transaccionId)"
                      @click.prevent="selectRemito(remito.transaccionId)"
                    >
                      {{ remito.numeroRemito || "-" }}
                    </a>
                    <div v-else class="fw-semibold">{{ remito.numeroRemito || "-" }}</div>
                  </td>
                  <td class="remitos-fecha-col">
                    {{ formatDateDdMmYyyy(remito.fecha) }}
                  </td>
                  <td
                    class="fitba-cell-truncate fitba-cell-truncate--lg"
                    :title="remito.observacion || undefined"
                  >
                    {{ remito.observacion || "-" }}
                  </td>
                  <td>
                    <a
                      v-if="remito.clienteId"
                      class="fitba-inline-link fitba-key-link"
                      :href="buildClienteLink(remito.clienteId)"
                      :aria-label="buildGoToClienteLabel(remito.clienteId)"
                      @click.prevent="goToCliente(remito.clienteId)"
                    >
                      {{ remito.clienteId }}
                    </a>
                    <span v-else>-</span>
                  </td>
                  <td class="d-none d-lg-table-cell">
                    <a
                      v-if="remito.vendedorId"
                      class="fitba-inline-link fitba-key-link"
                      :href="buildVendedorLink(remito.vendedorId)"
                      :aria-label="buildGoToVendedorLabel(remito.vendedorId)"
                      @click.prevent="goToVendedor(remito.vendedorId)"
                    >
                      {{ remito.vendedorId }}
                    </a>
                    <span v-else>-</span>
                  </td>
                  <td class="fitba-cell-num text-center d-none d-xl-table-cell">
                    {{ remito.comisionVendedor ?? "-" }}
                  </td>
                  <td class="text-center d-none d-xl-table-cell">{{ remito.depositoId ?? "-" }}</td>
                  <td class="text-center d-none d-xl-table-cell">{{ remito.circuitoContableId ?? "-" }}</td>
                  <td class="fitba-cell-num text-center">{{ remito.items.length }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <section v-else class="card shadow-sm">
      <div class="card-body">
        <div class="fitba-statusbar mb-3" role="status" aria-live="polite">
          <span class="fitba-statusbar-item">MODULO: REMITOS</span>
          <span class="fitba-statusbar-item">VISTA: DETALLE</span>
          <span class="fitba-statusbar-item">RTO_ID: {{ selectedRemito.transaccionId ?? "-" }}</span>
          <span class="fitba-statusbar-item">ITMS: {{ selectedRemito.items.length }}</span>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 class="h6 mb-0">Detalle de items del remito</h3>
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            aria-label="Volver al listado de remitos"
            @click="clearSelectedRemito"
          >
            Volver al listado
          </button>
        </div>
        <AsyncEmptyMessage
          v-if="selectedRemito.items.length === 0"
          message="El remito seleccionado no tiene items."
        />

        <div
          v-else
          class="fitba-table-shell fitba-table-responsive fitba-table-responsive--wide"
        >
          <div class="d-md-none">
            <div
              v-for="item in selectedRemito.items"
              :key="`${itemRowKey(item)}-card`"
              class="card mb-2 remito-mobile-card"
            >
              <div class="card-body py-2 px-3">
                <div class="d-flex justify-content-between gap-2 mb-1">
                  <span class="fw-semibold">{{ item.transaccionCVItemId ?? "-" }}</span>
                  <span class="small text-body-secondary">Cant: {{ item.cantidad ?? "-" }}</span>
                </div>
                <div class="small mb-1">
                  <a
                    v-if="item.productoId"
                    class="fitba-inline-link"
                    :href="buildProductoLink(item.productoId)"
                    :aria-label="buildGoToProductoLabel(item.productoId)"
                    @click.prevent="goToProducto(item.productoId)"
                  >
                    {{ item.productoId }}
                  </a>
                  <span v-else>-</span>
                </div>
                <div class="small text-body-secondary">{{ item.descripcion || "-" }}</div>
              </div>
            </div>
          </div>
          <div class="table-responsive d-none d-md-block">
            <table
              class="table table-sm align-middle fitba-table-grid fitba-table-sticky fitba-table-readable"
              data-nav-table="true"
              aria-label="Items del remito"
            >
              <caption class="visually-hidden">
                Items del remito seleccionado con acceso directo al producto.
              </caption>
              <thead class="table-dark">
                <tr>
                  <th scope="col">ITM_ID</th>
                  <th scope="col">TRX_ID</th>
                  <th scope="col">PRD_ID</th>
                  <th scope="col">DESC</th>
                  <th scope="col">CANT</th>
                  <th scope="col">PREC</th>
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
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
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
const reloadButtonRef = ref<HTMLButtonElement | null>(null);

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

const dynamicPageSizeOptions = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40];

const remitosPagination = usePaginatedRows(visibleRemitos, {
  threshold: 8,
  defaultPageSize: 12,
  pageSizeOptions: dynamicPageSizeOptions
});

const paginatedVisibleRemitos = computed(() => remitosPagination.rows.value);

function resolveDynamicRowsPerPage() {
  if (typeof window === "undefined") {
    return 12;
  }
  const viewportHeight = window.innerHeight;
  const mobile = window.innerWidth < 768;
  const reservedHeight = mobile ? 360 : 320;
  const rowHeight = mobile ? 128 : 44;
  const estimated = Math.max(8, Math.floor((viewportHeight - reservedHeight) / rowHeight));
  return dynamicPageSizeOptions.reduce((closest, candidate) => {
    const closestDiff = Math.abs(closest - estimated);
    const candidateDiff = Math.abs(candidate - estimated);
    return candidateDiff < closestDiff ? candidate : closest;
  }, dynamicPageSizeOptions[0]);
}

function syncDynamicPageSize() {
  remitosPagination.setPageSize(resolveDynamicRowsPerPage());
}

const errorMessage = computed(() => {
  const error = remitosQuery.error.value;
  if (!error) {
    return null;
  }
  return resolveErrorMessage(error, "Error inesperado al cargar remitos.");
});

useTableRowNavigation();

onMounted(() => {
  syncDynamicPageSize();
  window.addEventListener("resize", syncDynamicPageSize);
});

onUnmounted(() => {
  window.removeEventListener("resize", syncDynamicPageSize);
});

useAs400Shortcuts({
  onF2: () => {
    const firstContextLink = document.querySelector<HTMLAnchorElement>(
      ".fitba-table-shell tbody a.fitba-inline-link"
    );
    if (firstContextLink) {
      firstContextLink.focus();
      return;
    }
    reloadButtonRef.value?.focus();
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

.remitos-screen {
  letter-spacing: 0.01em;
}

.remitos-fecha-col {
  min-width: 120px;
  white-space: nowrap;
}

.fitba-table-sticky thead th {
  position: sticky;
  top: 0;
  z-index: 2;
}

.fitba-table-readable td,
.fitba-table-readable th {
  vertical-align: middle;
  font-variant-numeric: tabular-nums;
}

.fitba-table-readable tbody tr {
  background-color: transparent;
}

.fitba-table-readable tbody tr:hover {
  background-color: rgba(64, 130, 78, 0.18);
}

.remito-mobile-card {
  border-width: 1px;
  border-radius: 2px;
  border-color: rgba(146, 245, 167, 0.3);
  background:
    linear-gradient(180deg, rgba(10, 26, 14, 0.95), rgba(8, 17, 10, 0.95)),
    repeating-linear-gradient(
      180deg,
      transparent 0,
      transparent 17px,
      rgba(146, 245, 167, 0.03) 17px,
      rgba(146, 245, 167, 0.03) 18px
    );
  box-shadow: inset 0 0 0 1px rgba(146, 245, 167, 0.1);
}

.remito-mobile-label {
  color: var(--fitba-phosphor-ink-soft);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.65rem;
}

.remito-mobile-value {
  color: var(--fitba-phosphor-ink);
}

.remito-mobile-meta {
  color: var(--fitba-phosphor-ink-soft);
  font-variant-numeric: tabular-nums;
}

.remito-mobile-observacion {
  color: var(--fitba-phosphor-ink-soft);
  display: -webkit-box;
  overflow: hidden;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

@media (max-width: 767px) {
  .remito-mobile-card {
    border-color: rgba(20, 58, 31, 0.35);
    background:
      linear-gradient(180deg, rgba(247, 253, 247, 0.98), rgba(237, 247, 238, 0.98)),
      repeating-linear-gradient(
        180deg,
        transparent 0,
        transparent 17px,
        rgba(20, 58, 31, 0.035) 17px,
        rgba(20, 58, 31, 0.035) 18px
      );
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.55);
  }

  .remito-mobile-card .fitba-key-link {
    color: #0f3a1e !important;
    text-decoration-color: rgba(15, 58, 30, 0.65) !important;
  }

  .remito-mobile-card .fitba-key-link:hover {
    color: #08210f !important;
    text-decoration-color: #08210f !important;
  }

  .remito-mobile-card .remito-mobile-label,
  .remito-mobile-card .remito-mobile-meta,
  .remito-mobile-card .remito-mobile-observacion,
  .remito-mobile-card .remito-mobile-value {
    color: #234a2f;
  }
}
</style>
