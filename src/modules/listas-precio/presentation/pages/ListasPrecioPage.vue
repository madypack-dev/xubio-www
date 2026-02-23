<template>
  <section class="card shadow-sm fitba-screen--phosphor" :aria-busy="listasPrecioQuery.isLoading.value">
    <div class="card-body">
      <div class="fitba-statusbar mb-3" role="status" aria-live="polite">
        <span class="fitba-statusbar-item">MODULO: LISTAS_PRECIO</span>
        <span class="fitba-statusbar-item">VISTA: {{ selectedLista ? "DETALLE" : "LISTADO" }}</span>
        <span class="fitba-statusbar-item">NOM_FILTRO: {{ appliedListaFilter || "-" }}</span>
        <span class="fitba-statusbar-item">LPR_ID: {{ selectedListaId ?? "-" }}</span>
        <span class="fitba-statusbar-item">TOTAL: {{ filteredListasPrecio.length }}</span>
      </div>

      <h2 class="h5 mb-3">Listas de precio</h2>

      <div v-if="selectedLista" class="mb-3 d-flex justify-content-between align-items-center">
        <p class="mb-0 small">Detalle de lista seleccionada.</p>
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          aria-label="Volver al listado de listas de precio"
          @click="clearSelectedLista"
        >
          Volver al listado
        </button>
      </div>

      <div v-if="!selectedLista" class="fitba-toolbar mb-3">
        <EntityFilterBar
          input-id="lista-precio-input"
          help-id="lista-precio-search-help"
          label="nombre"
          placeholder="nombre"
          input-aria-label="Filtrar listas de precio por nombre"
          help-text="Filtra por nombre de lista (búsqueda parcial)."
          :model-value="listaFilterInput"
          @update:model-value="onListaFilterInput"
        />
      </div>

      <AsyncLoadingMessage
        v-if="!selectedLista && listasPrecioQuery.isLoading.value"
        message="Cargando listas de precio..."
      />

      <AsyncErrorMessage v-else-if="!selectedLista && errorMessage" :message="errorMessage" />

      <AsyncEmptyMessage
        v-else-if="!selectedLista && filteredListasPrecio.length === 0"
        message="No hay listas de precio para el filtro indicado."
      />

      <div
        v-if="selectedLista"
        class="fitba-table-shell table-responsive fitba-table-responsive fitba-table-responsive--detail"
      >
        <table class="table table-sm align-middle fitba-table-grid" aria-label="Detalle de lista de precio">
          <caption class="visually-hidden">Detalle de la lista de precio seleccionada.</caption>
          <tbody>
            <tr>
              <th scope="row" class="fitba-detail-key">LPR_ID</th>
              <td class="fitba-key-link">{{ selectedLista.listaPrecioId ?? "-" }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">NOMBRE</th>
              <td>{{ selectedLista.nombre || "-" }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">DESCRIPCION</th>
              <td>{{ selectedLista.descripcion || "-" }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">ACTIVO</th>
              <td>{{ formatBoolean(selectedLista.activo) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-else
        class="fitba-table-shell table-responsive fitba-table-responsive fitba-table-responsive--medium"
      >
        <DataPaginationControls
          v-if="listasPrecioPagination.isActive.value"
          entity-label="listas"
          :page="listasPrecioPagination.page.value"
          :page-size="listasPrecioPagination.pageSize.value"
          :page-size-options="listasPrecioPagination.pageSizeOptions"
          :total-rows="listasPrecioPagination.totalRows.value"
          :total-pages="listasPrecioPagination.totalPages.value"
          :page-start="listasPrecioPagination.pageStart.value"
          :page-end="listasPrecioPagination.pageEnd.value"
          @update:page="listasPrecioPagination.setPage"
          @update:page-size="listasPrecioPagination.setPageSize"
        />

        <table
          class="table table-sm table-striped table-hover align-middle fitba-table-grid"
          aria-label="Tabla de listas de precio"
        >
          <caption class="visually-hidden">
            Listado de listas de precio con su estado activo.
          </caption>
          <thead class="table-dark">
            <tr>
              <th scope="col">LPR_ID</th>
              <th scope="col">NOM</th>
              <th scope="col">DESC</th>
              <th scope="col">ACT</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="lista in paginatedListasPrecio"
              :key="lista.listaPrecioId ?? `${lista.nombre}-${lista.descripcion}`"
            >
              <td>
                <a href="#" class="fitba-inline-link fitba-key-link" @click.prevent="selectLista(lista)">
                  {{ lista.listaPrecioId ?? "-" }}
                </a>
              </td>
              <td>
                <a href="#" class="fitba-inline-link fitba-key-link" @click.prevent="selectLista(lista)">
                  {{ lista.nombre || "-" }}
                </a>
              </td>
              <td>{{ lista.descripcion || "-" }}</td>
              <td>{{ formatBoolean(lista.activo) }}</td>
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
import { useListasPrecioQuery } from "../../application";
import type { ListaPrecio } from "../../domain";
import { usePaginatedRows } from "@/shared/lib/performance/usePaginatedRows";
import { useAs400Shortcuts } from "@/shared/lib/keyboard/useAs400Shortcuts";
import AsyncLoadingMessage from "@/shared/ui/AsyncLoadingMessage.vue";
import AsyncErrorMessage from "@/shared/ui/AsyncErrorMessage.vue";
import AsyncEmptyMessage from "@/shared/ui/AsyncEmptyMessage.vue";
import DataPaginationControls from "@/shared/ui/DataPaginationControls.vue";
import EntityFilterBar from "@/shared/ui/EntityFilterBar.vue";
import { resolveErrorMessage } from "@/shared/lib/http/resolveErrorMessage";
import { createLogger } from "@/shared/lib/observability/logger";
import { useListasPrecioDependencies } from "../listasPrecioDependencies";

const route = useRoute();
const router = useRouter();
const logger = createLogger("MVP ListasPrecioPage");
const { listasPrecioRepository } = useListasPrecioDependencies();
const listasPrecioQuery = useListasPrecioQuery(listasPrecioRepository);

const listaFilterInput = ref("");
const appliedListaFilter = ref("");
const selectedListaId = ref<string | null>(null);

watch(
  () => route.query.listaPrecioNombre,
  (value) => {
    const normalized = readQueryValue(value) ?? "";
    if (normalized === appliedListaFilter.value && normalized === listaFilterInput.value) {
      return;
    }
    appliedListaFilter.value = normalized;
    listaFilterInput.value = normalized;
  },
  { immediate: true }
);

watch(
  () => route.query.listaPrecio,
  (value) => {
    const selectedId = readQueryValue(value);
    if (selectedId === selectedListaId.value) {
      return;
    }
    selectedListaId.value = selectedId;
  },
  { immediate: true }
);

watch(
  () => listaFilterInput.value,
  async (value) => {
    const normalized = value.trim();
    appliedListaFilter.value = normalized;

    const currentQueryFiltro = readQueryValue(route.query.listaPrecioNombre) ?? "";
    if (normalized === currentQueryFiltro) {
      return;
    }

    try {
      await router.replace({
        query: {
          ...route.query,
          listaPrecioNombre: normalized || undefined
        }
      });
    } catch (error) {
      logger.error("Error al sincronizar filtro de lista de precio en URL", { error, normalized });
    }
  }
);

const listasPrecio = computed(() => listasPrecioQuery.data.value ?? []);
const selectedLista = computed(() =>
  listasPrecio.value.find((lista) => String(lista.listaPrecioId ?? "") === selectedListaId.value) ?? null
);
const filteredListasPrecio = computed(() => {
  const filter = appliedListaFilter.value.trim().toLowerCase();
  if (!filter) {
    return listasPrecio.value;
  }
  return listasPrecio.value.filter((lista) =>
    String(lista.nombre ?? "").toLowerCase().includes(filter)
  );
});

const listasPrecioPagination = usePaginatedRows(filteredListasPrecio, {
  threshold: 10,
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100]
});

const paginatedListasPrecio = computed(() => listasPrecioPagination.rows.value);

const errorMessage = computed(() => {
  const error = listasPrecioQuery.error.value;
  if (!error) {
    return null;
  }
  return resolveErrorMessage(error, "Error inesperado al cargar listas de precio.");
});

useAs400Shortcuts({
  onF2: () => document.querySelector<HTMLInputElement>("#lista-precio-input")?.focus(),
  onF3: onShortcutF3,
  onF5: reloadListasPrecio,
  onBack: () => router.back()
});

function readQueryValue(value: LocationQueryValue | LocationQueryValue[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return null;
  }
  const normalized = String(raw).trim();
  return normalized ? normalized : null;
}

function onListaFilterInput(value: string) {
  listaFilterInput.value = value;
}

function selectLista(lista: ListaPrecio) {
  const resolvedId = String(lista.listaPrecioId ?? "").trim();
  if (!resolvedId) {
    return;
  }
  selectedListaId.value = resolvedId;
  void router.replace({
    query: {
      ...route.query,
      listaPrecio: resolvedId
    }
  });
}

function clearSelectedLista() {
  selectedListaId.value = null;
  void router.replace({
    query: {
      ...route.query,
      listaPrecio: undefined
    }
  });
}

function onShortcutF3() {
  if (selectedLista.value) {
    clearSelectedLista();
    return;
  }
  listaFilterInput.value = "";
}

function formatBoolean(value: boolean | null) {
  if (value === null) {
    return "-";
  }
  return value ? "Si" : "No";
}

async function reloadListasPrecio() {
  try {
    await listasPrecioQuery.refetch();
  } catch (error) {
    logger.error("Error al recargar listas de precio", { error });
  }
}
</script>
