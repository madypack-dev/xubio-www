<template>
  <div class="fitba-filterbar mb-3">
    <label class="form-label mb-1" :for="inputId">{{ label }}</label>
    <div class="d-flex align-items-center gap-1">
      <input
        :id="inputId"
        :value="modelValue"
        type="text"
        class="form-control form-control-sm fitba-filterbar-input"
        inputmode="text"
        autocomplete="off"
        :placeholder="placeholder"
        :aria-describedby="helpId"
        :aria-label="inputAriaLabel"
        @input="onInput"
      />
      <button
        v-if="showPasteButton"
        type="button"
        class="btn btn-sm btn-outline-secondary"
        :aria-label="pasteAriaLabel"
        :title="pasteTitle"
        @click="emit('paste')"
      >
        📋
      </button>
    </div>
    <small v-if="helpText" :id="helpId" class="text-body-secondary">
      {{ helpText }}
    </small>
    <p
      v-if="errorMessage"
      class="fitba-async-message fitba-async-error mb-0 mt-2"
      aria-live="polite"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string;
    label: string;
    placeholder: string;
    inputAriaLabel: string;
    inputId: string;
    helpId?: string;
    helpText?: string;
    errorMessage?: string;
    showPasteButton?: boolean;
    pasteAriaLabel?: string;
    pasteTitle?: string;
  }>(),
  {
    helpId: undefined,
    helpText: "",
    errorMessage: "",
    showPasteButton: false,
    pasteAriaLabel: "Pegar desde portapapeles",
    pasteTitle: "Pegar"
  }
);

const emit = defineEmits<{
  "update:modelValue": [string];
  paste: [];
}>();

function onInput(event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }
  emit("update:modelValue", target.value);
}
</script>

<style scoped>
.fitba-filterbar {
  max-width: 26rem;
}

.fitba-filterbar-input {
  min-width: 12rem;
}
</style>
