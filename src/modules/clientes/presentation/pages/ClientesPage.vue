<template>
  <section class="card shadow-sm fitba-screen--phosphor" :aria-busy="clienteQuery.isLoading.value">
    <div class="card-body">
      <div class="fitba-statusbar mb-3" role="status" aria-live="polite">
        <span class="fitba-statusbar-item">MODULO: CLIENTES</span>
        <span class="fitba-statusbar-item">VISTA: DETALLE</span>
        <span class="fitba-statusbar-item">CLI_ID: {{ submittedClienteId ?? "-" }}</span>
      </div>

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
            <tr v-for="detailRow in clienteDetailRows" :key="detailRow.key">
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
import { useClienteByIdQuery } from "../../application";
import type { Cliente, ProvinciaCatalog, SimpleCatalog } from "../../domain";
import { useAs400Shortcuts } from "@/shared/lib/keyboard/useAs400Shortcuts";
import AsyncLoadingMessage from "@/shared/ui/AsyncLoadingMessage.vue";
import AsyncErrorMessage from "@/shared/ui/AsyncErrorMessage.vue";
import AsyncEmptyMessage from "@/shared/ui/AsyncEmptyMessage.vue";
import AsyncNotFoundMessage from "@/shared/ui/AsyncNotFoundMessage.vue";
import { resolveErrorMessage } from "@/shared/lib/http/resolveErrorMessage";
import { createLogger } from "@/shared/lib/observability/logger";
import { useClientesDependencies } from "../clientesDependencies";

type ClienteDetailRow = {
  key: string;
  value: string;
};

const route = useRoute();
const router = useRouter();
const logger = createLogger("MVP ClientesPage");
const { clientesRepository } = useClientesDependencies();
const clienteInputRef = ref<HTMLInputElement | null>(null);
const clienteIdInput = ref("");
const submittedClienteId = ref<string | null>(readQueryValue(route.query.cliente));
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
const clienteDetailRows = computed<ClienteDetailRow[]>(() => {
  const currentCliente = cliente.value;
  if (!currentCliente) {
    return [];
  }

  return [
    { key: "cliente_id", value: formatText(currentCliente.clienteId) },
    { key: "nombre", value: formatText(currentCliente.nombre) },
    { key: "primerApellido", value: formatText(currentCliente.primerApellido) },
    { key: "segundoApellido", value: formatText(currentCliente.segundoApellido) },
    { key: "primerNombre", value: formatText(currentCliente.primerNombre) },
    { key: "otrosNombres", value: formatText(currentCliente.otrosNombres) },
    { key: "razonSocial", value: formatText(currentCliente.razonSocial) },
    { key: "nombreComercial", value: formatText(currentCliente.nombreComercial) },
    {
      key: "identificacionTributaria",
      value: formatCatalog(currentCliente.identificacionTributaria)
    },
    {
      key: "digitoVerificacion",
      value: formatText(currentCliente.digitoVerificacion)
    },
    { key: "categoriaFiscal", value: formatCatalog(currentCliente.categoriaFiscal) },
    { key: "provincia", value: formatProvincia(currentCliente.provincia) },
    { key: "direccion", value: formatText(currentCliente.direccion) },
    { key: "email", value: formatText(currentCliente.email) },
    { key: "telefono", value: formatText(currentCliente.telefono) },
    { key: "codigoPostal", value: formatText(currentCliente.codigoPostal) },
    { key: "cuentaVenta_id", value: formatCatalog(currentCliente.cuentaVenta) },
    { key: "cuentaCompra_id", value: formatCatalog(currentCliente.cuentaCompra) },
    { key: "pais", value: formatCatalog(currentCliente.pais) },
    { key: "localidad", value: formatCatalog(currentCliente.localidad) },
    { key: "usrCode", value: formatText(currentCliente.usrCode) },
    {
      key: "listaPrecioVenta",
      value: formatCatalog(currentCliente.listaPrecioVenta)
    },
    { key: "descripcion", value: formatText(currentCliente.descripcion) },
    {
      key: "esclienteextranjero",
      value: formatBoolean(currentCliente.esClienteExtranjero)
    },
    { key: "esProveedor", value: formatBoolean(currentCliente.esProveedor) },
    { key: "cuit", value: formatText(currentCliente.cuit) },
    {
      key: "tipoDeOrganizacion",
      value: formatCatalog(currentCliente.tipoDeOrganizacion)
    },
    {
      key: "responsabilidadOrganizacionItem",
      value: formatCatalogList(currentCliente.responsabilidadOrganizacionItem)
    },
    { key: "CUIT", value: formatText(currentCliente.cuitUpper) }
  ];
});

useAs400Shortcuts({
  onF2: () => clienteInputRef.value?.focus(),
  onF3: clearSearch,
  onF5: reloadCliente,
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

function formatText(value: unknown): string {
  if (value === null || value === undefined) {
    return "-";
  }

  const normalized = String(value).trim();
  return normalized ? normalized : "-";
}

function formatBoolean(value: boolean | null): string {
  if (value === null) {
    return "-";
  }
  return value ? "Si" : "No";
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

function formatCatalogList(values: Cliente["responsabilidadOrganizacionItem"]): string {
  if (values.length === 0) {
    return "-";
  }
  return values.map((value, index) => `${index + 1}) ${formatCatalog(value)}`).join(" ; ");
}

async function submitSearch() {
  const normalized = clienteIdInput.value.trim();
  if (!normalized) {
    logger.warn("Busqueda de cliente vacia.");
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
    logger.error("Error al buscar cliente", { clienteId: normalized, error });
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
    logger.error("Error al limpiar busqueda de cliente", { error });
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
    logger.error("Error al recargar cliente", { error });
  }
}
</script>
