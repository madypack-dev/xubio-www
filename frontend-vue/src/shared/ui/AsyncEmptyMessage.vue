<template>
  <p class="fitba-async-message fitba-async-empty mb-0" role="status" aria-live="polite">
    {{ message }}
  </p>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ message?: string }>(), {
  message: "No hay datos para mostrar."
});
</script>
