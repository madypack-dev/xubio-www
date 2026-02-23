<template>
  <section class="card shadow-sm fitba-screen--phosphor" :aria-busy="clientesQuery.isLoading.value">
    <div class="card-body">
      <div class="fitba-statusbar mb-3" role="status" aria-live="polite">
        <span class="fitba-statusbar-item">MODULO: CLIENTES</span>
        <span class="fitba-statusbar-item">VISTA: LISTADO</span>
        <span class="fitba-statusbar-item">CLI_ID: {{ appliedClienteFilter || "-" }}</span>
        <span class="fitba-statusbar-item">TOTAL: {{ filteredClientes.length }}</span>
      </div>

      <h2 class="h5 mb-3">Clientes (MVP)</h2>

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
            Filtra por identificador de cliente (búsqueda parcial).
          </small>
        </div>
        <div class="fitba-form-actions col-12 col-md-auto d-flex gap-2 align-items-end">
          <button type="submit" class="btn btn-success" aria-label="Buscar cliente">
            Buscar
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary"
            aria-label="Pegar clienteId desde portapapeles"
            title="Pegar clienteId"
            @click="pasteClienteIdFromClipboard"
          >
            📋
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
      <p v-if="clienteSearchErrorMessage" class="fitba-async-message fitba-async-error mb-2" aria-live="polite">
        {{ clienteSearchErrorMessage }}
      </p>

      <AsyncLoadingMessage
        v-if="clientesQuery.isLoading.value"
        message="Cargando clientes..."
      />

      <AsyncErrorMessage v-else-if="errorMessage" :message="errorMessage" />

      <AsyncNotFoundMessage
        v-else-if="filteredClientes.length === 0"
        message="No se encontraron clientes para el filtro indicado."
      />

      <div
        v-else
        class="fitba-table-shell table-responsive fitba-table-responsive fitba-table-responsive--wide"
      >
        <DataPaginationControls
          v-if="clientesPagination.isActive.value"
          entity-label="clientes"
          :page="clientesPagination.page.value"
          :page-size="clientesPagination.pageSize.value"
          :page-size-options="clientesPagination.pageSizeOptions"
          :total-rows="clientesPagination.totalRows.value"
          :total-pages="clientesPagination.totalPages.value"
          :page-start="clientesPagination.pageStart.value"
          :page-end="clientesPagination.pageEnd.value"
          @update:page="clientesPagination.setPage"
          @update:page-size="clientesPagination.setPageSize"
        />

        <table class="table table-sm table-hover align-middle fitba-table-grid" aria-label="Listado de clientes">
          <caption class="visually-hidden">Listado de clientes con filtro por clienteId.</caption>
          <thead class="table-dark">
            <tr>
              <th scope="col">CLI_ID</th>
              <th scope="col">NOM</th>
              <th scope="col">RAZ_SOC</th>
              <th scope="col">EMAIL</th>
              <th scope="col">TEL</th>
              <th scope="col">CUIT</th>
              <th scope="col">LOCALIDAD</th>
              <th scope="col">PROV</th>
              <th scope="col">PAIS</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="cliente in paginatedClientes"
              :key="rowKey(cliente)"
            >
              <td class="fitba-key-link">{{ formatText(cliente.clienteId) }}</td>
              <td>{{ formatText(cliente.nombre) }}</td>
              <td>{{ formatText(cliente.razonSocial) }}</td>
              <td>{{ formatText(cliente.email) }}</td>
              <td>{{ formatText(cliente.telefono) }}</td>
              <td>{{ formatText(cliente.cuit || cliente.cuitUpper) }}</td>
              <td>{{ formatCatalog(cliente.localidad) }}</td>
              <td>{{ formatProvincia(cliente.provincia) }}</td>
              <td>{{ formatCatalog(cliente.pais) }}</td>
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
import { useClientesQuery } from "../../application";
import type { Cliente, ProvinciaCatalog, SimpleCatalog } from "../../domain";
import { useAs400Shortcuts } from "@/shared/lib/keyboard/useAs400Shortcuts";
import { usePaginatedRows } from "@/shared/lib/performance/usePaginatedRows";
import AsyncLoadingMessage from "@/shared/ui/AsyncLoadingMessage.vue";
import AsyncErrorMessage from "@/shared/ui/AsyncErrorMessage.vue";
import AsyncNotFoundMessage from "@/shared/ui/AsyncNotFoundMessage.vue";
import DataPaginationControls from "@/shared/ui/DataPaginationControls.vue";
import { resolveErrorMessage } from "@/shared/lib/http/resolveErrorMessage";
import { createLogger } from "@/shared/lib/observability/logger";
import { useClientesDependencies } from "../clientesDependencies";

const route = useRoute();
const router = useRouter();
const logger = createLogger("MVP ClientesPage");
const { clientesRepository } = useClientesDependencies();
const clienteInputRef = ref<HTMLInputElement | null>(null);
const clienteIdInput = ref("");
const appliedClienteFilter = ref("");
const clienteSearchErrorMessage = ref("");
const clientesQuery = useClientesQuery(clientesRepository);

