<template>
  <section class="card shadow-sm fitba-screen--phosphor" :aria-busy="productosQuery.isLoading.value">
    <div class="card-body">
      <div class="fitba-statusbar mb-3" role="status" aria-live="polite">
        <span class="fitba-statusbar-item">MODULO: PRODUCTOS</span>
        <span class="fitba-statusbar-item">VISTA: {{ selectedProducto ? "DETALLE" : "LISTADO" }}</span>
        <span class="fitba-statusbar-item">NOM_FILTRO: {{ appliedProductoFilter || "-" }}</span>
        <span class="fitba-statusbar-item">PRD_ID: {{ selectedProductoId ?? "-" }}</span>
        <span class="fitba-statusbar-item">TOTAL: {{ filteredProductos.length }}</span>
      </div>

      <h2 class="h5 mb-3">Productos</h2>

      <div v-if="selectedProducto" class="mb-3 d-flex justify-content-between align-items-center">
        <p class="mb-0 small">Detalle de producto seleccionado.</p>
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          aria-label="Volver al listado de productos"
          @click="clearSelectedProducto"
        >
          Volver al listado
        </button>
      </div>

      <div v-if="!selectedProducto" class="fitba-toolbar mb-3">
        <EntityFilterBar
          input-id="producto-id-input"
          help-id="producto-search-help"
          label="nombre"
          placeholder="nombre"
          input-aria-label="Filtrar productos por nombre"
          help-text="Filtra por nombre de producto (búsqueda parcial)."
          :model-value="productoFilterInput"
          @update:model-value="onProductoFilterInput"
        />
      </div>

      <AsyncLoadingMessage
        v-if="!selectedProducto && productosQuery.isLoading.value"
        message="Cargando productos..."
      />

      <AsyncErrorMessage v-else-if="!selectedProducto && errorMessage" :message="errorMessage" />

      <AsyncNotFoundMessage
        v-else-if="!selectedProducto && filteredProductos.length === 0"
        message="No se encontraron productos para el filtro indicado."
      />

      <div
        v-if="selectedProducto"
        class="fitba-table-shell table-responsive fitba-table-responsive fitba-table-responsive--detail"
      >
        <table class="table table-sm align-middle fitba-table-grid" aria-label="Detalle de producto">
          <caption class="visually-hidden">Detalle del producto seleccionado.</caption>
          <tbody>
            <tr>
              <th scope="row" class="fitba-detail-key">PRD_ID</th>
              <td class="fitba-key-link">{{ formatText(selectedProducto.productoId) }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">NOMBRE</th>
              <td>{{ formatText(selectedProducto.nombre) }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">CODIGO</th>
              <td>{{ formatText(selectedProducto.codigo) }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">COD_BARRA</th>
              <td>{{ formatText(selectedProducto.codigoBarra) }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">P_ULT_COMPRA</th>
              <td class="fitba-cell-num">{{ selectedProducto.precioUltCompra ?? "-" }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">ACTIVO</th>
              <td>{{ formatBoolean(selectedProducto.activo) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-else
        class="fitba-table-shell table-responsive fitba-table-responsive fitba-table-responsive--wide"
      >
        <DataPaginationControls
          v-if="productosPagination.isActive.value"
          entity-label="productos"
          :page="productosPagination.page.value"
          :page-size="productosPagination.pageSize.value"
          :page-size-options="productosPagination.pageSizeOptions"
          :total-rows="productosPagination.totalRows.value"
          :total-pages="productosPagination.totalPages.value"
          :page-start="productosPagination.pageStart.value"
          :page-end="productosPagination.pageEnd.value"
          @update:page="productosPagination.setPage"
          @update:page-size="productosPagination.setPageSize"
        />

        <table class="table table-sm table-hover align-middle fitba-table-grid" aria-label="Listado de productos">
          <caption class="visually-hidden">Listado de productos con filtro por nombre.</caption>
          <thead class="table-dark">
            <tr>
              <th scope="col">PRD_ID</th>
              <th scope="col">NOM</th>
              <th scope="col">COD</th>
              <th scope="col">COD_BARRA</th>
              <th scope="col">P_ULT_COMPRA</th>
              <th scope="col">ACT</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="producto in paginatedProductos" :key="rowKey(producto)">
              <td>
                <a href="#" class="fitba-inline-link fitba-key-link" @click.prevent="selectProducto(producto)">
                  {{ formatText(producto.productoId) }}
                </a>
              </td>
              <td>
                <a href="#" class="fitba-inline-link fitba-key-link" @click.prevent="selectProducto(producto)">
                  {{ formatText(producto.nombre) }}
                </a>
              </td>
              <td>{{ formatText(producto.codigo) }}</td>
              <td>{{ formatText(producto.codigoBarra) }}</td>
              <td class="fitba-cell-num">{{ producto.precioUltCompra ?? "-" }}</td>
              <td>{{ formatBoolean(producto.activo) }}</td>
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
import { useProductosQuery } from "../../application";
import type { Producto } from "../../domain";
import { useAs400Shortcuts } from "@/shared/lib/keyboard/useAs400Shortcuts";
import { usePaginatedRows } from "@/shared/lib/performance/usePaginatedRows";
import AsyncLoadingMessage from "@/shared/ui/AsyncLoadingMessage.vue";
import AsyncErrorMessage from "@/shared/ui/AsyncErrorMessage.vue";
import AsyncNotFoundMessage from "@/shared/ui/AsyncNotFoundMessage.vue";
import DataPaginationControls from "@/shared/ui/DataPaginationControls.vue";
import EntityFilterBar from "@/shared/ui/EntityFilterBar.vue";
import { resolveErrorMessage } from "@/shared/lib/http/resolveErrorMessage";
import { createLogger } from "@/shared/lib/observability/logger";
import { useProductosDependencies } from "../productosDependencies";

const route = useRoute();
const router = useRouter();
const logger = createLogger("MVP ProductosPage");
const { productosRepository } = useProductosDependencies();

const productoFilterInput = ref("");
const appliedProductoFilter = ref("");
const selectedProductoId = ref<string | null>(null);
const productosQuery = useProductosQuery(productosRepository);

watch(
  () => route.query.productoFiltro,
  (value) => {
    const normalized = readQueryValue(value) ?? "";
    if (normalized === appliedProductoFilter.value && normalized === productoFilterInput.value) {
      return;
    }
    appliedProductoFilter.value = normalized;
    productoFilterInput.value = normalized;
  },
  { immediate: true }
);

watch(
  () => route.query.producto,
  (value) => {
    const selectedId = readQueryValue(value);
    if (selectedId === selectedProductoId.value) {
      return;
    }
    selectedProductoId.value = selectedId;
  },
  { immediate: true }
);

watch(
  () => productoFilterInput.value,
  async (value) => {
    const normalized = value.trim();
    appliedProductoFilter.value = normalized;

    const currentQueryFiltro = readQueryValue(route.query.productoFiltro) ?? "";
    if (normalized === currentQueryFiltro) {
      return;
    }

    try {
      await router.replace({
        query: {
          ...route.query,
          productoFiltro: normalized || undefined
        }
      });
    } catch (error) {
      logger.error("Error al sincronizar filtro de producto en URL", { error, normalized });
    }
  }
);

const productos = computed(() => productosQuery.data.value ?? []);
const selectedProducto = computed(() =>
  productos.value.find((producto) => formatText(producto.productoId) === selectedProductoId.value) ?? null
);
const filteredProductos = computed(() => {
  const filter = appliedProductoFilter.value.trim().toLowerCase();
  if (!filter) {
    return productos.value;
  }
  return productos.value.filter((producto) =>
    formatText(producto.nombre).toLowerCase().includes(filter)
  );
});
const productosPagination = usePaginatedRows(filteredProductos, {
  threshold: 10,
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100]
});
const paginatedProductos = computed(() => productosPagination.rows.value);

const errorMessage = computed(() => {
  const error = productosQuery.error.value;
  if (!error) {
    return null;
  }
  return resolveErrorMessage(error, "Error inesperado al cargar productos.");
});

useAs400Shortcuts({
  onF2: () => document.querySelector<HTMLInputElement>("#producto-id-input")?.focus(),
  onF3: onShortcutF3,
  onF5: reloadProductos,
  onBack: () => router.back()
});

function onProductoFilterInput(value: string) {
  productoFilterInput.value = value;
}

function selectProducto(producto: Producto) {
  const resolvedId = String(producto.productoId ?? "").trim();
  if (!resolvedId) {
    return;
  }
  selectedProductoId.value = resolvedId;
  void router.replace({
    query: {
      ...route.query,
      producto: resolvedId
    }
  });
}

function clearSelectedProducto() {
  selectedProductoId.value = null;
  void router.replace({
    query: {
      ...route.query,
      producto: undefined
    }
  });
}

function onShortcutF3() {
  if (selectedProducto.value) {
    clearSelectedProducto();
    return;
  }
  productoFilterInput.value = "";
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

function formatBoolean(value: boolean | null) {
  if (value === null) {
    return "-";
  }
  return value ? "Si" : "No";
}

function rowKey(producto: Producto) {
  return formatText(producto.productoId || producto.codigo || producto.nombre);
}

async function reloadProductos() {
  try {
    await productosQuery.refetch();
  } catch (error) {
    logger.error("Error al recargar productos", { error });
  }
}
</script>
