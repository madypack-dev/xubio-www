<template>
  <section class="card shadow-sm fitba-screen--phosphor" :aria-busy="circuitosQuery.isLoading.value">
    <div class="card-body">
      <div class="fitba-statusbar mb-3" role="status" aria-live="polite">
        <span class="fitba-statusbar-item">MODULO: CIRCUITOS CONTABLES</span>
        <span class="fitba-statusbar-item">NOM_FILTRO: {{ appliedFilter || "-" }}</span>
        <span class="fitba-statusbar-item">TOTAL: {{ filteredCircuitos.length }}</span>
      </div>

      <h2 class="h5 mb-3">Circuitos contables</h2>

      <div class="fitba-toolbar mb-3">
        <EntityFilterBar
          input-id="circuito-nombre-input"
          help-id="circuito-search-help"
          label="nombre"
          placeholder="nombre"
          input-aria-label="Filtrar circuitos contables por nombre"
          help-text="Filtra por nombre de circuito contable (busqueda parcial)."
          :model-value="filterInput"
          @update:model-value="onFilterInput"
        />
      </div>

      <AsyncLoadingMessage v-if="circuitosQuery.isLoading.value" message="Cargando circuitos contables..." />
      <AsyncErrorMessage v-else-if="errorMessage" :message="errorMessage" />
      <AsyncNotFoundMessage
        v-else-if="filteredCircuitos.length === 0"
        message="No se encontraron circuitos contables para el filtro indicado."
      />

      <div
        v-else
        class="fitba-table-shell table-responsive fitba-table-responsive fitba-table-responsive--wide"
      >
        <DataPaginationControls
          v-if="pagination.isActive.value"
          entity-label="circuitos"
          :page="pagination.page.value"
          :page-size="pagination.pageSize.value"
          :page-size-options="pagination.pageSizeOptions"
          :total-rows="pagination.totalRows.value"
          :total-pages="pagination.totalPages.value"
          :page-start="pagination.pageStart.value"
          :page-end="pagination.pageEnd.value"
          @update:page="pagination.setPage"
          @update:page-size="pagination.setPageSize"
        />

        <table class="table table-sm table-hover align-middle fitba-table-grid" aria-label="Listado de circuitos contables">
          <caption class="visually-hidden">Listado de circuitos contables con filtro por nombre.</caption>
          <thead class="table-dark">
            <tr>
              <th scope="col">CC_ID</th>
              <th scope="col">CODIGO</th>
              <th scope="col">NOMBRE</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="circuito in paginatedCircuitos" :key="rowKey(circuito)">
              <td>{{ formatText(circuito.circuitoContableId) }}</td>
              <td>{{ formatText(circuito.codigo) }}</td>
              <td>{{ formatText(circuito.nombre) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter, type LocationQueryValue } from "vue-router";
import type { CircuitoContable } from "../../domain";
import { useCircuitosContablesQuery } from "../../application";
import { useCircuitosContablesDependencies } from "../circuitosContablesDependencies";
import { useAs400Shortcuts } from "@/shared/lib/keyboard/useAs400Shortcuts";
import { usePaginatedRows } from "@/shared/lib/performance/usePaginatedRows";
import AsyncLoadingMessage from "@/shared/ui/AsyncLoadingMessage.vue";
import AsyncErrorMessage from "@/shared/ui/AsyncErrorMessage.vue";
import AsyncNotFoundMessage from "@/shared/ui/AsyncNotFoundMessage.vue";
import DataPaginationControls from "@/shared/ui/DataPaginationControls.vue";
import EntityFilterBar from "@/shared/ui/EntityFilterBar.vue";
import { resolveErrorMessage } from "@/shared/lib/http/resolveErrorMessage";
import { createLogger } from "@/shared/lib/observability/logger";

const route = useRoute();
const router = useRouter();
const logger = createLogger("MVP CircuitosContablesPage");
const { circuitosContablesRepository } = useCircuitosContablesDependencies();

const filterInput = ref("");
const appliedFilter = ref("");
const circuitosQuery = useCircuitosContablesQuery(circuitosContablesRepository);

watch(
  () => route.query.circuitoNombre,
  (value) => {
    const normalized = readQueryValue(value) ?? "";
    if (normalized === appliedFilter.value && normalized === filterInput.value) {
      return;
    }
    appliedFilter.value = normalized;
    filterInput.value = normalized;
  },
  { immediate: true }
);

watch(
  () => filterInput.value,
  async (value) => {
    const normalized = value.trim();
    appliedFilter.value = normalized;

    const currentQuery = readQueryValue(route.query.circuitoNombre) ?? "";
    if (normalized === currentQuery) {
      return;
    }

    try {
      await router.replace({
        query: {
          ...route.query,
          circuitoNombre: normalized || undefined
        }
      });
    } catch (error) {
      logger.error("Error al sincronizar filtro de circuito contable en URL", { error, normalized });
    }
  }
);

const circuitos = computed(() => circuitosQuery.data.value ?? []);
const filteredCircuitos = computed(() => {
  const filter = appliedFilter.value.trim().toLowerCase();
  if (!filter) {
    return circuitos.value;
  }
  return circuitos.value.filter((item) =>
    formatText(item.nombre).toLowerCase().includes(filter)
  );
});

const pagination = usePaginatedRows(filteredCircuitos, {
  threshold: 10,
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100]
});
const paginatedCircuitos = computed(() => pagination.rows.value);

const errorMessage = computed(() => {
  const error = circuitosQuery.error.value;
  if (!error) {
    return null;
  }
  return resolveErrorMessage(error, "Error inesperado al cargar circuitos contables.");
});

useAs400Shortcuts({
  onF2: () => document.querySelector<HTMLInputElement>("#circuito-nombre-input")?.focus(),
  onF3: () => {
    filterInput.value = "";
  },
  onF5: reloadCircuitos,
  onBack: () => router.back()
});

function onFilterInput(value: string) {
  filterInput.value = value;
}

async function reloadCircuitos() {
  try {
    await circuitosQuery.refetch();
  } catch (error) {
    logger.error("Error al recargar circuitos contables", { error });
  }
}

function rowKey(item: CircuitoContable) {
  return formatText(item.circuitoContableId || item.codigo || item.nombre);
}

function readQueryValue(value: LocationQueryValue | LocationQueryValue[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return null;
  }
  const normalized = String(raw).trim();
  return normalized ? normalized : null;
}

function formatText(value: unknown): string {
  if (value === null || value === undefined) {
    return "-";
  }
  const normalized = String(value).trim();
  return normalized ? normalized : "-";
}
</script>
