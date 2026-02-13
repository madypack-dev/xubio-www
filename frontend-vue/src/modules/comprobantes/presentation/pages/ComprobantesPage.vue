<template>
  <div class="d-flex flex-column gap-3">
    <section class="card shadow-sm">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2 class="h5 mb-0">Comprobantes (MVP)</h2>
          <button
            type="button"
            class="btn btn-sm btn-outline-success"
            @click="reloadComprobantes"
          >
            Recargar
          </button>
        </div>

        <AsyncLoadingMessage
          v-if="comprobantesQuery.isLoading.value"
          message="Cargando comprobantes..."
        />

        <AsyncErrorMessage
          v-else-if="listErrorMessage"
          :message="listErrorMessage"
        />

        <AsyncEmptyMessage
          v-else-if="comprobantes.length === 0"
          message="No hay comprobantes disponibles."
        />

        <div v-else class="table-responsive">
          <table class="table table-sm table-striped table-hover align-middle mb-0">
            <thead class="table-dark">
              <tr>
                <th scope="col">id</th>
                <th scope="col">nombre</th>
                <th scope="col">fecha</th>
                <th scope="col">cliente</th>
                <th scope="col">importeTotal</th>
                <th scope="col">accion</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="comprobante in comprobantes"
                :key="comprobante.comprobanteVentaId ?? comprobante.nombre"
              >
                <td>{{ comprobante.comprobanteVentaId ?? "-" }}</td>
                <td>{{ comprobante.nombre || "-" }}</td>
                <td>{{ comprobante.fecha ?? "-" }}</td>
                <td>{{ comprobante.clienteNombre || "-" }}</td>
                <td>{{ comprobante.importeTotal ?? "-" }}</td>
                <td>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-primary"
                    :disabled="!comprobante.comprobanteVentaId"
                    @click="selectComprobanteById(comprobante.comprobanteVentaId)"
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="card shadow-sm">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 class="h6 mb-0">Detalle de comprobante</h3>
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            @click="clearSelection"
          >
            Limpiar
          </button>
        </div>

        <AsyncEmptyMessage
          v-if="!selectedComprobanteId"
          message="Selecciona un comprobante para ver el detalle."
        />

        <AsyncLoadingMessage
          v-else-if="detailQuery.isLoading.value"
          message="Cargando detalle..."
        />

        <AsyncErrorMessage
          v-else-if="detailErrorMessage"
          :message="detailErrorMessage"
        />

        <AsyncNotFoundMessage
          v-else-if="!comprobanteDetail"
          message="No se encontro detalle para el comprobante seleccionado."
        />

        <div v-else class="table-responsive">
          <table class="table table-sm align-middle mb-0">
            <tbody>
              <tr>
                <th scope="row">ID</th>
                <td>{{ comprobanteDetail.comprobanteVentaId ?? "-" }}</td>
              </tr>
              <tr>
                <th scope="row">Nombre</th>
                <td>{{ comprobanteDetail.nombre || "-" }}</td>
              </tr>
              <tr>
                <th scope="row">Fecha</th>
                <td>{{ comprobanteDetail.fecha ?? "-" }}</td>
              </tr>
              <tr>
                <th scope="row">FechaVto</th>
                <td>{{ comprobanteDetail.fechaVto ?? "-" }}</td>
              </tr>
              <tr>
                <th scope="row">Cliente</th>
                <td>{{ comprobanteDetail.clienteNombre || "-" }}</td>
              </tr>
              <tr>
                <th scope="row">Vendedor</th>
                <td>{{ comprobanteDetail.vendedorNombre || "-" }}</td>
              </tr>
              <tr>
                <th scope="row">Importe total</th>
                <td>{{ comprobanteDetail.importeTotal ?? "-" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useComprobanteDetailQuery, useComprobantesQuery } from "../../application";
import AsyncLoadingMessage from "@/shared/ui/AsyncLoadingMessage.vue";
import AsyncErrorMessage from "@/shared/ui/AsyncErrorMessage.vue";
import AsyncEmptyMessage from "@/shared/ui/AsyncEmptyMessage.vue";
import AsyncNotFoundMessage from "@/shared/ui/AsyncNotFoundMessage.vue";
import { resolveErrorMessage } from "@/shared/lib/http/resolveErrorMessage";

const comprobantesQuery = useComprobantesQuery();
const selectedComprobanteId = ref<string | null>(null);
const detailQuery = useComprobanteDetailQuery(selectedComprobanteId);

const comprobantes = computed(() => comprobantesQuery.data.value ?? []);
const comprobanteDetail = computed(() => detailQuery.data.value ?? null);

const listErrorMessage = computed(() => {
  const error = comprobantesQuery.error.value;
  if (!error) {
    return null;
  }
  return resolveErrorMessage(error, "Error inesperado al cargar comprobantes.");
});

const detailErrorMessage = computed(() => {
  const error = detailQuery.error.value;
  if (!error) {
    return null;
  }
  return resolveErrorMessage(error, "Error inesperado al cargar detalle.");
});

async function reloadComprobantes() {
  try {
    await comprobantesQuery.refetch();
  } catch (error) {
    console.error("[MVP] Error al recargar comprobantes", error);
  }
}

function selectComprobanteById(comprobanteVentaId: string | null) {
  try {
    if (!comprobanteVentaId) {
      console.warn("[MVP] Se intento abrir detalle sin comprobanteVentaId.");
      return;
    }
    selectedComprobanteId.value = comprobanteVentaId;
  } catch (error) {
    console.error("[MVP] Error al seleccionar comprobante", {
      comprobanteVentaId,
      error
    });
  }
}

function clearSelection() {
  try {
    selectedComprobanteId.value = null;
  } catch (error) {
    console.error("[MVP] Error al limpiar seleccion de comprobante", error);
  }
}
</script>
