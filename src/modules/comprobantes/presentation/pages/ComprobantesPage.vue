<template>
  <section class="card shadow-sm fitba-screen--phosphor" :aria-busy="comprobantesQuery.isLoading.value">
    <div class="card-body">
      <div class="fitba-statusbar mb-3" role="status" aria-live="polite">
        <span class="fitba-statusbar-item">MODULO: COMPROBANTES</span>
        <span class="fitba-statusbar-item">VISTA: {{ selectedComprobanteId ? "DETALLE" : "LISTADO" }}</span>
        <span class="fitba-statusbar-item">NOM_FILTRO: {{ appliedComprobanteFilter || "-" }}</span>
        <span class="fitba-statusbar-item">CBT_ID: {{ selectedComprobanteId ?? "-" }}</span>
        <span class="fitba-statusbar-item">TOTAL: {{ filteredComprobantes.length }}</span>
      </div>

      <h2 class="h5 mb-3">Comprobantes de Venta</h2>

      <div v-if="selectedComprobanteId" class="mb-3 d-flex justify-content-between align-items-center">
        <p class="mb-0 small">Detalle de comprobante seleccionado.</p>
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          aria-label="Volver al listado de comprobantes"
          @click="clearSelection"
        >
          Volver al listado
        </button>
      </div>

      <div v-if="!selectedComprobanteId" class="fitba-toolbar mb-3">
        <EntityFilterBar
          input-id="comprobante-search-input"
          help-id="comprobante-search-help"
          label="nombre"
          placeholder="nombre"
          input-aria-label="Filtrar comprobantes por nombre"
          help-text="Filtra por nombre de comprobante (búsqueda parcial)."
          :model-value="comprobanteFilterInput"
          @update:model-value="onComprobanteFilterInput"
        />
      </div>

      <AsyncLoadingMessage
        v-if="!selectedComprobanteId && comprobantesQuery.isLoading.value"
        message="Cargando comprobantes..."
      />

      <AsyncErrorMessage
        v-else-if="!selectedComprobanteId && listErrorMessage"
        :message="listErrorMessage"
      />

      <AsyncEmptyMessage
        v-else-if="!selectedComprobanteId && filteredComprobantes.length === 0"
        message="No hay comprobantes para el filtro indicado."
      />

      <div
        v-if="selectedComprobanteId"
        class="fitba-table-shell table-responsive fitba-table-responsive fitba-table-responsive--detail"
      >
        <AsyncLoadingMessage
          v-if="detailQuery.isLoading.value"
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

        <table
          v-else
          class="table table-sm align-middle fitba-table-grid"
          aria-label="Detalle de comprobante"
        >
          <caption class="visually-hidden">Detalle del comprobante seleccionado.</caption>
          <tbody>
            <tr>
              <th scope="row" class="fitba-detail-key">CBT_ID</th>
              <td class="fitba-key-link">{{ comprobanteDetail.comprobanteVentaId ?? "-" }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">NOMBRE</th>
              <td>{{ comprobanteDetail.nombre || "-" }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">FECHA</th>
              <td>{{ comprobanteDetail.fecha ?? "-" }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">FECHA_VTO</th>
              <td>{{ comprobanteDetail.fechaVto ?? "-" }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">CAE_FEC_VTO</th>
              <td>{{ comprobanteDetail.caeFechaVto ?? "-" }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">CLIENTE</th>
              <td>{{ comprobanteDetail.clienteNombre || "-" }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">VENDEDOR</th>
              <td>{{ comprobanteDetail.vendedorNombre || "-" }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">IMP_TOTAL</th>
              <td class="fitba-cell-num">{{ formatMoney(comprobanteDetail.importeTotal) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-else
        class="fitba-table-shell table-responsive fitba-table-responsive fitba-table-responsive--medium"
      >
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
              <th scope="col">CBT_ID</th>
              <th scope="col">NOM</th>
              <th scope="col">FEC</th>
              <th scope="col">CLI</th>
              <th scope="col">IMP_TOT</th>
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
                  class="fitba-inline-link fitba-key-link"
                  data-nav-main="true"
                  :href="buildComprobanteLink(comprobante.comprobanteVentaId)"
                  :aria-label="buildDetailLabel(comprobante.comprobanteVentaId)"
                  @click.prevent="selectComprobanteById(comprobante.comprobanteVentaId)"
                >
                  {{ comprobante.comprobanteVentaId }}
                </a>
                <span v-else>-</span>
              </td>
              <td>
                <a
                  v-if="comprobante.comprobanteVentaId"
                  class="fitba-inline-link fitba-key-link"
                  :href="buildComprobanteLink(comprobante.comprobanteVentaId)"
                  :aria-label="buildDetailLabel(comprobante.comprobanteVentaId)"
                  @click.prevent="selectComprobanteById(comprobante.comprobanteVentaId)"
                >
                  {{ comprobante.nombre || "-" }}
                </a>
                <span v-else>{{ comprobante.nombre || "-" }}</span>
              </td>
              <td>{{ comprobante.fecha ?? "-" }}</td>
              <td>{{ comprobante.clienteNombre || "-" }}</td>
              <td class="fitba-cell-num">{{ formatMoney(comprobante.importeTotal) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useComprobanteDetailQuery, useComprobantesQuery } from "../../application";
import { usePaginatedRows } from "@/shared/lib/performance/usePaginatedRows";
import { useAs400Shortcuts } from "@/shared/lib/keyboard/useAs400Shortcuts";
import { useTableRowNavigation } from "@/shared/lib/keyboard/useTableRowNavigation";
import AsyncLoadingMessage from "@/shared/ui/AsyncLoadingMessage.vue";
import AsyncErrorMessage from "@/shared/ui/AsyncErrorMessage.vue";
import AsyncEmptyMessage from "@/shared/ui/AsyncEmptyMessage.vue";
import AsyncNotFoundMessage from "@/shared/ui/AsyncNotFoundMessage.vue";
import DataPaginationControls from "@/shared/ui/DataPaginationControls.vue";
import EntityFilterBar from "@/shared/ui/EntityFilterBar.vue";
import { resolveErrorMessage } from "@/shared/lib/http/resolveErrorMessage";
import { createLogger } from "@/shared/lib/observability/logger";
import { formatMoney } from "@/shared/lib/formatters/money";
import { useComprobantesDependencies } from "../comprobantesDependencies";
import { useComprobantesNavigation } from "../useComprobantesNavigation";

const route = useRoute();
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
const detailQuery = useComprobanteDetailQuery(
  selectedComprobanteId,
  comprobantesRepository
);

const comprobanteFilterInput = ref("");
const appliedComprobanteFilter = ref("");

watch(
  () => route.query.comprobanteNombre,
  (value) => {
    const normalized = readQueryValue(value) ?? "";
    if (normalized === appliedComprobanteFilter.value && normalized === comprobanteFilterInput.value) {
      return;
    }
    appliedComprobanteFilter.value = normalized;
    comprobanteFilterInput.value = normalized;
  },
  { immediate: true }
);

watch(
  () => comprobanteFilterInput.value,
  async (value) => {
    const normalized = value.trim();
    appliedComprobanteFilter.value = normalized;

    const currentQueryFiltro = readQueryValue(route.query.comprobanteNombre) ?? "";
    if (normalized === currentQueryFiltro) {
      return;
    }

    try {
      await router.replace({
        query: {
          ...route.query,
          comprobanteNombre: normalized || undefined
        }
      });
    } catch (error) {
      logger.error("Error al sincronizar filtro de comprobante en URL", { error, normalized });
    }
  }
);

const comprobantes = computed(() => comprobantesQuery.data.value ?? []);
const filteredComprobantes = computed(() => {
  const filter = appliedComprobanteFilter.value.trim().toLowerCase();
  if (!filter) {
    return comprobantes.value;
  }
  return comprobantes.value.filter((comprobante) =>
    String(comprobante.nombre ?? "").toLowerCase().includes(filter)
  );
});
const comprobanteDetail = computed(() => detailQuery.data.value ?? null);

const comprobantesPagination = usePaginatedRows(filteredComprobantes, {
  threshold: 10,
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100]
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
    document.querySelector<HTMLInputElement>("#comprobante-search-input")?.focus();
  },
  onF3: clearSelection,
  onF5: reloadComprobantes,
  onBack: () => router.back()
});

function readQueryValue(value: unknown): string | null {
  if (Array.isArray(value)) {
    const first = value[0];
    const normalized = String(first ?? "").trim();
    return normalized ? normalized : null;
  }
  const normalized = String(value ?? "").trim();
  return normalized ? normalized : null;
}

function onComprobanteFilterInput(value: string) {
  comprobanteFilterInput.value = value;
}

async function reloadComprobantes() {
  try {
    await comprobantesQuery.refetch();
  } catch (error) {
    logger.error("Error al recargar comprobantes", { error });
  }
}
</script>
