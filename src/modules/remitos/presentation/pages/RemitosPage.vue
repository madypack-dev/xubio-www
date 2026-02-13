<template>
  <div class="d-flex flex-column gap-3">
    <section class="card shadow-sm" :aria-busy="remitosQuery.isLoading.value">
      <div class="card-body">
        <div class="fitba-toolbar d-flex justify-content-between align-items-center mb-3">
          <h2 class="h5 mb-0">Remitos</h2>
          <div class="fitba-toolbar-actions d-flex gap-2">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
              aria-label="Limpiar remito seleccionado"
              ref="clearButtonRef"
              @click="clearSelectedRemito"
            >
              Limpiar
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-success"
              aria-label="Recargar listado de remitos"
              @click="reloadRemitos"
            >
              Recargar
            </button>
          </div>
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

          <div class="table-responsive fitba-table-responsive fitba-table-responsive--wide">
            <table
              class="table table-sm table-striped table-hover align-middle fitba-table-grid"
              data-nav-table="true"
              aria-label="Tabla de remitos de venta"
            >
              <caption class="visually-hidden">
                Listado de remitos con acceso a detalle de items y cliente.
              </caption>
              <thead class="table-dark">
                <tr>
                  <th scope="col">transaccionId</th>
                  <th scope="col" class="remitos-numero-remito-col">numeroRemito</th>
                  <th scope="col" class="remitos-fecha-col">fecha</th>
                  <th scope="col">observacion</th>
                  <th scope="col">clienteId</th>
                  <th scope="col">vendedorId</th>
                  <th scope="col" class="text-center">comisionVendedor</th>
                  <th scope="col" class="text-center">depositoId</th>
                  <th scope="col" class="text-center">circuitoContableId</th>
                  <th scope="col" class="text-center">items</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="remito in paginatedVisibleRemitos"
                  :key="rowKey(remito)"
                  data-nav-row="true"
                  tabindex="-1"
                  :class="{ 'table-primary': isSelectedRemito(remito) }"
                >
                  <td>
                    <a
                      v-if="remito.transaccionId"
                      class="fitba-inline-link"
                      data-nav-main="true"
                      :href="buildRemitoLink(remito.transaccionId)"
                      :aria-label="buildSelectRemitoIdLabel(remito.transaccionId)"
                      :aria-current="isSelectedRemito(remito) ? 'true' : undefined"
                      @click.prevent="selectRemito(remito.transaccionId)"
                    >
                      {{ remito.transaccionId }}
                    </a>
                    <span v-else>-</span>
                  </td>
                  <td class="remitos-numero-remito-col">{{ remito.numeroRemito || "-" }}</td>
                  <td class="remitos-fecha-col">{{ formatDateDdMmYyyy(remito.fecha) }}</td>
                  <td
                    class="fitba-cell-truncate fitba-cell-truncate--lg"
                    :title="remito.observacion || undefined"
                  >
                    {{ remito.observacion || "-" }}
                  </td>
                  <td>
                    <a
                      v-if="remito.clienteId"
                      class="fitba-inline-link"
                      :href="buildClienteLink(remito.clienteId)"
                      :aria-label="buildGoToClienteLabel(remito.clienteId)"
                      @click.prevent="goToCliente(remito.clienteId)"
                    >
                      {{ remito.clienteId }}
                    </a>
                    <span v-else>-</span>
                  </td>
                  <td>{{ remito.vendedorId ?? "-" }}</td>
                  <td class="fitba-cell-num text-center">{{ remito.comisionVendedor ?? "-" }}</td>
                  <td class="text-center">{{ remito.depositoId ?? "-" }}</td>
                  <td class="text-center">{{ remito.circuitoContableId ?? "-" }}</td>
                  <td class="fitba-cell-num text-center">{{ remito.items.length }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <section class="card shadow-sm">
      <div class="card-body">
        <h3 class="h6 mb-3">Detalle de items del remito</h3>

        <AsyncEmptyMessage
          v-if="!selectedRemito"
          message="Selecciona un remito para ver sus items."
        />

        <AsyncEmptyMessage
          v-else-if="selectedRemito.items.length === 0"
          message="El remito seleccionado no tiene items."
        />

        <div
          v-else
          class="fitba-table-shell table-responsive fitba-table-responsive fitba-table-responsive--wide"
        >
          <table
            class="table table-sm table-striped align-middle fitba-table-grid"
            data-nav-table="true"
            aria-label="Items del remito"
          >
            <caption class="visually-hidden">
              Items del remito seleccionado con acceso directo al producto.
            </caption>
            <thead class="table-dark">
              <tr>
                <th scope="col">itemId</th>
                <th scope="col">transaccionId</th>
                <th scope="col">producto.ID</th>
                <th scope="col">producto.id</th>
                <th scope="col">descripcion</th>
                <th scope="col">cantidad</th>
                <th scope="col">precio</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in selectedRemito.items" :key="itemRowKey(item)" data-nav-row="true" tabindex="-1">
                <td>{{ item.transaccionCVItemId ?? "-" }}</td>
                <td>{{ item.transaccionId ?? "-" }}</td>
                <td>{{ item.productoID ?? "-" }}</td>
                <td>
                  <a
                    v-if="item.productoId"
                    class="fitba-inline-link"
                    data-nav-main="true"
                    :href="buildProductoLink(item.productoId)"
                    :aria-label="buildGoToProductoLabel(item.productoId)"
                    @click.prevent="goToProducto(item.productoId)"
                  >
                    {{ item.productoid ?? item.productoId }}
                  </a>
                  <span v-else>{{ item.productoid ?? "-" }}</span>
                </td>
                <td>{{ item.descripcion || "-" }}</td>
                <td class="fitba-cell-num">{{ item.cantidad ?? "-" }}</td>
                <td class="fitba-cell-num">{{ item.precio ?? "-" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter, type LocationQueryValue } from "vue-router";
import { useRemitosQuery } from "../../application";
import { createRemitosHttpRepository } from "../../infrastructure";
import type { Remito, RemitoItem } from "../../domain";
import { runtimeConfig } from "@/shared/config/runtimeConfig";
import { usePaginatedRows } from "@/shared/lib/performance/usePaginatedRows";
import { useAs400Shortcuts } from "@/shared/lib/keyboard/useAs400Shortcuts";
import { useTableRowNavigation } from "@/shared/lib/keyboard/useTableRowNavigation";
import AsyncLoadingMessage from "@/shared/ui/AsyncLoadingMessage.vue";
import AsyncErrorMessage from "@/shared/ui/AsyncErrorMessage.vue";
import AsyncEmptyMessage from "@/shared/ui/AsyncEmptyMessage.vue";
import DataPaginationControls from "@/shared/ui/DataPaginationControls.vue";
import { resolveErrorMessage } from "@/shared/lib/http/resolveErrorMessage";

const route = useRoute();
const router = useRouter();
const remitosRepository = createRemitosHttpRepository(runtimeConfig.apiBaseUrl);
const remitosQuery = useRemitosQuery(remitosRepository);
const selectedRemitoId = ref<string | null>(readQueryValue(route.query.remitoVenta));
const clearButtonRef = ref<HTMLButtonElement | null>(null);

watch(
  () => route.query.remitoVenta,
  (value) => {
    selectedRemitoId.value = readQueryValue(value);
  }
);

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
      console.warn("[MVP] remitoVenta no existe en dataset actual", {
        remitoVenta: remitoId
      });
    }
  }
);

