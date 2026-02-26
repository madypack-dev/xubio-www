<template>
  <section class="card shadow-sm fitba-screen--phosphor" :aria-busy="depositosQuery.isLoading.value">
    <div class="card-body">
      <div class="fitba-statusbar mb-3" role="status" aria-live="polite">
        <span class="fitba-statusbar-item">MODULO: DEPOSITOS</span>
        <span class="fitba-statusbar-item">NOM_FILTRO: {{ appliedDepositoFilter || "-" }}</span>
        <span class="fitba-statusbar-item">TOTAL: {{ filteredDepositos.length }}</span>
      </div>

      <h2 class="h5 mb-3">Depositos</h2>

      <div class="fitba-toolbar mb-3">
        <EntityFilterBar
          input-id="deposito-nombre-input"
          help-id="deposito-search-help"
          label="nombre"
          placeholder="nombre"
          input-aria-label="Filtrar depositos por nombre"
          help-text="Filtra por nombre de deposito (busqueda parcial)."
          :model-value="depositoFilterInput"
          @update:model-value="onDepositoFilterInput"
        />
      </div>

      <AsyncLoadingMessage
        v-if="depositosQuery.isLoading.value"
        message="Cargando depositos..."
      />

      <AsyncErrorMessage v-else-if="errorMessage" :message="errorMessage" />

      <AsyncNotFoundMessage
        v-else-if="filteredDepositos.length === 0"
        message="No se encontraron depositos para el filtro indicado."
      />

      <div
        v-else
        class="fitba-table-shell table-responsive fitba-table-responsive fitba-table-responsive--wide"
      >
        <DataPaginationControls
          v-if="depositosPagination.isActive.value"
          entity-label="depositos"
          :page="depositosPagination.page.value"
          :page-size="depositosPagination.pageSize.value"
          :page-size-options="depositosPagination.pageSizeOptions"
          :total-rows="depositosPagination.totalRows.value"
          :total-pages="depositosPagination.totalPages.value"
          :page-start="depositosPagination.pageStart.value"
          :page-end="depositosPagination.pageEnd.value"
          @update:page="depositosPagination.setPage"
          @update:page-size="depositosPagination.setPageSize"
        />

        <table class="table table-sm table-hover align-middle fitba-table-grid" aria-label="Listado de depositos">
          <caption class="visually-hidden">Listado de depositos con filtro por nombre.</caption>
          <thead class="table-dark">
            <tr>
              <th scope="col">DEP_ID</th>
              <th scope="col">NOMBRE</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="deposito in paginatedDepositos" :key="rowKey(deposito)">
              <td>{{ formatText(deposito.depositoId) }}</td>
              <td>{{ formatText(deposito.nombre) }}</td>
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
import type { Deposito } from "../../domain";
import { useDepositosQuery } from "../../application";
import { useDepositosDependencies } from "../depositosDependencies";
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
const logger = createLogger("MVP DepositosPage");
const { depositosRepository } = useDepositosDependencies();

const depositoFilterInput = ref("");
const appliedDepositoFilter = ref("");
const depositosQuery = useDepositosQuery(depositosRepository);

watch(
  () => route.query.depositoNombre,
  (value) => {
    const normalized = readQueryValue(value) ?? "";
    if (normalized === appliedDepositoFilter.value && normalized === depositoFilterInput.value) {
      return;
    }
    appliedDepositoFilter.value = normalized;
    depositoFilterInput.value = normalized;
  },
  { immediate: true }
);

watch(
  () => depositoFilterInput.value,
  async (value) => {
    const normalized = value.trim();
    appliedDepositoFilter.value = normalized;

    const currentQueryFiltro = readQueryValue(route.query.depositoNombre) ?? "";
    if (normalized === currentQueryFiltro) {
      return;
    }

    try {
      await router.replace({
        query: {
          ...route.query,
          depositoNombre: normalized || undefined
        }
      });
    } catch (error) {
      logger.error("Error al sincronizar filtro de deposito en URL", { error, normalized });
    }
  }
);

const depositos = computed(() => depositosQuery.data.value ?? []);
const filteredDepositos = computed(() => {
  const filter = appliedDepositoFilter.value.trim().toLowerCase();
  if (!filter) {
    return depositos.value;
  }
  return depositos.value.filter((deposito) =>
    formatText(deposito.nombre).toLowerCase().includes(filter)
  );
});

const depositosPagination = usePaginatedRows(filteredDepositos, {
  threshold: 10,
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100]
});
const paginatedDepositos = computed(() => depositosPagination.rows.value);

const errorMessage = computed(() => {
  const error = depositosQuery.error.value;
  if (!error) {
    return null;
  }
  return resolveErrorMessage(error, "Error inesperado al cargar depositos.");
});

useAs400Shortcuts({
  onF2: () => document.querySelector<HTMLInputElement>("#deposito-nombre-input")?.focus(),
  onF3: () => {
    depositoFilterInput.value = "";
  },
  onF5: reloadDepositos,
  onBack: () => router.back()
});

function onDepositoFilterInput(value: string) {
  depositoFilterInput.value = value;
}

function rowKey(deposito: Deposito) {
  return formatText(deposito.depositoId || deposito.nombre);
}

async function reloadDepositos() {
  try {
    await depositosQuery.refetch();
  } catch (error) {
    logger.error("Error al recargar depositos", { error });
  }
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
