<template>
  <section class="card shadow-sm">
    <div class="card-body">
      <h2 class="h5 mb-3">Producto por ID (MVP)</h2>

      <form class="row g-2 mb-3" @submit.prevent="submitSearch">
        <div class="col-12 col-md-4">
          <input
            v-model="productoIdInput"
            type="text"
            class="form-control"
            placeholder="productoId"
          />
        </div>
        <div class="col-12 col-md-auto d-flex gap-2">
          <button type="submit" class="btn btn-success">Buscar</button>
          <button type="button" class="btn btn-outline-secondary" @click="clearSearch">
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

      <div v-else class="table-responsive">
        <table class="table table-sm align-middle mb-0">
          <tbody>
            <tr>
              <th scope="row">productoId</th>
              <td>{{ producto.productoId ?? "-" }}</td>
            </tr>
            <tr>
              <th scope="row">nombre</th>
              <td>{{ producto.nombre || "-" }}</td>
            </tr>
            <tr>
              <th scope="row">codigo</th>
              <td>{{ producto.codigo || "-" }}</td>
            </tr>
            <tr>
              <th scope="row">codigoBarra</th>
              <td>{{ producto.codigoBarra || "-" }}</td>
            </tr>
            <tr>
              <th scope="row">precioUltCompra</th>
              <td>{{ producto.precioUltCompra ?? "-" }}</td>
            </tr>
            <tr>
              <th scope="row">activo</th>
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
import AsyncLoadingMessage from "@/shared/ui/AsyncLoadingMessage.vue";
import AsyncErrorMessage from "@/shared/ui/AsyncErrorMessage.vue";
import AsyncEmptyMessage from "@/shared/ui/AsyncEmptyMessage.vue";
import AsyncNotFoundMessage from "@/shared/ui/AsyncNotFoundMessage.vue";
import { resolveErrorMessage } from "@/shared/lib/http/resolveErrorMessage";

const route = useRoute();
const router = useRouter();
const productoIdInput = ref("");
const submittedProductoId = ref<string | null>(readQueryValue(route.query.producto));
const productoQuery = useProductoByIdQuery(submittedProductoId);

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
</script>
