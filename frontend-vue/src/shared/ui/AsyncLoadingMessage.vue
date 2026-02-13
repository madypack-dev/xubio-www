<template>
  <p class="text-secondary mb-0">
    {{ message }}
  </p>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ message?: string }>(), {
  message: "Cargando..."
});
</script>
