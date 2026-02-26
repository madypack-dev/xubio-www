<template>
  <div class="d-flex flex-column gap-3 remitos-screen fitba-screen--phosphor">
    <section class="card shadow-sm" :aria-busy="remitosQuery.isLoading.value">
      <div class="card-body">
        <div class="fitba-statusbar mb-3" role="status" aria-live="polite">
          <span class="fitba-statusbar-item">MODULO: REMITOS</span>
          <span class="fitba-statusbar-item">VISTA: LISTADO</span>
          <span class="fitba-statusbar-item">TOTAL: {{ remitos.length }}</span>
        </div>

        <div class="fitba-toolbar mb-3">
          <h2 class="h5 mb-0">Remitos</h2>
        </div>

        <AsyncLoadingMessage
          v-if="remitosQuery.isLoading.value"
          message="Cargando remitos..."
        />

        <AsyncErrorMessage v-else-if="errorMessage" :message="errorMessage" />

        <AsyncEmptyMessage
          v-else-if="visibleRemitos.length === 0"
          message="No hay remitos disponibles."
        />

        <div v-else class="fitba-table-shell">
          <DataPaginationControls
            v-if="remitosPagination.isActive.value"
            entity-label="remitos"
            :page="remitosPagination.page.value"
            :page-size="remitosPagination.pageSize.value"
            :page-size-options="remitosPagination.pageSizeOptions"
            :total-rows="remitosPagination.totalRows.value"
            :total-pages="remitosPagination.totalPages.value"
            :page-start="remitosPagination.pageStart.value"
            :page-end="remitosPagination.pageEnd.value"
            @update:page="remitosPagination.setPage"
            @update:page-size="remitosPagination.setPageSize"
          />

          <div v-if="!selectedRemito" class="d-md-none mb-2">
            <label for="remitos-numero-search-mobile" class="form-label form-label-sm mb-1">Numero remito</label>
            <input
              id="remitos-numero-search-mobile"
              v-model="numeroRemitoSearchInput"
              type="text"
              class="form-control form-control-sm"
              placeholder="Numero remito"
              aria-label="Buscar remitos por numero de remito"
              autocomplete="off"
            />
            <label for="remitos-observacion-search-mobile" class="form-label form-label-sm mb-1 mt-2">Observacion</label>
            <input
              id="remitos-observacion-search-mobile"
              v-model="observacionSearchInput"
              type="text"
              class="form-control form-control-sm"
              placeholder="Observacion"
              aria-label="Buscar remitos por observacion"
              autocomplete="off"
            />
            <label for="remitos-fecha-search-mobile" class="form-label form-label-sm mb-1 mt-2">Fecha</label>
            <input
              id="remitos-fecha-search-mobile"
              v-model="fechaSearchInput"
              type="text"
              class="form-control form-control-sm"
              placeholder="Fecha"
              aria-label="Buscar remitos por fecha"
              autocomplete="off"
            />
            <label for="remitos-cliente-search-mobile" class="form-label form-label-sm mb-1">Cliente</label>
            <input
              id="remitos-cliente-search-mobile"
              v-model="clienteSearchInput"
              type="text"
              class="form-control form-control-sm"
              placeholder="Nombre cliente"
              aria-label="Buscar remitos por nombre de cliente"
              autocomplete="off"
            />
            <label for="remitos-vendedor-search-mobile" class="form-label form-label-sm mb-1 mt-2">Vendedor</label>
            <input
              id="remitos-vendedor-search-mobile"
              v-model="vendedorSearchInput"
              type="text"
              class="form-control form-control-sm"
              placeholder="Nombre vendedor"
              aria-label="Buscar remitos por nombre de vendedor"
              autocomplete="off"
            />
            <label for="remitos-deposito-search-mobile" class="form-label form-label-sm mb-1 mt-2">Deposito</label>
            <input
              id="remitos-deposito-search-mobile"
              v-model="depositoSearchInput"
              type="text"
              class="form-control form-control-sm"
              placeholder="Nombre deposito"
              aria-label="Buscar remitos por nombre de deposito"
              autocomplete="off"
            />
            <label for="remitos-circuito-search-mobile" class="form-label form-label-sm mb-1 mt-2">Circuito contable</label>
            <input
              id="remitos-circuito-search-mobile"
              v-model="circuitoSearchInput"
              type="text"
              class="form-control form-control-sm"
              placeholder="Nombre circuito"
              aria-label="Buscar remitos por nombre de circuito contable"
              autocomplete="off"
            />
          </div>

          <div class="d-md-none">
            <div
              v-for="remito in paginatedVisibleRemitos"
              :key="`${rowKey(remito)}-card`"
              class="card mb-2 remito-mobile-card"
            >
              <div class="card-body py-2 px-3">
                <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
                  <a
                    v-if="remito.transaccionId"
                    class="fitba-inline-link fitba-key-link fw-semibold"
                    :href="buildRemitoLink(remito.transaccionId)"
                    :aria-label="buildSelectRemitoIdLabel(remito.transaccionId)"
                    @click.prevent="selectRemito(remito.transaccionId)"
                  >
                    {{ remito.transaccionId }}
                  </a>
                  <span v-else class="fw-semibold">-</span>
                  <span class="small remito-mobile-meta">
                    {{ formatDateDdMmYyyy(remito.fecha) }}
                  </span>
                </div>
                <div class="small mb-1">
                  <span class="remito-mobile-label">Rto:</span>
                  <a
                    v-if="remito.transaccionId"
                    class="fitba-inline-link fitba-key-link fw-semibold"
                    :href="buildRemitoLink(remito.transaccionId)"
                    :aria-label="buildSelectRemitoIdLabel(remito.transaccionId)"
                    @click.prevent="selectRemito(remito.transaccionId)"
                  >
                    {{ remito.numeroRemito || "-" }}
                  </a>
                  <span v-else class="remito-mobile-value fw-semibold">{{ remito.numeroRemito || "-" }}</span>
                </div>
                <div class="small mb-1">
                  <span class="remito-mobile-label">Cliente:</span>
                  <a
                    v-if="remito.clienteId"
                    class="fitba-inline-link fitba-key-link"
                    :href="buildClienteLink(remito.clienteId)"
                    :aria-label="buildGoToClienteLabel(remito.clienteId)"
                    @click.prevent="goToCliente(remito.clienteId)"
                  >
                    {{ clienteDisplayName(remito.clienteId) }}
                  </a>
                  <span v-else class="remito-mobile-value">-</span>
                </div>
                <div class="small remito-mobile-observacion">
                  {{ remito.observacion || "-" }}
                </div>
                <div class="small mt-1">
                  <span class="remito-mobile-label">Items:</span>
                  <span class="fw-semibold">{{ remito.items.length }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="table-responsive fitba-table-responsive fitba-table-responsive--wide d-none d-md-block">
            <table
              class="table table-sm align-middle fitba-table-grid fitba-table-sticky fitba-table-readable"
              data-nav-table="true"
              aria-label="Tabla de remitos de venta"
            >
              <caption class="visually-hidden">
                Listado de remitos con acceso a detalle de items y cliente.
              </caption>
              <thead class="table-dark">
                <tr>
                  <th scope="col" class="remitos-numero-remito-col">NÚMERO DE REMITO</th>
                  <th scope="col" class="remitos-fecha-col">FECHA</th>
                  <th scope="col">OBSERVACIÓN</th>
                  <th scope="col">CLIENTE</th>
                  <th scope="col" class="text-center d-none d-xl-table-cell">DEPÓSITO</th>
                  <th scope="col" class="text-center d-none d-xl-table-cell">CIRCUITO CONTABLE</th>
                  <th scope="col" class="d-none d-lg-table-cell">VENDEDOR</th>
                  <th scope="col" class="text-center d-none d-xl-table-cell">COMISIÓN %</th>
                  <th scope="col" class="text-center">ITEMS</th>
                </tr>
                <tr v-if="!selectedRemito">
                  <th scope="col">
                    <input
                      id="remitos-numero-search"
                      v-model="numeroRemitoSearchInput"
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="Filtrar numero"
                      aria-label="Buscar remitos por numero de remito"
                      autocomplete="off"
                    />
                  </th>
                  <th scope="col">
                    <input
                      id="remitos-fecha-search"
                      v-model="fechaSearchInput"
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="Filtrar fecha"
                      aria-label="Buscar remitos por fecha"
                      autocomplete="off"
                    />
                  </th>
                  <th scope="col">
                    <input
                      id="remitos-observacion-search"
                      v-model="observacionSearchInput"
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="Filtrar observacion..."
                      aria-label="Buscar remitos por observacion"
                      autocomplete="off"
                    />
                  </th>
                  <th scope="col">
                    <input
                      id="remitos-cliente-search"
                      v-model="clienteSearchInput"
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="Filtrar cliente"
                      aria-label="Buscar remitos por nombre de cliente"
                      autocomplete="off"
                    />
                  </th>
                  <th scope="col" class="d-none d-xl-table-cell">
                    <input
                      id="remitos-deposito-search"
                      v-model="depositoSearchInput"
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="Filtrar deposito"
                      aria-label="Buscar remitos por nombre de deposito"
                      autocomplete="off"
                    />
                  </th>
                  <th scope="col" class="d-none d-xl-table-cell">
                    <input
                      id="remitos-circuito-search"
                      v-model="circuitoSearchInput"
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="Filtrar circuito"
                      aria-label="Buscar remitos por nombre de circuito contable"
                      autocomplete="off"
                    />
                  </th>
                  <th scope="col" class="d-none d-lg-table-cell">
                    <input
                      id="remitos-vendedor-search"
                      v-model="vendedorSearchInput"
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="Filtrar vendedor"
                      aria-label="Buscar remitos por nombre de vendedor"
                      autocomplete="off"
                    />
                  </th>
                  <th scope="col" class="d-none d-xl-table-cell"></th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="remito in paginatedVisibleRemitos"
                  :key="rowKey(remito)"
                  data-nav-row="true"
                  tabindex="-1"
                >
                  <td class="remitos-numero-remito-col">
                    <a
                      v-if="remito.transaccionId"
                      class="fitba-inline-link fitba-key-link fw-semibold"
                      data-nav-main="true"
                      :href="buildRemitoLink(remito.transaccionId)"
                      :aria-label="buildSelectRemitoIdLabel(remito.transaccionId)"
                      :aria-current="isSelectedRemito(remito) ? 'true' : undefined"
                      @click.prevent="selectRemito(remito.transaccionId)"
                    >
                      {{ remito.numeroRemito || "-" }}
                    </a>
                    <div v-else class="fw-semibold">{{ remito.numeroRemito || "-" }}</div>
                  </td>
                  <td class="remitos-fecha-col">
                    {{ formatDateDdMmYyyy(remito.fecha) }}
                  </td>
                  <td
                    class="fitba-cell-truncate fitba-cell-truncate--lg"
                    :title="remito.observacion || undefined"
                  >
                    {{ remito.observacion || "-" }}
                  </td>
                  <td>
                    <a
                      v-if="remito.clienteId"
                      class="fitba-inline-link fitba-key-link"
                      :href="buildClienteLink(remito.clienteId)"
                      :aria-label="buildGoToClienteLabel(remito.clienteId)"
                      @click.prevent="goToCliente(remito.clienteId)"
                    >
                      {{ clienteDisplayName(remito.clienteId) }}
                    </a>
                    <span v-else>-</span>
                  </td>
                  <td class="text-center d-none d-xl-table-cell">{{ depositoDisplayName(remito.depositoId) }}</td>
                  <td class="text-center d-none d-xl-table-cell">{{ circuitoDisplayName(remito.circuitoContableId) }}</td>
                  <td class="d-none d-lg-table-cell">
                    <a
                      v-if="remito.vendedorId"
                      class="fitba-inline-link fitba-key-link"
                      :href="buildVendedorLink(remito.vendedorId)"
                      :aria-label="buildGoToVendedorLabel(remito.vendedorId)"
                      @click.prevent="goToVendedor(remito.vendedorId)"
                    >
                      {{ vendedorDisplayName(remito.vendedorId) }}
                    </a>
                    <span v-else>-</span>
                  </td>
                  <td class="fitba-cell-num text-center d-none d-xl-table-cell">
                    {{ remito.comisionVendedor ?? "-" }}
                  </td>
                  <td class="fitba-cell-num text-center">{{ remito.items.length }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <section v-if="selectedRemito" class="card shadow-sm">
      <div class="card-body">
        <div class="fitba-statusbar mb-3" role="status" aria-live="polite">
          <span class="fitba-statusbar-item">MODULO: REMITOS</span>
          <span class="fitba-statusbar-item">VISTA: DETALLE</span>
          <span class="fitba-statusbar-item">RTO_ID: {{ selectedRemito.transaccionId ?? "-" }}</span>
          <span class="fitba-statusbar-item">ITMS: {{ selectedRemito.items.length }}</span>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 class="h6 mb-0">Detalle de items del remito</h3>
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            aria-label="Volver al listado de remitos"
            @click="clearSelectedRemito"
          >
            Volver al listado
          </button>
        </div>
        <AsyncEmptyMessage
          v-if="selectedRemito.items.length === 0"
          message="El remito seleccionado no tiene items."
        />

        <div
          v-else
          class="fitba-table-shell fitba-table-responsive fitba-table-responsive--wide"
        >
          <div class="d-md-none">
            <div
              v-for="item in selectedRemito.items"
              :key="`${itemRowKey(item)}-card`"
              class="card mb-2 remito-mobile-card"
            >
              <div class="card-body py-2 px-3">
                <div class="d-flex justify-content-between gap-2 mb-1">
                  <span class="fw-semibold">{{ item.transaccionCVItemId ?? "-" }}</span>
                  <span class="small text-body-secondary">Cant: {{ item.cantidad ?? "-" }}</span>
                </div>
                <div class="small mb-1">
                  <a
                    v-if="item.productoId"
                    class="fitba-inline-link fitba-key-link"
                    :href="buildProductoLink(item.productoId)"
                    :aria-label="buildGoToProductoLabel(item.productoId)"
                    @click.prevent="goToProducto(item.productoId)"
                  >
                    {{ productoDisplayName(item.productoId) }}
                  </a>
                  <span v-else>-</span>
                </div>
                <div class="small text-body-secondary">{{ item.descripcion || "-" }}</div>
              </div>
            </div>
          </div>
          <div class="table-responsive d-none d-md-block">
            <table
              class="table table-sm align-middle fitba-table-grid fitba-table-sticky fitba-table-readable"
              data-nav-table="true"
              aria-label="Items del remito"
            >
              <caption class="visually-hidden">
                Items del remito seleccionado con acceso directo al producto.
              </caption>
              <thead class="table-dark">
                <tr>
                  <th scope="col">ITM_ID</th>
                  <th scope="col">TRX_ID</th>
                  <th scope="col">Producto</th>
                  <th scope="col">Descripción</th>
                  <th scope="col" class="text-center">Cantidades</th>
                  <th scope="col" class="text-center">PREC</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in selectedRemito.items" :key="itemRowKey(item)" data-nav-row="true" tabindex="-1">
                  <td>{{ item.transaccionCVItemId ?? "-" }}</td>
                  <td>{{ item.transaccionId ?? "-" }}</td>
                  <td>
                    <a
                      v-if="item.productoId"
                      class="fitba-inline-link fitba-key-link"
                      data-nav-main="true"
                      :href="buildProductoLink(item.productoId)"
                      :aria-label="buildGoToProductoLabel(item.productoId)"
                      @click.prevent="goToProducto(item.productoId)"
                    >
                      {{ productoDisplayName(item.productoId) }}
                    </a>
                    <span v-else>-</span>
                  </td>
                  <td>{{ item.descripcion || "-" }}</td>
                  <td class="fitba-cell-num text-center">{{ item.cantidad ?? "-" }}</td>
                  <td class="fitba-cell-num text-center">{{ formatMoney(item.precio) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useRemitosQuery } from "../useRemitosQuery";
import type { Remito } from "../../domain";
import { runtimeConfig } from "@/shared/config/runtimeConfig";
import { useClientesQuery } from "@/modules/clientes/application";
import { useClientesDependencies } from "@/modules/clientes/presentation/clientesDependencies";
import { useVendedoresQuery } from "@/modules/vendedores/application";
import { useVendedoresDependencies } from "@/modules/vendedores/presentation/vendedoresDependencies";
import { useDepositosQuery } from "@/modules/depositos/application";
import { useDepositosDependencies } from "@/modules/depositos/presentation/depositosDependencies";
import { useCircuitosContablesQuery } from "@/modules/circuitos-contables/application";
import { useCircuitosContablesDependencies } from "@/modules/circuitos-contables/presentation/circuitosContablesDependencies";
import { useProductosQuery } from "@/modules/productos/application";
import { useProductosDependencies } from "@/modules/productos/presentation/productosDependencies";
import { usePaginatedRows } from "@/shared/lib/performance/usePaginatedRows";
import { useAs400Shortcuts } from "@/shared/lib/keyboard/useAs400Shortcuts";
import { useTableRowNavigation } from "@/shared/lib/keyboard/useTableRowNavigation";
import AsyncLoadingMessage from "@/shared/ui/AsyncLoadingMessage.vue";
import AsyncErrorMessage from "@/shared/ui/AsyncErrorMessage.vue";
import AsyncEmptyMessage from "@/shared/ui/AsyncEmptyMessage.vue";
import DataPaginationControls from "@/shared/ui/DataPaginationControls.vue";
import { resolveErrorMessage } from "@/shared/lib/http/resolveErrorMessage";
import { buildHttpErrorLogContext } from "@/shared/lib/http/httpErrorDiagnostics";
import { useRemitosDependencies } from "../remitosDependencies";
import { createLogger } from "@/shared/lib/observability/logger";
import { formatMoney } from "@/shared/lib/formatters/money";
import { useRemitosNavigation } from "../useRemitosNavigation";
import {
  buildGoToClienteLabel,
  buildGoToProductoLabel,
  buildGoToVendedorLabel,
  buildSelectRemitoIdLabel,
  formatDateDdMmYyyy,
  itemRowKey,
  rowKey
} from "../remitosViewFormatters";

const logger = createLogger("MVP RemitosPage");
const route = useRoute();
const { remitosRepository } = useRemitosDependencies();
const { clientesRepository } = useClientesDependencies();
const { vendedoresRepository } = useVendedoresDependencies();
const { depositosRepository } = useDepositosDependencies();
const { circuitosContablesRepository } = useCircuitosContablesDependencies();
const { productosRepository } = useProductosDependencies();
const remitosQuery = useRemitosQuery(remitosRepository);
const clientesQuery = useClientesQuery(clientesRepository);
const vendedoresQuery = useVendedoresQuery(vendedoresRepository);
const depositosQuery = useDepositosQuery(depositosRepository);
const circuitosContablesQuery = useCircuitosContablesQuery(circuitosContablesRepository);
const productosQuery = useProductosQuery(productosRepository);
const {
  router,
  selectedRemitoId,
  buildRemitoLink,
  buildClienteLink,
  buildVendedorLink,
  buildProductoLink,
  selectRemito,
  clearSelectedRemito,
  goToCliente,
  goToVendedor,
  goToProducto
} = useRemitosNavigation(logger);
const clienteSearchInput = ref("");
const appliedClienteSearch = ref("");
const numeroRemitoSearchInput = ref("");
const appliedNumeroRemitoSearch = ref("");
const observacionSearchInput = ref("");
const appliedObservacionSearch = ref("");
const fechaSearchInput = ref("");
const appliedFechaSearch = ref("");
const vendedorSearchInput = ref("");
const appliedVendedorSearch = ref("");
const depositoSearchInput = ref("");
const appliedDepositoSearch = ref("");
const circuitoSearchInput = ref("");
const appliedCircuitoSearch = ref("");
const sharedPageSizeOptions = [10, 20, 50, 100];
const sharedPageSizeStorageKey = "fitba.pageSize.listados";

watch(
  () => [selectedRemitoId.value, remitosQuery.data.value] as const,
  ([remitoId, remitosData]) => {
    if (!remitoId) {
      return;
    }
    const remitos = remitosData ?? [];
    const exists = remitos.some(
      (remito) => String(remito.transaccionId ?? "") === remitoId
    );
    if (!exists) {
      logger.warn("remitoVenta no existe en dataset actual", {
        remitoVenta: remitoId
      });
    }
  }
);

const remitos = computed(() => remitosQuery.data.value ?? []);
const clientesById = computed(() => {
  const index = new Map<string, string>();
  for (const cliente of clientesQuery.data.value ?? []) {
    const clienteId = String(cliente.clienteId ?? "").trim();
    if (!clienteId) {
      continue;
    }
    const nombre = String(cliente.nombre ?? "").trim();
    if (!nombre) {
      continue;
    }
    index.set(clienteId, nombre);
  }
  return index;
});
const vendedoresById = computed(() => {
  const index = new Map<string, string>();
  for (const vendedor of vendedoresQuery.data.value ?? []) {
    const vendedorId = String(vendedor.vendedorId ?? "").trim();
    if (!vendedorId) {
      continue;
    }
    const nombre = String(vendedor.nombre ?? "").trim();
    const apellido = String(vendedor.apellido ?? "").trim();
    const nombreCompleto = [nombre, apellido].filter(Boolean).join(" ").trim();
    if (!nombreCompleto) {
      continue;
    }
    index.set(vendedorId, nombreCompleto);
  }
  return index;
});
const normalizedClienteSearch = computed(() => appliedClienteSearch.value.trim().toLowerCase());
const normalizedNumeroRemitoSearch = computed(() =>
  appliedNumeroRemitoSearch.value.trim().toLowerCase()
);
const normalizedObservacionSearch = computed(() =>
  appliedObservacionSearch.value.trim().toLowerCase()
);
const normalizedFechaSearch = computed(() => appliedFechaSearch.value.trim().toLowerCase());
const normalizedVendedorSearch = computed(() => appliedVendedorSearch.value.trim().toLowerCase());
const depositosById = computed(() => {
  const index = new Map<string, string>();
  for (const deposito of depositosQuery.data.value ?? []) {
    const depositoId = String(deposito.depositoId ?? "").trim();
    if (!depositoId) {
      continue;
    }
    const nombre = String(deposito.nombre ?? "").trim();
    if (!nombre) {
      continue;
    }
    index.set(depositoId, nombre);
  }
  return index;
});
const normalizedDepositoSearch = computed(() => appliedDepositoSearch.value.trim().toLowerCase());
const circuitosById = computed(() => {
  const index = new Map<string, string>();
  for (const circuito of circuitosContablesQuery.data.value ?? []) {
    const circuitoId = String(circuito.circuitoContableId ?? "").trim();
    if (!circuitoId) {
      continue;
    }
    const nombre = String(circuito.nombre ?? "").trim();
    if (!nombre) {
      continue;
    }
    index.set(circuitoId, nombre);
  }
  return index;
});
const productosById = computed(() => {
  const index = new Map<string, string>();
  for (const producto of productosQuery.data.value ?? []) {
    const productoId = String(producto.productoId ?? "").trim();
    if (!productoId) {
      continue;
    }
    const nombre = String(producto.nombre ?? "").trim();
    if (!nombre) {
      continue;
    }
    index.set(productoId, nombre);
  }
  return index;
});
const normalizedCircuitoSearch = computed(() => appliedCircuitoSearch.value.trim().toLowerCase());
const filteredRemitos = computed(() => {
  if (
    !normalizedClienteSearch.value &&
    !normalizedNumeroRemitoSearch.value &&
    !normalizedObservacionSearch.value &&
    !normalizedFechaSearch.value &&
    !normalizedVendedorSearch.value &&
    !normalizedDepositoSearch.value &&
    !normalizedCircuitoSearch.value
  ) {
    return remitos.value;
  }
  return remitos.value.filter((remito) => {
    const nombreCliente = clienteDisplayName(remito.clienteId).toLowerCase();
    const numeroRemito = String(remito.numeroRemito ?? "").toLowerCase();
    const observacion = String(remito.observacion ?? "").toLowerCase();
    const fecha = formatDateDdMmYyyy(remito.fecha).toLowerCase();
    const nombreVendedor = vendedorDisplayName(remito.vendedorId).toLowerCase();
    const nombreDeposito = depositoDisplayName(remito.depositoId).toLowerCase();
    const nombreCircuito = circuitoDisplayName(remito.circuitoContableId).toLowerCase();
    const matchesCliente =
      !normalizedClienteSearch.value || nombreCliente.includes(normalizedClienteSearch.value);
    const matchesNumeroRemito =
      !normalizedNumeroRemitoSearch.value ||
      numeroRemito.includes(normalizedNumeroRemitoSearch.value);
    const matchesObservacion =
      !normalizedObservacionSearch.value ||
      observacion.includes(normalizedObservacionSearch.value);
    const matchesFecha =
      !normalizedFechaSearch.value || fecha.includes(normalizedFechaSearch.value);
    const matchesVendedor =
      !normalizedVendedorSearch.value || nombreVendedor.includes(normalizedVendedorSearch.value);
    const matchesDeposito =
      !normalizedDepositoSearch.value || nombreDeposito.includes(normalizedDepositoSearch.value);
    const matchesCircuito =
      !normalizedCircuitoSearch.value || nombreCircuito.includes(normalizedCircuitoSearch.value);
    return (
      matchesCliente &&
      matchesNumeroRemito &&
      matchesObservacion &&
      matchesFecha &&
      matchesVendedor &&
      matchesDeposito &&
      matchesCircuito
    );
  });
});

watch(
  () => route.query.remitoNumero,
  (value) => {
    const normalized = String(Array.isArray(value) ? value[0] ?? "" : value ?? "").trim();
    if (
      normalized === appliedNumeroRemitoSearch.value &&
      normalized === numeroRemitoSearchInput.value
    ) {
      return;
    }
    numeroRemitoSearchInput.value = normalized;
    appliedNumeroRemitoSearch.value = normalized;
  },
  { immediate: true }
);

watch(
  () => route.query.observacion,
  (value) => {
    const normalized = String(Array.isArray(value) ? value[0] ?? "" : value ?? "").trim();
    if (
      normalized === appliedObservacionSearch.value &&
      normalized === observacionSearchInput.value
    ) {
      return;
    }
    observacionSearchInput.value = normalized;
    appliedObservacionSearch.value = normalized;
  },
  { immediate: true }
);

watch(
  () => route.query.fecha,
  (value) => {
    const normalized = String(Array.isArray(value) ? value[0] ?? "" : value ?? "").trim();
    if (normalized === appliedFechaSearch.value && normalized === fechaSearchInput.value) {
      return;
    }
    fechaSearchInput.value = normalized;
    appliedFechaSearch.value = normalized;
  },
  { immediate: true }
);

watch(
  () => route.query.cliente,
  (value) => {
    const normalized = String(Array.isArray(value) ? value[0] ?? "" : value ?? "").trim();
    if (normalized === appliedClienteSearch.value && normalized === clienteSearchInput.value) {
      return;
    }
    clienteSearchInput.value = normalized;
    appliedClienteSearch.value = normalized;
  },
  { immediate: true }
);

watch(
  () => route.query.vendedorNombre,
  (value) => {
    const normalized = String(Array.isArray(value) ? value[0] ?? "" : value ?? "").trim();
    if (normalized === appliedVendedorSearch.value && normalized === vendedorSearchInput.value) {
      return;
    }
    vendedorSearchInput.value = normalized;
    appliedVendedorSearch.value = normalized;
  },
  { immediate: true }
);

watch(
  () => route.query.depositoNombre,
  (value) => {
    const normalized = String(Array.isArray(value) ? value[0] ?? "" : value ?? "").trim();
    if (normalized === appliedDepositoSearch.value && normalized === depositoSearchInput.value) {
      return;
    }
    depositoSearchInput.value = normalized;
    appliedDepositoSearch.value = normalized;
  },
  { immediate: true }
);

watch(
  () => route.query.circuitoNombre,
  (value) => {
    const normalized = String(Array.isArray(value) ? value[0] ?? "" : value ?? "").trim();
    if (normalized === appliedCircuitoSearch.value && normalized === circuitoSearchInput.value) {
      return;
    }
    circuitoSearchInput.value = normalized;
    appliedCircuitoSearch.value = normalized;
  },
  { immediate: true }
);

watch(
  () => fechaSearchInput.value,
  async (value) => {
    const normalized = value.trim();
    appliedFechaSearch.value = normalized;

    const currentQueryFecha = String(
      Array.isArray(route.query.fecha) ? route.query.fecha[0] ?? "" : route.query.fecha ?? ""
    ).trim();

    if (normalized === currentQueryFecha) {
      return;
    }

    try {
      await router.replace({
        query: {
          ...route.query,
          fecha: normalized || undefined
        }
      });
    } catch (error) {
      logger.error("Error al sincronizar filtro de fecha en URL", {
        error,
        normalized
      });
    }
  }
);

watch(
  () => numeroRemitoSearchInput.value,
  async (value) => {
    const normalized = value.trim();
    appliedNumeroRemitoSearch.value = normalized;

    const currentQueryNumeroRemito = String(
      Array.isArray(route.query.remitoNumero)
        ? route.query.remitoNumero[0] ?? ""
        : route.query.remitoNumero ?? ""
    ).trim();

    if (normalized === currentQueryNumeroRemito) {
      return;
    }

    try {
      await router.replace({
        query: {
          ...route.query,
          remitoNumero: normalized || undefined
        }
      });
    } catch (error) {
      logger.error("Error al sincronizar filtro de numero de remito en URL", {
        error,
        normalized
      });
    }
  }
);

watch(
  () => observacionSearchInput.value,
  async (value) => {
    const normalized = value.trim();
    appliedObservacionSearch.value = normalized;

    const currentQueryObservacion = String(
      Array.isArray(route.query.observacion)
        ? route.query.observacion[0] ?? ""
        : route.query.observacion ?? ""
    ).trim();

    if (normalized === currentQueryObservacion) {
      return;
    }

    try {
      await router.replace({
        query: {
          ...route.query,
          observacion: normalized || undefined
        }
      });
    } catch (error) {
      logger.error("Error al sincronizar filtro de observacion en URL", {
        error,
        normalized
      });
    }
  }
);

watch(
  () => clienteSearchInput.value,
  async (value) => {
    const normalized = value.trim();
    appliedClienteSearch.value = normalized;

    const currentQueryCliente = String(
      Array.isArray(route.query.cliente)
        ? route.query.cliente[0] ?? ""
        : route.query.cliente ?? ""
    ).trim();

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
      logger.error("Error al sincronizar filtro de cliente en URL", { error, normalized });
    }
  }
);

watch(
  () => depositoSearchInput.value,
  async (value) => {
    const normalized = value.trim();
    appliedDepositoSearch.value = normalized;

    const currentQueryDeposito = String(
      Array.isArray(route.query.depositoNombre)
        ? route.query.depositoNombre[0] ?? ""
        : route.query.depositoNombre ?? ""
    ).trim();

    if (normalized === currentQueryDeposito) {
      return;
    }

    try {
      await router.replace({
        query: {
          ...route.query,
          depositoNombre: normalized || undefined
        }
      });
    } catch (error) {
      logger.error("Error al sincronizar filtro de deposito en URL", { error, normalized });
    }
  }
);

watch(
  () => circuitoSearchInput.value,
  async (value) => {
    const normalized = value.trim();
    appliedCircuitoSearch.value = normalized;

    const currentQueryCircuito = String(
      Array.isArray(route.query.circuitoNombre)
        ? route.query.circuitoNombre[0] ?? ""
        : route.query.circuitoNombre ?? ""
    ).trim();

    if (normalized === currentQueryCircuito) {
      return;
    }

    try {
      await router.replace({
        query: {
          ...route.query,
          circuitoNombre: normalized || undefined
        }
      });
    } catch (error) {
      logger.error("Error al sincronizar filtro de circuito contable en URL", {
        error,
        normalized
      });
    }
  }
);

watch(
  () => vendedorSearchInput.value,
  async (value) => {
    const normalized = value.trim();
    appliedVendedorSearch.value = normalized;

    const currentQueryVendedor = String(
      Array.isArray(route.query.vendedorNombre)
        ? route.query.vendedorNombre[0] ?? ""
        : route.query.vendedorNombre ?? ""
    ).trim();

    if (normalized === currentQueryVendedor) {
      return;
    }

    try {
      await router.replace({
        query: {
          ...route.query,
          vendedorNombre: normalized || undefined
        }
      });
    } catch (error) {
      logger.error("Error al sincronizar filtro de vendedor en URL", { error, normalized });
    }
  }
);

watch(
  () => remitos.value,
  (remitosData) => {
    if (!runtimeConfig.debugRemitos) {
      return;
    }

    const sample = remitosData.slice(0, 5).map((remito) => ({
      transaccionId: remito.transaccionId,
      numeroRemito: remito.numeroRemito,
      observacion: remito.observacion
    }));

    logger.info("Muestra de observaciones normalizadas", {
      total: remitosData.length,
      sample
    });
  },
  { immediate: true }
);

const selectedRemito = computed(() =>
  remitos.value.find(
    (remito) => String(remito.transaccionId ?? "") === selectedRemitoId.value
  ) ?? null
);

const visibleRemitos = computed(() => {
  if (selectedRemito.value) {
    return [selectedRemito.value];
  }
  return filteredRemitos.value;
});

const remitosPagination = usePaginatedRows(visibleRemitos, {
  threshold: 10,
  defaultPageSize: 20,
  pageSizeOptions: sharedPageSizeOptions
});

const paginatedVisibleRemitos = computed(() => remitosPagination.rows.value);

const errorMessage = computed(() => {
  const error = remitosQuery.error.value;
  if (!error) {
    return null;
  }
  return resolveErrorMessage(error, "Error inesperado al cargar remitos.");
});

useTableRowNavigation();

if (typeof window !== "undefined") {
  const storedPageSize = Number(window.localStorage.getItem(sharedPageSizeStorageKey) ?? "");
  if (sharedPageSizeOptions.includes(storedPageSize)) {
    remitosPagination.setPageSize(storedPageSize);
  }
}

watch(
  () => remitosPagination.pageSize.value,
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

useAs400Shortcuts({
  onF2: () => {
    const firstContextLink = document.querySelector<HTMLAnchorElement>(
      ".fitba-table-shell tbody a.fitba-inline-link"
    );
    if (firstContextLink) {
      firstContextLink.focus();
      return;
    }
    const clienteInput = document.querySelector<HTMLInputElement>("#remitos-cliente-search");
    clienteInput?.focus();
  },
  onF3: clearSelectedRemito,
  onF5: reloadRemitos,
  onBack: () => router.back()
});

function isSelectedRemito(remito: Remito) {
  return String(remito.transaccionId ?? "") === selectedRemitoId.value;
}

function clienteDisplayName(clienteId: string | null) {
  const normalizedClienteId = String(clienteId ?? "").trim();
  if (!normalizedClienteId) {
    return "-";
  }
  return clientesById.value.get(normalizedClienteId) ?? normalizedClienteId;
}

function vendedorDisplayName(vendedorId: string | null) {
  const normalizedVendedorId = String(vendedorId ?? "").trim();
  if (!normalizedVendedorId) {
    return "-";
  }
  return vendedoresById.value.get(normalizedVendedorId) ?? normalizedVendedorId;
}

function depositoDisplayName(depositoId: string | null) {
  const normalizedDepositoId = String(depositoId ?? "").trim();
  if (!normalizedDepositoId) {
    return "-";
  }
  return depositosById.value.get(normalizedDepositoId) ?? normalizedDepositoId;
}

function circuitoDisplayName(circuitoContableId: string | null) {
  const normalizedCircuitoId = String(circuitoContableId ?? "").trim();
  if (!normalizedCircuitoId) {
    return "-";
  }
  return circuitosById.value.get(normalizedCircuitoId) ?? normalizedCircuitoId;
}

function productoDisplayName(productoId: string | null) {
  const normalizedProductoId = String(productoId ?? "").trim();
  if (!normalizedProductoId) {
    return "-";
  }
  return productosById.value.get(normalizedProductoId) ?? normalizedProductoId;
}

async function reloadRemitos() {
  try {
    logger.info("Recarga manual de remitos iniciada");
    await remitosQuery.refetch();
    logger.info("Recarga manual de remitos finalizada");
  } catch (error) {
    logger.error("Error al recargar remitos", {
      ...buildHttpErrorLogContext(error),
      triggeredBy: "manual_reload"
    });
  }
}

</script>

<style scoped>
.remitos-numero-remito-col {
  min-width: 165px;
  white-space: nowrap;
}

.remitos-screen {
  letter-spacing: 0.01em;
}

.remitos-fecha-col {
  min-width: 120px;
  white-space: nowrap;
}

.fitba-table-sticky thead th {
  position: sticky;
  top: 0;
  z-index: 2;
}

.fitba-table-readable td,
.fitba-table-readable th {
  vertical-align: middle;
  font-variant-numeric: tabular-nums;
}

.fitba-table-readable tbody tr {
  background-color: transparent;
}

.fitba-table-readable tbody tr:hover {
  background-color: rgba(64, 130, 78, 0.18);
}

.remito-mobile-card {
  border-width: 1px;
  border-radius: 2px;
  border-color: rgba(146, 245, 167, 0.3);
  background:
    linear-gradient(180deg, rgba(10, 26, 14, 0.95), rgba(8, 17, 10, 0.95)),
    repeating-linear-gradient(
      180deg,
      transparent 0,
      transparent 17px,
      rgba(146, 245, 167, 0.03) 17px,
      rgba(146, 245, 167, 0.03) 18px
    );
  box-shadow: inset 0 0 0 1px rgba(146, 245, 167, 0.1);
}

.remito-mobile-label {
  color: var(--fitba-phosphor-ink-soft);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.65rem;
}

.remito-mobile-value {
  color: var(--fitba-phosphor-ink);
}

.remito-mobile-meta {
  color: var(--fitba-phosphor-ink-soft);
  font-variant-numeric: tabular-nums;
}

.remito-mobile-observacion {
  color: var(--fitba-phosphor-ink-soft);
  display: -webkit-box;
  overflow: hidden;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

@media (max-width: 767px) {
  .remito-mobile-card {
    border-color: rgba(20, 58, 31, 0.35);
    background:
      linear-gradient(180deg, rgba(247, 253, 247, 0.98), rgba(237, 247, 238, 0.98)),
      repeating-linear-gradient(
        180deg,
        transparent 0,
        transparent 17px,
        rgba(20, 58, 31, 0.035) 17px,
        rgba(20, 58, 31, 0.035) 18px
      );
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.55);
  }

  .remito-mobile-card .fitba-key-link {
    color: #0f3a1e !important;
    text-decoration-color: rgba(15, 58, 30, 0.65) !important;
  }

  .remito-mobile-card .fitba-key-link:hover {
    color: #08210f !important;
    text-decoration-color: #08210f !important;
  }

  .remito-mobile-card .remito-mobile-label,
  .remito-mobile-card .remito-mobile-meta,
  .remito-mobile-card .remito-mobile-observacion,
  .remito-mobile-card .remito-mobile-value {
    color: #234a2f;
  }
}
</style>