watch(
  () => route.query.cliente,
  (value) => {
    const normalized = readQueryValue(value) ?? "";
    if (normalized === appliedClienteFilter.value && normalized === clienteIdInput.value) {
      return;
    }
    appliedClienteFilter.value = normalized;
    clienteIdInput.value = normalized;
  },
  { immediate: true }
);

watch(
  () => clienteIdInput.value,
  async (value) => {
    const normalized = value.trim();
    clienteSearchErrorMessage.value = "";
    appliedClienteFilter.value = normalized;

    const currentQueryCliente = readQueryValue(route.query.cliente) ?? "";
    if (normalized === currentQueryCliente) {
      return;
    }

    try {
      await router.replace({
        query: {
          ...route.query,
          cliente: normalized || undefined
        }
      });
    } catch (error) {
      logger.error("Error al sincronizar cliente en URL", { error, normalized });
    }
  }
);

const clientes = computed(() => clientesQuery.data.value ?? []);
const filteredClientes = computed(() => {
  const filter = appliedClienteFilter.value.trim();
  if (!filter) {
    return clientes.value;
  }
  return clientes.value.filter((cliente) => formatText(cliente.clienteId).includes(filter));
});

const clientesPagination = usePaginatedRows(filteredClientes, {
  threshold: 20,
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100]
});
const paginatedClientes = computed(() => clientesPagination.rows.value);

const errorMessage = computed(() => {
  const error = clientesQuery.error.value;
  if (!error) {
    return null;
  }
  return resolveErrorMessage(error, "Error inesperado al cargar clientes.");
});

useAs400Shortcuts({
  onF2: () => clienteInputRef.value?.focus(),
  onF3: clearSearch,
  onF5: reloadClientes,
  onBack: () => router.back()
});

function rowKey(cliente: Cliente) {
  return formatText(cliente.clienteId || cliente.cuit || cliente.email || cliente.nombre);
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

function formatCatalog(value: SimpleCatalog | null): string {
  if (!value) {
    return "-";
  }

  const parts: string[] = [];
  if (value.nombre) {
    parts.push(`nombre=${value.nombre}`);
  }
  if (value.codigo) {
    parts.push(`codigo=${value.codigo}`);
  }
  if (value.ID) {
    parts.push(`ID=${value.ID}`);
  }
  if (value.id) {
    parts.push(`id=${value.id}`);
  }

  return parts.length > 0 ? parts.join(" | ") : "-";
}

function formatProvincia(value: ProvinciaCatalog | null): string {
  if (!value) {
    return "-";
  }

  const parts: string[] = [];
  if (value.provinciaId) {
    parts.push(`provincia_id=${value.provinciaId}`);
  }
  if (value.codigo) {
    parts.push(`codigo=${value.codigo}`);
  }
  if (value.nombre) {
    parts.push(`nombre=${value.nombre}`);
  }
  if (value.pais) {
    parts.push(`pais=${value.pais}`);
  }

  return parts.length > 0 ? parts.join(" | ") : "-";
}

async function submitSearch() {
  const normalized = clienteIdInput.value.trim();
  if (!normalized) {
    logger.warn("Busqueda de cliente vacia.");
    appliedClienteFilter.value = "";
    clienteSearchErrorMessage.value = "";
    return;
  }

  try {
    clienteSearchErrorMessage.value = "";
    appliedClienteFilter.value = normalized;
    await router.replace({
      query: {
        ...route.query,
        cliente: normalized
      }
    });
  } catch (error) {
    logger.error("Error al buscar cliente", { clienteId: normalized, error });
  }
}

async function clearSearch() {
  try {
    clienteIdInput.value = "";
    appliedClienteFilter.value = "";
    clienteSearchErrorMessage.value = "";
    await router.replace({
      query: {
        ...route.query,
        cliente: undefined
      }
    });
  } catch (error) {
    logger.error("Error al limpiar busqueda de cliente", { error });
  }
}

async function reloadClientes() {
  try {
    await clientesQuery.refetch();
  } catch (error) {
    logger.error("Error al recargar clientes", { error });
  }
}

async function pasteClienteIdFromClipboard() {
  if (!navigator.clipboard?.readText) {
    clienteSearchErrorMessage.value = "Tu navegador no permite leer portapapeles en este contexto.";
    return;
  }

  try {
    const clipboardRaw = await navigator.clipboard.readText();
    const clipboardValue = String(clipboardRaw ?? "").trim();

    if (!/^\d{3,15}$/.test(clipboardValue)) {
      clienteSearchErrorMessage.value =
        "Valor inválido en portapapeles: debe ser solo números, entre 3 y 15 dígitos.";
      return;
    }

    clienteIdInput.value = clipboardValue;
    clienteSearchErrorMessage.value = "";
  } catch (_error) {
    clienteSearchErrorMessage.value = "No se pudo leer el portapapeles.";
  }
}
</script>
