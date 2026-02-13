<template>
  <div
    class="fitba-pagination d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-2 mb-2"
    role="group"
    :aria-label="`Controles de paginacion para ${props.entityLabel}`"
  >
    <p class="fitba-pagination-summary mb-0" aria-live="polite">
      Mostrando {{ props.pageStart }}-{{ props.pageEnd }} de {{ props.totalRows }}
      {{ props.entityLabel }}.
    </p>

    <div class="fitba-pagination-controls d-flex flex-wrap align-items-center gap-2">
      <div class="fitba-page-size-group d-flex align-items-center gap-1">
        <label class="small mb-0" :for="pageSizeId">Filas</label>
        <select
          :id="pageSizeId"
          class="form-select form-select-sm fitba-page-size-select"
          :value="props.pageSize"
          @change="onPageSizeChange"
        >
          <option v-for="option in props.pageSizeOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </div>

      <div class="fitba-page-nav d-flex align-items-center gap-2">
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          :disabled="props.page <= 1"
          aria-label="Pagina anterior"
          @click="emit('update:page', props.page - 1)"
        >
          Anterior
        </button>

        <span class="fitba-pagination-counter" aria-live="polite">
          Pagina {{ props.page }} / {{ props.totalPages }}
        </span>

        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          :disabled="props.page >= props.totalPages"
          aria-label="Pagina siguiente"
          @click="emit('update:page', props.page + 1)"
        >
          Siguiente
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    page: number;
    pageSize: number;
    pageSizeOptions: readonly number[];
    totalRows: number;
    totalPages: number;
    pageStart: number;
    pageEnd: number;
    entityLabel?: string;
  }>(),
  {
    entityLabel: "registros"
  }
);

const emit = defineEmits<{
  "update:page": [number];
  "update:pageSize": [number];
}>();

const pageSizeId = `page-size-${Math.random().toString(36).slice(2, 10)}`;

function onPageSizeChange(event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLSelectElement)) {
    return;
  }
  const parsed = Number(target.value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return;
  }
  emit("update:pageSize", Math.trunc(parsed));
}
</script>
