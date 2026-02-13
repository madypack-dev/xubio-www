<template>
  <p class="fitba-async-message fitba-async-loading mb-0" role="status" aria-live="polite">
    <span class="spinner-border spinner-border-sm me-2" aria-hidden="true" />
    {{ message }}
  </p>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ message?: string }>(), {
  message: "Cargando..."
});
</script>
