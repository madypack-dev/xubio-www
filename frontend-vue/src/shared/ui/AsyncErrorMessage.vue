<template>
  <p class="text-danger mb-0">
    {{ message }}
  </p>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ message?: string }>(), {
  message: "Ocurrio un error."
});
</script>
