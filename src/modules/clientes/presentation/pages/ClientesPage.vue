<template>
  <section class="card shadow-sm fitba-screen--phosphor" :aria-busy="clientesQuery.isLoading.value">
    <div class="card-body">
      <div class="fitba-statusbar mb-3" role="status" aria-live="polite">
        <span class="fitba-statusbar-item">MODULO: CLIENTES</span>
        <span class="fitba-statusbar-item">VISTA: {{ selectedCliente ? "DETALLE" : "LISTADO" }}</span>
        <span class="fitba-statusbar-item">NOM: {{ appliedClienteFilter || "-" }}</span>
        <span class="fitba-statusbar-item">CLI_ID: {{ selectedClienteId ?? "-" }}</span>
        <span class="fitba-statusbar-item">TOTAL: {{ filteredClientes.length }}</span>
      </div>

      <h2 class="h5 mb-3">Clientes</h2>

      <div v-if="selectedCliente" class="mb-3 d-flex justify-content-between align-items-center">
        <p class="mb-0 small">Detalle de cliente seleccionado.</p>
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          aria-label="Volver al listado de clientes"
          @click="clearSelectedCliente"
        >
          Volver al listado
        </button>
      </div>

      <div v-if="!selectedCliente" class="fitba-toolbar mb-3">
        <EntityFilterBar
          input-id="cliente-id-input"
          help-id="cliente-search-help"
          label="nombre"
          placeholder="nombre"
          input-aria-label="Filtrar clientes por nombre"
          help-text="Filtra por nombre de cliente (búsqueda parcial)."
          :model-value="clienteIdInput"
          :error-message="clienteSearchErrorMessage"
          @update:model-value="onClienteFilterInput"
        />
      </div>

      <AsyncLoadingMessage
        v-if="!selectedCliente && clientesQuery.isLoading.value"
        message="Cargando clientes..."
      />

      <AsyncErrorMessage v-else-if="!selectedCliente && errorMessage" :message="errorMessage" />

      <AsyncNotFoundMessage
        v-else-if="!selectedCliente && filteredClientes.length === 0"
        message="No se encontraron clientes para el filtro indicado."
      />

      <div
        v-if="selectedCliente"
        class="fitba-table-shell table-responsive fitba-table-responsive fitba-table-responsive--detail"
      >
        <table class="table table-sm align-middle fitba-table-grid" aria-label="Detalle de cliente">
          <caption class="visually-hidden">Detalle del cliente seleccionado.</caption>
          <tbody>
            <tr>
              <th scope="row" class="fitba-detail-key">CLI_ID</th>
              <td>
                <div class="cliente-id-with-copy">
                  <span class="fitba-key-link">{{ formatText(selectedCliente.clienteId) }}</span>
                  <button
                    v-if="canCopyClienteId(selectedCliente.clienteId)"
                    type="button"
                    class="btn btn-sm btn-outline-secondary"
                    aria-label="Copiar CLI_ID"
                    title="Copiar CLI_ID"
                    @click="copyClienteId(selectedCliente.clienteId)"
                  >
                    📋
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">NOMBRE</th>
              <td>{{ formatText(selectedCliente.nombre) }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">RAZON_SOCIAL</th>
              <td>{{ formatText(selectedCliente.razonSocial) }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">EMAIL</th>
              <td>{{ formatText(selectedCliente.email) }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">TELEFONO</th>
              <td>{{ formatText(selectedCliente.telefono) }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">CUIT</th>
              <td>{{ formatText(selectedCliente.cuit || selectedCliente.cuitUpper) }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">LOCALIDAD</th>
              <td>{{ formatCatalog(selectedCliente.localidad) }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">PROVINCIA</th>
              <td>{{ formatProvincia(selectedCliente.provincia) }}</td>
            </tr>
            <tr>
              <th scope="row" class="fitba-detail-key">PAIS</th>
              <td>{{ formatCatalog(selectedCliente.pais) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

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
          <caption class="visually-hidden">Listado de clientes con filtro por nombre.</caption>
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
              <td>
                <div class="cliente-id-with-copy">
                  <a
                    href="#"
                    class="fitba-inline-link fitba-key-link"
                    @click.prevent="selectCliente(cliente)"
                  >
                    {{ formatText(cliente.clienteId) }}
                  </a>
                  <button
                    v-if="canCopyClienteId(cliente.clienteId)"
                    type="button"
                    class="btn btn-sm btn-outline-secondary"
                    aria-label="Copiar CLI_ID"
                    title="Copiar CLI_ID"
                    @click="copyClienteId(cliente.clienteId)"
                  >
                    📋
                  </button>
                </div>
              </td>
              <td>
                <a
                  href="#"
                  class="fitba-inline-link fitba-key-link"
                  @click.prevent="selectCliente(cliente)"
                >
                  {{ formatText(cliente.nombre) }}
                </a>
              </td>
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
import EntityFilterBar from "@/shared/ui/EntityFilterBar.vue";
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
const selectedClienteId = ref<string | null>(null);
const clientesQuery = useClientesQuery(clientesRepository);
const sharedPageSizeOptions = [10, 20, 50, 100];
const sharedPageSizeStorageKey = "fitba.pageSize.listados";

watch(
  () => route.query.nombre,
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
  () => route.query.cliente,
  (value) => {
    const selectedId = readQueryValue(value);
    if (selectedId === selectedClienteId.value) {
      return;
    }
    selectedClienteId.value = selectedId;
  },
  { immediate: true }
);

watch(
  () => clienteIdInput.value,
  async (value) => {
    const normalized = value.trim();
    clienteSearchErrorMessage.value = "";
    appliedClienteFilter.value = normalized;

    const currentQueryNombre = readQueryValue(route.query.nombre) ?? "";
    if (normalized === currentQueryNombre) {
      return;
    }

    try {
      await router.replace({
        query: {
          ...route.query,
          nombre: normalized || undefined
        }
      });
    } catch (error) {
      logger.error("Error al sincronizar cliente en URL", { error, normalized });
    }
  }
);

const clientes = computed(() => clientesQuery.data.value ?? []);
const selectedCliente = computed(() =>
  clientes.value.find((cliente) => formatText(cliente.clienteId) === selectedClienteId.value) ?? null
);
const filteredClientes = computed(() => {
  const filter = appliedClienteFilter.value.trim().toLowerCase();
  if (!filter) {
    return clientes.value;
  }
  return clientes.value.filter((cliente) =>
    formatText(cliente.nombre).toLowerCase().includes(filter)
  );
});

const clientesPagination = usePaginatedRows(filteredClientes, {
  threshold: 10,
  defaultPageSize: 20,
  pageSizeOptions: sharedPageSizeOptions
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
  onF3: onShortcutF3,
  onF5: reloadClientes,
  onBack: () => router.back()
});

if (typeof window !== "undefined") {
  const storedPageSize = Number(window.localStorage.getItem(sharedPageSizeStorageKey) ?? "");
  if (sharedPageSizeOptions.includes(storedPageSize)) {
    clientesPagination.setPageSize(storedPageSize);
  }
}

watch(
  () => clientesPagination.pageSize.value,
  (value) => {
    if (typeof window === "undefined") {
      return;
    }
    if (!sharedPageSizeOptions.includes(value)) {
      return;
    }
    window.localStorage.setItem(sharedPageSizeStorageKey, String(value));
  }
);

function selectCliente(cliente: Cliente) {
  const resolvedId = String(cliente.clienteId ?? "").trim();
  if (!resolvedId) {
    return;
  }
  selectedClienteId.value = resolvedId;
  void router.replace({
    query: {
      ...route.query,
      cliente: resolvedId
    }
  });
}

function clearSelectedCliente() {
  selectedClienteId.value = null;
  void router.replace({
    query: {
      ...route.query,
      cliente: undefined
    }
  });
}

function rowKey(cliente: Cliente) {
  return formatText(cliente.clienteId || cliente.cuit || cliente.email || cliente.nombre);
}

function onClienteFilterInput(value: string) {
  clienteIdInput.value = value;
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

function canCopyClienteId(value: unknown): boolean {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 && normalized !== "-";
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

async function clearSearch() {
  try {
    clienteIdInput.value = "";
    appliedClienteFilter.value = "";
    clienteSearchErrorMessage.value = "";
    await router.replace({
      query: {
        ...route.query,
        nombre: undefined
      }
    });
  } catch (error) {
    logger.error("Error al limpiar busqueda de cliente", { error });
  }
}

function onShortcutF3() {
  if (selectedCliente.value) {
    clearSelectedCliente();
    return;
  }
  void clearSearch();
}

async function reloadClientes() {
  try {
    await clientesQuery.refetch();
  } catch (error) {
    logger.error("Error al recargar clientes", { error });
  }
}

async function copyClienteId(value: unknown) {
  const normalized = String(value ?? "").trim();
  if (!canCopyClienteId(normalized)) {
    return;
  }
  if (!navigator.clipboard?.writeText) {
    logger.warn("Clipboard API no disponible para copiar CLI_ID.");
    return;
  }
  try {
    await navigator.clipboard.writeText(normalized);
  } catch (error) {
    logger.error("No se pudo copiar CLI_ID al portapapeles", { value: normalized, error });
  }
}

</script>

<style scoped>
.cliente-id-with-copy {
  display: grid;
  grid-template-columns: minmax(0, auto) 1.9rem;
  align-items: center;
  gap: 0.25rem;
}
</style>
