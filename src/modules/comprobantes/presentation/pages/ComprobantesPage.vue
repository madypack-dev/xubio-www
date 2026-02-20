<template>
  <div class="d-flex flex-column gap-3">
    <section class="card shadow-sm" :aria-busy="comprobantesQuery.isLoading.value">
      <div class="card-body">
        <div class="fitba-toolbar d-flex justify-content-between align-items-center mb-3">
          <h2 class="h5 mb-0">Comprobantes (MVP)</h2>
          <button
            type="button"
            class="btn btn-sm btn-outline-success"
            aria-label="Recargar comprobantes"
            @click="reloadComprobantes"
          >
            Recargar
          </button>
        </div>

        <AsyncLoadingMessage
          v-if="comprobantesQuery.isLoading.value"
          message="Cargando comprobantes..."
        />

        <AsyncErrorMessage
          v-else-if="listErrorMessage"
          :message="listErrorMessage"
        />

        <AsyncEmptyMessage
          v-else-if="comprobantes.length === 0"
          message="No hay comprobantes disponibles."
        />

        <div v-else class="fitba-table-shell">
          <DataPaginationControls
            v-if="comprobantesPagination.isActive.value"
            entity-label="comprobantes"
            :page="comprobantesPagination.page.value"
            :page-size="comprobantesPagination.pageSize.value"
            :page-size-options="comprobantesPagination.pageSizeOptions"
            :total-rows="comprobantesPagination.totalRows.value"
            :total-pages="comprobantesPagination.totalPages.value"
            :page-start="comprobantesPagination.pageStart.value"
            :page-end="comprobantesPagination.pageEnd.value"
            @update:page="comprobantesPagination.setPage"
            @update:page-size="comprobantesPagination.setPageSize"
          />

          <div class="table-responsive fitba-table-responsive fitba-table-responsive--medium">
            <table
              class="table table-sm table-striped table-hover align-middle fitba-table-grid"
              data-nav-table="true"
              aria-label="Tabla de comprobantes"
            >
              <caption class="visually-hidden">
                Listado de comprobantes con acceso al detalle.
              </caption>
              <thead class="table-dark">
                <tr>
                  <th scope="col">id</th>
                  <th scope="col">nombre</th>
                  <th scope="col">fecha</th>
                  <th scope="col">cliente</th>
                  <th scope="col">importeTotal</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="comprobante in paginatedComprobantes"
                  :key="comprobante.comprobanteVentaId ?? comprobante.nombre"
                  data-nav-row="true"
                  tabindex="-1"
                >
                  <td>
                    <a
                      v-if="comprobante.comprobanteVentaId"
                      class="fitba-inline-link"
                      data-nav-main="true"
                      :href="buildComprobanteLink(comprobante.comprobanteVentaId)"
                      :aria-label="buildDetailLabel(comprobante.comprobanteVentaId)"
                      @click.prevent="selectComprobanteById(comprobante.comprobanteVentaId)"
                    >
                      {{ comprobante.comprobanteVentaId }}
                    </a>
                    <span v-else>-</span>
                  </td>
                  <td>{{ comprobante.nombre || "-" }}</td>
                  <td>{{ comprobante.fecha ?? "-" }}</td>
                  <td>{{ comprobante.clienteNombre || "-" }}</td>
                  <td class="fitba-cell-num">{{ comprobante.importeTotal ?? "-" }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <section class="card shadow-sm" :aria-busy="detailQuery.isLoading.value">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 class="h6 mb-0">Detalle de comprobante</h3>
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            aria-label="Limpiar comprobante seleccionado"
            ref="clearButtonRef"
            @click="clearSelection"
          >
            Limpiar
          </button>
        </div>

        <AsyncEmptyMessage
          v-if="!selectedComprobanteId"
          message="Selecciona un comprobante para ver el detalle."
        />

        <AsyncLoadingMessage
          v-else-if="detailQuery.isLoading.value"
          message="Cargando detalle..."
        />

        <AsyncErrorMessage
          v-else-if="detailErrorMessage"
          :message="detailErrorMessage"
        />

        <AsyncNotFoundMessage
          v-else-if="!comprobanteDetail"
          message="No se encontro detalle para el comprobante seleccionado."
        />

        <div
          v-else
          class="fitba-table-shell table-responsive fitba-table-responsive fitba-table-responsive--detail"
        >
          <table class="table table-sm align-middle fitba-table-grid" aria-label="Detalle de comprobante">
            <caption class="visually-hidden">Detalle del comprobante seleccionado.</caption>
            <tbody>
              <tr>
                <th scope="row" class="fitba-detail-key">ID</th>
                <td>{{ comprobanteDetail.comprobanteVentaId ?? "-" }}</td>
              </tr>
              <tr>
                <th scope="row" class="fitba-detail-key">Nombre</th>
                <td>{{ comprobanteDetail.nombre || "-" }}</td>
              </tr>
              <tr>
                <th scope="row" class="fitba-detail-key">Fecha</th>
                <td>{{ comprobanteDetail.fecha ?? "-" }}</td>
              </tr>
              <tr>
                <th scope="row" class="fitba-detail-key">FechaVto</th>
                <td>{{ comprobanteDetail.fechaVto ?? "-" }}</td>
              </tr>
              <tr>
                <th scope="row" class="fitba-detail-key">Cliente</th>
                <td>{{ comprobanteDetail.clienteNombre || "-" }}</td>
              </tr>
              <tr>
                <th scope="row" class="fitba-detail-key">Vendedor</th>
                <td>{{ comprobanteDetail.vendedorNombre || "-" }}</td>
              </tr>
              <tr>
                <th scope="row" class="fitba-detail-key">Importe total</th>
                <td class="fitba-cell-num">{{ comprobanteDetail.importeTotal ?? "-" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useComprobanteDetailQuery, useComprobantesQuery } from "../../application";
import { usePaginatedRows } from "@/shared/lib/performance/usePaginatedRows";
import { useAs400Shortcuts } from "@/shared/lib/keyboard/useAs400Shortcuts";
import { useTableRowNavigation } from "@/shared/lib/keyboard/useTableRowNavigation";
import AsyncLoadingMessage from "@/shared/ui/AsyncLoadingMessage.vue";
import AsyncErrorMessage from "@/shared/ui/AsyncErrorMessage.vue";
import AsyncEmptyMessage from "@/shared/ui/AsyncEmptyMessage.vue";
import AsyncNotFoundMessage from "@/shared/ui/AsyncNotFoundMessage.vue";
import DataPaginationControls from "@/shared/ui/DataPaginationControls.vue";
import { resolveErrorMessage } from "@/shared/lib/http/resolveErrorMessage";
import { createLogger } from "@/shared/lib/observability/logger";
import { useComprobantesDependencies } from "../comprobantesDependencies";
import { useComprobantesNavigation } from "../useComprobantesNavigation";

const logger = createLogger("MVP ComprobantesPage");
const { comprobantesRepository } = useComprobantesDependencies();
const comprobantesQuery = useComprobantesQuery(comprobantesRepository);
const {
  router,
  selectedComprobanteId,
  buildComprobanteLink,
  buildDetailLabel,
  selectComprobanteById,
  clearSelection
} = useComprobantesNavigation(logger);
const clearButtonRef = ref<HTMLButtonElement | null>(null);
const detailQuery = useComprobanteDetailQuery(
  selectedComprobanteId,
  comprobantesRepository
);

const comprobantes = computed(() => comprobantesQuery.data.value ?? []);
const comprobanteDetail = computed(() => detailQuery.data.value ?? null);

const comprobantesPagination = usePaginatedRows(comprobantes, {
  threshold: 120,
  defaultPageSize: 100,
  pageSizeOptions: [50, 100, 250, 500]
});

const paginatedComprobantes = computed(() => comprobantesPagination.rows.value);

const listErrorMessage = computed(() => {
  const error = comprobantesQuery.error.value;
  if (!error) {
    return null;
  }
  return resolveErrorMessage(error, "Error inesperado al cargar comprobantes.");
});

const detailErrorMessage = computed(() => {
  const error = detailQuery.error.value;
  if (!error) {
    return null;
  }
  return resolveErrorMessage(error, "Error inesperado al cargar detalle.");
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
  onF3: clearSelection,
  onF5: reloadComprobantes,
  onBack: () => router.back()
});

async function reloadComprobantes() {
  try {
    await comprobantesQuery.refetch();
  } catch (error) {
    logger.error("Error al recargar comprobantes", { error });
  }
}
</script>
