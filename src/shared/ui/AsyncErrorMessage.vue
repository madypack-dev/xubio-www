<template>
  <p class="fitba-async-message fitba-async-error mb-0" role="alert" aria-live="assertive">
    {{ message }}
  </p>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ message?: string }>(), {
  message: "Ocurrio un error."
});
</script>