const remitos = computed(() => remitosQuery.data.value ?? []);

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

    console.info("[MVP][Remitos] Muestra de observaciones normalizadas", {
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
  return remitos.value;
});

const remitosPagination = usePaginatedRows(visibleRemitos, {
  threshold: 120,
  defaultPageSize: 100,
  pageSizeOptions: [50, 100, 250, 500]
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

useAs400Shortcuts({
  onF2: () => {
    const firstContextLink = document.querySelector<HTMLAnchorElement>(
      ".fitba-table-shell tbody a.fitba-inline-link"
    );
    if (firstContextLink) {
      firstContextLink.focus();
      return;
    }
    clearButtonRef.value?.focus();
  },
  onF3: clearSelectedRemito,
  onF5: reloadRemitos,
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

function rowKey(remito: Remito) {
  return String(remito.transaccionId ?? `${remito.numeroRemito}-${remito.fecha ?? ""}`);
}

function itemRowKey(item: RemitoItem) {
  return String(
    item.transaccionCVItemId ?? `${item.transaccionId ?? ""}-${item.productoId ?? ""}`
  );
}

function isSelectedRemito(remito: Remito) {
  return String(remito.transaccionId ?? "") === selectedRemitoId.value;
}

function buildSelectRemitoIdLabel(transaccionId: string | null) {
  if (!transaccionId) {
    return "Seleccionar remito";
  }
  return `Seleccionar remito ${transaccionId}`;
}

function buildGoToClienteLabel(clienteId: string | null) {
  if (!clienteId) {
    return "Abrir cliente";
  }
  return `Abrir cliente ${clienteId}`;
}

function buildGoToProductoLabel(productoId: string | null) {
  if (!productoId) {
    return "Abrir producto";
  }
  return `Abrir producto ${productoId}`;
}

function buildRemitoLink(transaccionId: string | null) {
  return router.resolve({
    name: "remitos",
    query: {
      ...route.query,
      remitoVenta: transaccionId ?? undefined
    }
  }).href;
}

function buildClienteLink(clienteId: string | null) {
  return router.resolve({
    name: "clientes",
    query: {
      ...route.query,
      cliente: clienteId ?? undefined
    }
  }).href;
}

function buildProductoLink(productoId: string | null) {
  return router.resolve({
    name: "productos",
    query: {
      ...route.query,
      producto: productoId ?? undefined
    }
  }).href;
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function formatDateDdMmYyyy(value: string | null): string {
  if (!value) {
    return "-";
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return "-";
  }

  const isoDateMatch = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ].*)?$/);
  if (isoDateMatch) {
    const year = Number(isoDateMatch[1]);
    const month = Number(isoDateMatch[2]);
    const day = Number(isoDateMatch[3]);
    if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
      return `${pad2(day)}/${pad2(month)}/${String(year)}`;
    }
  }

  const slashDateMatch = normalized.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/
  );
  if (slashDateMatch) {
    const day = Number(slashDateMatch[1]);
    const month = Number(slashDateMatch[2]);
    const year = Number(slashDateMatch[3]);
    if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
      return `${pad2(day)}/${pad2(month)}/${String(year)}`;
    }
  }

  return normalized;
}

