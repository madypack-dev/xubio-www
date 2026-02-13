<template>
  <section class="card shadow-sm" :aria-busy="vendedorQuery.isLoading.value">
    <div class="card-body">
      <h2 class="h5 mb-3">Vendedor por ID (MVP)</h2>

      <form class="fitba-search-form row g-2 mb-3" @submit.prevent="submitSearch">
        <div class="col-12 col-md-4">
          <label class="form-label mb-1" for="vendedor-id-input">vendedorId</label>
          <input
            id="vendedor-id-input"
            v-model="vendedorIdInput"
            ref="vendedorInputRef"
            type="text"
            class="form-control"
            name="vendedorId"
            inputmode="text"
            autocomplete="off"
            placeholder="vendedorId"
            aria-describedby="vendedor-search-help"
          />
          <small id="vendedor-search-help" class="text-body-secondary">
            Ingresa el identificador del vendedor para consultar el detalle.
          </small>
        </div>
        <div class="fitba-form-actions col-12 col-md-auto d-flex gap-2 align-items-end">
          <button type="submit" class="btn btn-success" aria-label="Buscar vendedor">
            Buscar
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary"
            aria-label="Limpiar busqueda de vendedor"
            @click="clearSearch"
          >
            Limpiar
          </button>
        </div>
      </form>

      <AsyncEmptyMessage
        v-if="!submittedVendedorId"
        message="Ingresa un ID para buscar un vendedor."
      />

      <AsyncLoadingMessage
        v-else-if="vendedorQuery.isLoading.value"
        message="Cargando vendedor..."
      />

      <AsyncErrorMessage v-else-if="errorMessage" :message="errorMessage" />

      <AsyncNotFoundMessage
        v-else-if="!vendedor"
        message="No se encontro vendedor para el ID indicado."
      />

      <div
        v-else
        class="fitba-table-shell table-responsive fitba-table-responsive fitba-table-responsive--detail"
      >
        <table class="table table-sm align-middle fitba-table-grid" aria-label="Detalle de vendedor">
          <caption class="visually-hidden">Detalle del vendedor seleccionado por ID.</caption>
          <tbody>
            <tr v-for="detailRow in vendedorDetailRows" :key="detailRow.key">
              <th scope="row" class="fitba-detail-key">{{ detailRow.key }}</th>
              <td>{{ detailRow.value }}</td>
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
import { useVendedorByIdQuery } from "../../application";
import { createVendedoresHttpRepository } from "../../infrastructure";
import type { Vendedor } from "../../domain";
import { useAs400Shortcuts } from "@/shared/lib/keyboard/useAs400Shortcuts";
import AsyncLoadingMessage from "@/shared/ui/AsyncLoadingMessage.vue";
import AsyncErrorMessage from "@/shared/ui/AsyncErrorMessage.vue";
import AsyncEmptyMessage from "@/shared/ui/AsyncEmptyMessage.vue";
import AsyncNotFoundMessage from "@/shared/ui/AsyncNotFoundMessage.vue";
import { resolveErrorMessage } from "@/shared/lib/http/resolveErrorMessage";
import { runtimeConfig } from "@/shared/config/runtimeConfig";

type VendedorDetailRow = {
  key: string;
  value: string;
};

const route = useRoute();
const router = useRouter();
const vendedorInputRef = ref<HTMLInputElement | null>(null);
const vendedorIdInput = ref("");
const submittedVendedorId = ref<string | null>(readQueryValue(route.query.vendedor));
const vendedoresRepository = createVendedoresHttpRepository(runtimeConfig.apiBaseUrl);
const vendedorQuery = useVendedorByIdQuery(submittedVendedorId, vendedoresRepository);

watch(
  () => route.query.vendedor,
  (value) => {
    const normalized = readQueryValue(value);
    submittedVendedorId.value = normalized;
    vendedorIdInput.value = normalized ?? "";
  },
  { immediate: true }
);

const vendedor = computed(() => vendedorQuery.data.value ?? null);
const errorMessage = computed(() => {
  const error = vendedorQuery.error.value;
  if (!error) {
    return null;
  }
  return resolveErrorMessage(error, "Error inesperado al cargar vendedor.");
});
const vendedorDetailRows = computed<VendedorDetailRow[]>(() => {
  const currentVendedor = vendedor.value;
  if (!currentVendedor) {
    return [];
  }

  const baseRows: VendedorDetailRow[] = [
    { key: "vendedor_id", value: formatUnknown(currentVendedor.vendedorId) },
    { key: "nombre", value: formatUnknown(currentVendedor.nombre) },
    { key: "apellido", value: formatUnknown(currentVendedor.apellido) },
    { key: "email", value: formatUnknown(currentVendedor.email) },
    { key: "telefono", value: formatUnknown(currentVendedor.telefono) },
    { key: "direccion", value: formatUnknown(currentVendedor.direccion) }
  ];

  return [...baseRows, ...buildAdditionalRows(currentVendedor)];
});

useAs400Shortcuts({
  onF2: () => vendedorInputRef.value?.focus(),
  onF3: clearSearch,
  onF5: reloadVendedor,
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

function buildAdditionalRows(currentVendedor: Vendedor): VendedorDetailRow[] {
  const excludedKeys = new Set([
    "vendedor_id",
    "vendedorId",
    "id",
    "ID",
    "nombre",
    "primerNombre",
    "apellido",
    "primerApellido",
    "email",
    "telefono",
    "direccion"
  ]);

  return Object.entries(currentVendedor.raw)
    .filter(([key, value]) => !excludedKeys.has(key) && value !== undefined)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => ({
      key,
      value: formatUnknown(value)
    }));
}

function formatUnknown(value: unknown): string {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Si" : "No";
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "-";
    }
    return value.map((item) => formatUnknown(item)).join(" ; ");
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return "-";
    }
    return entries.map(([key, item]) => `${key}=${formatUnknown(item)}`).join(" | ");
  }

  const normalized = String(value).trim();
  return normalized ? normalized : "-";
}

async function submitSearch() {
  const normalized = vendedorIdInput.value.trim();
  if (!normalized) {
    console.warn("[MVP] Busqueda de vendedor vacia.");
    submittedVendedorId.value = null;
    return;
  }

  try {
    submittedVendedorId.value = normalized;
    await router.replace({
      query: {
        ...route.query,
        vendedor: normalized
      }
    });
  } catch (error) {
    console.error("[MVP] Error al buscar vendedor", { vendedorId: normalized, error });
  }
}

async function clearSearch() {
  try {
    vendedorIdInput.value = "";
    submittedVendedorId.value = null;
    await router.replace({
      query: {
        ...route.query,
        vendedor: undefined
      }
    });
  } catch (error) {
    console.error("[MVP] Error al limpiar busqueda de vendedor", error);
  }
}

async function reloadVendedor() {
  if (!submittedVendedorId.value) {
    vendedorInputRef.value?.focus();
    return;
  }

  try {
    await vendedorQuery.refetch();
  } catch (error) {
    console.error("[MVP] Error al recargar vendedor", error);
  }
}
</script>
