<template>
  <section class="card shadow-sm fitba-screen--phosphor" :aria-busy="vendedoresQuery.isLoading.value">
    <div class="card-body">
      <div class="fitba-statusbar mb-3" role="status" aria-live="polite">
        <span class="fitba-statusbar-item">MODULO: VENDEDORES</span>
        <span class="fitba-statusbar-item">VISTA: {{ selectedVendedor ? "DETALLE" : "LISTADO" }}</span>
        <span class="fitba-statusbar-item">NOM_FILTRO: {{ appliedVendedorFilter || "-" }}</span>
        <span class="fitba-statusbar-item">VND_ID: {{ selectedVendedorId ?? "-" }}</span>
        <span class="fitba-statusbar-item">TOTAL: {{ filteredVendedores.length }}</span>
      </div>

      <h2 class="h5 mb-3">Vendedores</h2>

      <div v-if="selectedVendedor" class="mb-3 d-flex justify-content-between align-items-center">
        <p class="mb-0 small">Detalle de vendedor seleccionado.</p>
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          aria-label="Volver al listado de vendedores"
          @click="clearSelectedVendedor"
        >
          Volver al listado
        </button>
      </div>

      <div v-if="!selectedVendedor" class="fitba-toolbar mb-3">
        <EntityFilterBar
          input-id="vendedor-id-input"
          help-id="vendedor-search-help"
          label="nombre"
          placeholder="nombre"
          input-aria-label="Filtrar vendedores por nombre"
          help-text="Filtra por nombre de vendedor (búsqueda parcial)."
          :model-value="vendedorFilterInput"
          @update:model-value="onVendedorFilterInput"
        />
      </div>

      <AsyncLoadingMessage
        v-if="!selectedVendedor && vendedoresQuery.isLoading.value"
        message="Cargando vendedores..."
      />

      <AsyncErrorMessage v-else-if="!selectedVendedor && errorMessage" :message="errorMessage" />

      <AsyncNotFoundMessage
        v-else-if="!selectedVendedor && filteredVendedores.length === 0"
        message="No se encontraron vendedores para el filtro indicado."
      />

      <div
        v-if="selectedVendedor"
        class="fitba-table-shell table-responsive fitba-table-responsive fitba-table-responsive--detail"
      >
        <table class="table table-sm align-middle fitba-table-grid" aria-label="Detalle de vendedor">
          <caption class="visually-hidden">Detalle del vendedor seleccionado.</caption>
          <tbody>
            <tr>
              <th scope="row" class="fitba-detail-key">VND_ID</th>
              <td class="fitba-key-link">{{ formatText(selectedVendedor.vendedorId) }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">NOMBRE</th>
              <td>{{ formatText(selectedVendedor.nombre) }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">APELLIDO</th>
              <td>{{ formatText(selectedVendedor.apellido) }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">EMAIL</th>
              <td>{{ formatText(selectedVendedor.email) }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">TELEFONO</th>
              <td>{{ formatText(selectedVendedor.telefono) }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">DIRECCION</th>
              <td>{{ formatText(selectedVendedor.direccion) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-else
        class="fitba-table-shell table-responsive fitba-table-responsive fitba-table-responsive--wide"
      >
        <DataPaginationControls
          v-if="vendedoresPagination.isActive.value"
          entity-label="vendedores"
          :page="vendedoresPagination.page.value"
          :page-size="vendedoresPagination.pageSize.value"
          :page-size-options="vendedoresPagination.pageSizeOptions"
          :total-rows="vendedoresPagination.totalRows.value"
          :total-pages="vendedoresPagination.totalPages.value"
          :page-start="vendedoresPagination.pageStart.value"
          :page-end="vendedoresPagination.pageEnd.value"
          @update:page="vendedoresPagination.setPage"
          @update:page-size="vendedoresPagination.setPageSize"
        />

        <table class="table table-sm table-hover align-middle fitba-table-grid" aria-label="Listado de vendedores">
          <caption class="visually-hidden">Listado de vendedores con filtro por nombre.</caption>
          <thead class="table-dark">
            <tr>
              <th scope="col">VND_ID</th>
              <th scope="col">NOM</th>
              <th scope="col">APE</th>
              <th scope="col">EMAIL</th>
              <th scope="col">TEL</th>
              <th scope="col">DIR</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="vendedor in paginatedVendedores" :key="rowKey(vendedor)">
              <td>
                <a href="#" class="fitba-inline-link fitba-key-link" @click.prevent="selectVendedor(vendedor)">
                  {{ formatText(vendedor.vendedorId) }}
                </a>
              </td>
              <td>
                <a href="#" class="fitba-inline-link fitba-key-link" @click.prevent="selectVendedor(vendedor)">
                  {{ formatText(vendedor.nombre) }}
                </a>
              </td>
              <td>{{ formatText(vendedor.apellido) }}</td>
              <td>{{ formatText(vendedor.email) }}</td>
              <td>{{ formatText(vendedor.telefono) }}</td>
              <td>{{ formatText(vendedor.direccion) }}</td>
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
import { useVendedoresQuery } from "../../application";
import type { Vendedor } from "../../domain";
import { useAs400Shortcuts } from "@/shared/lib/keyboard/useAs400Shortcuts";
import { usePaginatedRows } from "@/shared/lib/performance/usePaginatedRows";
import AsyncLoadingMessage from "@/shared/ui/AsyncLoadingMessage.vue";
import AsyncErrorMessage from "@/shared/ui/AsyncErrorMessage.vue";
import AsyncNotFoundMessage from "@/shared/ui/AsyncNotFoundMessage.vue";
import DataPaginationControls from "@/shared/ui/DataPaginationControls.vue";
import EntityFilterBar from "@/shared/ui/EntityFilterBar.vue";
import { resolveErrorMessage } from "@/shared/lib/http/resolveErrorMessage";
import { createLogger } from "@/shared/lib/observability/logger";
import { useVendedoresDependencies } from "../vendedoresDependencies";

const route = useRoute();
const router = useRouter();
const logger = createLogger("MVP VendedoresPage");
const { vendedoresRepository } = useVendedoresDependencies();

const vendedorFilterInput = ref("");
const appliedVendedorFilter = ref("");
const selectedVendedorId = ref<string | null>(null);
const vendedoresQuery = useVendedoresQuery(vendedoresRepository);

watch(
  () => route.query.vendedorNombre,
  (value) => {
    const normalized = readQueryValue(value) ?? "";
    if (normalized === appliedVendedorFilter.value && normalized === vendedorFilterInput.value) {
      return;
    }
    appliedVendedorFilter.value = normalized;
    vendedorFilterInput.value = normalized;
  },
  { immediate: true }
);

watch(
  () => route.query.vendedor,
  (value) => {
    const selectedId = readQueryValue(value);
    if (selectedId === selectedVendedorId.value) {
      return;
    }
    selectedVendedorId.value = selectedId;
  },
  { immediate: true }
);

watch(
  () => vendedorFilterInput.value,
  async (value) => {
    const normalized = value.trim();
    appliedVendedorFilter.value = normalized;

    const currentQueryFiltro = readQueryValue(route.query.vendedorNombre) ?? "";
    if (normalized === currentQueryFiltro) {
      return;
    }

    try {
      await router.replace({
        query: {
          ...route.query,
          vendedorNombre: normalized || undefined
        }
      });
    } catch (error) {
      logger.error("Error al sincronizar filtro de vendedor en URL", { error, normalized });
    }
  }
);

const vendedores = computed(() => vendedoresQuery.data.value ?? []);
const selectedVendedor = computed(() =>
  vendedores.value.find((vendedor) => formatText(vendedor.vendedorId) === selectedVendedorId.value) ?? null
);
const filteredVendedores = computed(() => {
  const filter = appliedVendedorFilter.value.trim().toLowerCase();
  if (!filter) {
    return vendedores.value;
  }
  return vendedores.value.filter((vendedor) =>
    formatText(vendedor.nombre).toLowerCase().includes(filter)
  );
});
const vendedoresPagination = usePaginatedRows(filteredVendedores, {
  threshold: 10,
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100]
});
const paginatedVendedores = computed(() => vendedoresPagination.rows.value);

const errorMessage = computed(() => {
  const error = vendedoresQuery.error.value;
  if (!error) {
    return null;
  }
  return resolveErrorMessage(error, "Error inesperado al cargar vendedores.");
});

useAs400Shortcuts({
  onF2: () => document.querySelector<HTMLInputElement>("#vendedor-id-input")?.focus(),
  onF3: onShortcutF3,
  onF5: reloadVendedores,
  onBack: () => router.back()
});

function onVendedorFilterInput(value: string) {
  vendedorFilterInput.value = value;
}

function selectVendedor(vendedor: Vendedor) {
  const resolvedId = String(vendedor.vendedorId ?? "").trim();
  if (!resolvedId) {
    return;
  }
  selectedVendedorId.value = resolvedId;
  void router.replace({
    query: {
      ...route.query,
      vendedor: resolvedId
    }
  });
}

function clearSelectedVendedor() {
  selectedVendedorId.value = null;
  void router.replace({
    query: {
      ...route.query,
      vendedor: undefined
    }
  });
}

function onShortcutF3() {
  if (selectedVendedor.value) {
    clearSelectedVendedor();
    return;
  }
  vendedorFilterInput.value = "";
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

function rowKey(vendedor: Vendedor) {
  return formatText(vendedor.vendedorId || vendedor.email || vendedor.nombre);
}

async function reloadVendedores() {
  try {
    await vendedoresQuery.refetch();
  } catch (error) {
    logger.error("Error al recargar vendedores", { error });
  }
}
</script>
