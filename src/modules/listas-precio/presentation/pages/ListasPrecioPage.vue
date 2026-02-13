<template>
  <section class="card shadow-sm" :aria-busy="listasPrecioQuery.isLoading.value">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="h5 mb-0">Listas de precio (MVP)</h2>
        <button
          type="button"
          class="btn btn-sm btn-outline-success"
          aria-label="Recargar listas de precio"
          @click="reloadListasPrecio"
        >
          Recargar
        </button>
      </div>

      <AsyncLoadingMessage
        v-if="listasPrecioQuery.isLoading.value"
        message="Cargando listas de precio..."
      />

      <AsyncErrorMessage v-else-if="errorMessage" :message="errorMessage" />

      <AsyncEmptyMessage
        v-else-if="listasPrecio.length === 0"
        message="No hay listas de precio disponibles."
      />

      <div v-else class="fitba-table-shell">
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

        <div class="table-responsive">
          <table
            class="table table-sm table-striped table-hover align-middle"
            aria-label="Tabla de listas de precio"
          >
            <caption class="visually-hidden">
              Listado de listas de precio con su estado activo.
            </caption>
            <thead class="table-dark">
              <tr>
                <th scope="col">listaPrecioId</th>
                <th scope="col">nombre</th>
                <th scope="col">descripcion</th>
                <th scope="col">activo</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="lista in paginatedListasPrecio"
                :key="lista.listaPrecioId ?? `${lista.nombre}-${lista.descripcion}`"
              >
                <td>{{ lista.listaPrecioId ?? "-" }}</td>
                <td>{{ lista.nombre || "-" }}</td>
                <td>{{ lista.descripcion || "-" }}</td>
                <td>{{ formatBoolean(lista.activo) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useListasPrecioQuery } from "../../application";
import { createListasPrecioHttpRepository } from "../../infrastructure";
import { runtimeConfig } from "@/shared/config/runtimeConfig";
import { usePaginatedRows } from "@/shared/lib/performance/usePaginatedRows";
import AsyncLoadingMessage from "@/shared/ui/AsyncLoadingMessage.vue";
import AsyncErrorMessage from "@/shared/ui/AsyncErrorMessage.vue";
import AsyncEmptyMessage from "@/shared/ui/AsyncEmptyMessage.vue";
import DataPaginationControls from "@/shared/ui/DataPaginationControls.vue";
import { resolveErrorMessage } from "@/shared/lib/http/resolveErrorMessage";

const listasPrecioRepository = createListasPrecioHttpRepository(runtimeConfig.apiBaseUrl);
const listasPrecioQuery = useListasPrecioQuery(listasPrecioRepository);

const listasPrecio = computed(() => listasPrecioQuery.data.value ?? []);

const listasPrecioPagination = usePaginatedRows(listasPrecio, {
  threshold: 120,
  defaultPageSize: 100,
  pageSizeOptions: [50, 100, 250, 500]
});

const paginatedListasPrecio = computed(() => listasPrecioPagination.rows.value);

const errorMessage = computed(() => {
  const error = listasPrecioQuery.error.value;
  if (!error) {
    return null;
  }
  return resolveErrorMessage(error, "Error inesperado al cargar listas de precio.");
});

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
    console.error("[MVP] Error al recargar listas de precio", error);
  }
}
</script>
