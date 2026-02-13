<template>
  <section class="card shadow-sm" :aria-busy="productoQuery.isLoading.value">
    <div class="card-body">
      <h2 class="h5 mb-3">Producto por ID (MVP)</h2>

      <form class="fitba-search-form row g-2 mb-3" @submit.prevent="submitSearch">
        <div class="col-12 col-md-4">
          <label class="form-label mb-1" for="producto-id-input">productoId</label>
          <input
            id="producto-id-input"
            v-model="productoIdInput"
            ref="productoInputRef"
            type="text"
            class="form-control"
            name="productoId"
            inputmode="text"
            autocomplete="off"
            placeholder="productoId"
            aria-describedby="producto-search-help"
          />
          <small id="producto-search-help" class="text-body-secondary">
            Ingresa el identificador del producto para consultar el detalle.
          </small>
        </div>
        <div class="fitba-form-actions col-12 col-md-auto d-flex gap-2 align-items-end">
          <button type="submit" class="btn btn-success" aria-label="Buscar producto">
            Buscar
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary"
            aria-label="Limpiar busqueda de producto"
            @click="clearSearch"
          >
            Limpiar
          </button>
        </div>
      </form>

      <AsyncEmptyMessage
        v-if="!submittedProductoId"
        message="Ingresa un ID para buscar un producto."
      />

      <AsyncLoadingMessage
        v-else-if="productoQuery.isLoading.value"
        message="Cargando producto..."
      />

      <AsyncErrorMessage v-else-if="errorMessage" :message="errorMessage" />

      <AsyncNotFoundMessage
        v-else-if="!producto"
        message="No se encontro producto para el ID indicado."
      />

      <div
        v-else
        class="fitba-table-shell table-responsive fitba-table-responsive fitba-table-responsive--detail"
      >
        <table class="table table-sm align-middle fitba-table-grid" aria-label="Detalle de producto">
          <caption class="visually-hidden">Detalle del producto seleccionado por ID.</caption>
          <tbody>
            <tr>
              <th scope="row" class="fitba-detail-key">productoId</th>
              <td>{{ producto.productoId ?? "-" }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">nombre</th>
              <td>{{ producto.nombre || "-" }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">codigo</th>
              <td>{{ producto.codigo || "-" }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">codigoBarra</th>
              <td>{{ producto.codigoBarra || "-" }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">precioUltCompra</th>
              <td class="fitba-cell-num">{{ producto.precioUltCompra ?? "-" }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">activo</th>
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
import { useProductoByIdQuery } from "../../application";
import { createProductosHttpRepository } from "../../infrastructure";
import { useAs400Shortcuts } from "@/shared/lib/keyboard/useAs400Shortcuts";
import AsyncLoadingMessage from "@/shared/ui/AsyncLoadingMessage.vue";
import AsyncErrorMessage from "@/shared/ui/AsyncErrorMessage.vue";
import AsyncEmptyMessage from "@/shared/ui/AsyncEmptyMessage.vue";
import AsyncNotFoundMessage from "@/shared/ui/AsyncNotFoundMessage.vue";
import { resolveErrorMessage } from "@/shared/lib/http/resolveErrorMessage";
import { runtimeConfig } from "@/shared/config/runtimeConfig";

const route = useRoute();
const router = useRouter();
const productoInputRef = ref<HTMLInputElement | null>(null);
const productoIdInput = ref("");
const submittedProductoId = ref<string | null>(readQueryValue(route.query.producto));
const productosRepository = createProductosHttpRepository(runtimeConfig.apiBaseUrl);
const productoQuery = useProductoByIdQuery(submittedProductoId, productosRepository);

watch(
  () => route.query.producto,
  (value) => {
    const normalized = readQueryValue(value);
    submittedProductoId.value = normalized;
    productoIdInput.value = normalized ?? "";
  },
  { immediate: true }
);

const producto = computed(() => productoQuery.data.value ?? null);
const errorMessage = computed(() => {
  const error = productoQuery.error.value;
  if (!error) {
    return null;
  }
  return resolveErrorMessage(error, "Error inesperado al cargar producto.");
});

useAs400Shortcuts({
  onF2: () => productoInputRef.value?.focus(),
  onF3: clearSearch,
  onF5: reloadProducto,
  onF12: () => router.back()
});

function readQueryValue(value: LocationQueryValue | LocationQueryValue[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return null;
  }
  const normalized = String(raw).trim();
  return normalized ? normalized : null;
}

function formatBoolean(value: boolean | null) {
  if (value === null) {
    return "-";
  }
  return value ? "Si" : "No";
}

async function submitSearch() {
  const normalized = productoIdInput.value.trim();
  if (!normalized) {
    console.warn("[MVP] Busqueda de producto vacia.");
    submittedProductoId.value = null;
    return;
  }

  try {
    submittedProductoId.value = normalized;
    await router.replace({
      query: {
        ...route.query,
        producto: normalized
      }
    });
  } catch (error) {
    console.error("[MVP] Error al buscar producto", { productoId: normalized, error });
  }
}

async function clearSearch() {
  try {
    productoIdInput.value = "";
    submittedProductoId.value = null;
    await router.replace({
      query: {
        ...route.query,
        producto: undefined
      }
    });
  } catch (error) {
    console.error("[MVP] Error al limpiar busqueda de producto", error);
  }
}

async function reloadProducto() {
  if (!submittedProductoId.value) {
    productoInputRef.value?.focus();
    return;
  }

  try {
    await productoQuery.refetch();
  } catch (error) {
    console.error("[MVP] Error al recargar producto", error);
  }
}
</script>
