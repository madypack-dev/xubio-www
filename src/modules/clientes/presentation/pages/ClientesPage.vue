<template>
  <section class="card shadow-sm" :aria-busy="clienteQuery.isLoading.value">
    <div class="card-body">
      <h2 class="h5 mb-3">Cliente por ID (MVP)</h2>

      <form class="fitba-search-form row g-2 mb-3" @submit.prevent="submitSearch">
        <div class="col-12 col-md-4">
          <label class="form-label mb-1" for="cliente-id-input">clienteId</label>
          <input
            id="cliente-id-input"
            v-model="clienteIdInput"
            ref="clienteInputRef"
            type="text"
            class="form-control"
            name="clienteId"
            inputmode="text"
            autocomplete="off"
            placeholder="clienteId"
            aria-describedby="cliente-search-help"
          />
          <small id="cliente-search-help" class="text-body-secondary">
            Ingresa el identificador del cliente para consultar el detalle.
          </small>
        </div>
        <div class="fitba-form-actions col-12 col-md-auto d-flex gap-2 align-items-end">
          <button type="submit" class="btn btn-success" aria-label="Buscar cliente">
            Buscar
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary"
            aria-label="Limpiar busqueda de cliente"
            @click="clearSearch"
          >
            Limpiar
          </button>
        </div>
      </form>

      <AsyncEmptyMessage
        v-if="!submittedClienteId"
        message="Ingresa un ID para buscar un cliente."
      />

      <AsyncLoadingMessage
        v-else-if="clienteQuery.isLoading.value"
        message="Cargando cliente..."
      />

      <AsyncErrorMessage v-else-if="errorMessage" :message="errorMessage" />

      <AsyncNotFoundMessage
        v-else-if="!cliente"
        message="No se encontro cliente para el ID indicado."
      />

      <div
        v-else
        class="fitba-table-shell table-responsive fitba-table-responsive fitba-table-responsive--detail"
      >
        <table class="table table-sm align-middle fitba-table-grid" aria-label="Detalle de cliente">
          <caption class="visually-hidden">Detalle del cliente seleccionado por ID.</caption>
          <tbody>
            <tr>
              <th scope="row" class="fitba-detail-key">clienteId</th>
              <td>{{ cliente.clienteId ?? "-" }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">nombre</th>
              <td>{{ cliente.nombre || "-" }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">razonSocial</th>
              <td>{{ cliente.razonSocial || "-" }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">cuit</th>
              <td>{{ cliente.cuit || "-" }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">email</th>
              <td>{{ cliente.email || "-" }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">telefono</th>
              <td>{{ cliente.telefono || "-" }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">direccion</th>
              <td>{{ cliente.direccion || "-" }}</td>
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
import { useClienteByIdQuery } from "../../application";
import { createClientesHttpRepository } from "../../infrastructure";
import { useAs400Shortcuts } from "@/shared/lib/keyboard/useAs400Shortcuts";
import AsyncLoadingMessage from "@/shared/ui/AsyncLoadingMessage.vue";
import AsyncErrorMessage from "@/shared/ui/AsyncErrorMessage.vue";
import AsyncEmptyMessage from "@/shared/ui/AsyncEmptyMessage.vue";
import AsyncNotFoundMessage from "@/shared/ui/AsyncNotFoundMessage.vue";
import { resolveErrorMessage } from "@/shared/lib/http/resolveErrorMessage";
import { runtimeConfig } from "@/shared/config/runtimeConfig";

const route = useRoute();
const router = useRouter();
const clienteInputRef = ref<HTMLInputElement | null>(null);
const clienteIdInput = ref("");
const submittedClienteId = ref<string | null>(readQueryValue(route.query.cliente));
const clientesRepository = createClientesHttpRepository(runtimeConfig.apiBaseUrl);
const clienteQuery = useClienteByIdQuery(submittedClienteId, clientesRepository);

watch(
  () => route.query.cliente,
  (value) => {
    const normalized = readQueryValue(value);
    submittedClienteId.value = normalized;
    clienteIdInput.value = normalized ?? "";
  },
  { immediate: true }
);

const cliente = computed(() => clienteQuery.data.value ?? null);
const errorMessage = computed(() => {
  const error = clienteQuery.error.value;
  if (!error) {
    return null;
  }
  return resolveErrorMessage(error, "Error inesperado al cargar cliente.");
});

useAs400Shortcuts({
  onF2: () => clienteInputRef.value?.focus(),
  onF3: clearSearch,
  onF5: reloadCliente,
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

async function submitSearch() {
  const normalized = clienteIdInput.value.trim();
  if (!normalized) {
    console.warn("[MVP] Busqueda de cliente vacia.");
    submittedClienteId.value = null;
    return;
  }

  try {
    submittedClienteId.value = normalized;
    await router.replace({
      query: {
        ...route.query,
        cliente: normalized
      }
    });
  } catch (error) {
    console.error("[MVP] Error al buscar cliente", { clienteId: normalized, error });
  }
}

async function clearSearch() {
  try {
    clienteIdInput.value = "";
    submittedClienteId.value = null;
    await router.replace({
      query: {
        ...route.query,
        cliente: undefined
      }
    });
  } catch (error) {
    console.error("[MVP] Error al limpiar busqueda de cliente", error);
  }
}

async function reloadCliente() {
  if (!submittedClienteId.value) {
    clienteInputRef.value?.focus();
    return;
  }

  try {
    await clienteQuery.refetch();
  } catch (error) {
    console.error("[MVP] Error al recargar cliente", error);
  }
}
</script>