async function reloadRemitos() {
  try {
    await remitosQuery.refetch();
  } catch (error) {
    console.error("[MVP] Error al recargar remitos", error);
  }
}

async function selectRemito(transaccionId: string | null) {
  if (!transaccionId) {
    console.warn("[MVP] Se intento seleccionar remito sin transaccionId.");
    return;
  }

  try {
    selectedRemitoId.value = transaccionId;
    await router.replace({
      query: {
        ...route.query,
        remitoVenta: transaccionId
      }
    });
  } catch (error) {
    console.error("[MVP] Error al seleccionar remito", { transaccionId, error });
  }
}

async function clearSelectedRemito() {
  try {
    selectedRemitoId.value = null;
    await router.replace({
      query: {
        ...route.query,
        remitoVenta: undefined
      }
    });
  } catch (error) {
    console.error("[MVP] Error al limpiar remito seleccionado", error);
  }
}

async function goToCliente(clienteId: string | null) {
  if (!clienteId) {
    console.warn("[MVP] Se intento navegar a cliente sin clienteId.");
    return;
  }

  try {
    await router.push({
      name: "clientes",
      query: {
        ...route.query,
        cliente: clienteId
      }
    });
  } catch (error) {
    console.error("[MVP] Error al navegar a cliente", { clienteId, error });
  }
}

async function goToProducto(productoId: string | null) {
  if (!productoId) {
    console.warn("[MVP] Se intento navegar a producto sin productoId.");
    return;
  }

  try {
    await router.push({
      name: "productos",
      query: {
        ...route.query,
        producto: productoId
      }
    });
  } catch (error) {
    console.error("[MVP] Error al navegar a producto", { productoId, error });
  }
}
</script>

<style scoped>
.remitos-numero-remito-col {
  min-width: 165px;
  white-space: nowrap;
}

.remitos-fecha-col {
  min-width: 120px;
  white-space: nowrap;
}
</style>
