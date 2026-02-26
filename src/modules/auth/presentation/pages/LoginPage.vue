<template>
  <section class="card shadow-sm fitba-screen--phosphor">
    <div class="card-body">
      <div class="fitba-statusbar mb-3" role="status" aria-live="polite">
        <span class="fitba-statusbar-item">MODULO: AUTH</span>
        <span class="fitba-statusbar-item">VISTA: LOGIN</span>
      </div>

      <h2 class="h5 mb-3">Ingreso</h2>
      <p class="mb-3 small text-body-secondary">
        Inicia sesion con Google para acceder a los modulos.
      </p>

      <button
        type="button"
        class="btn btn-primary"
        :disabled="isLoading"
        @click="loginWithGoogle"
      >
        {{ isLoading ? "Redirigiendo..." : "Continuar con Google" }}
      </button>

      <p v-if="errorMessage" class="text-danger small mt-2 mb-0">{{ errorMessage }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useAuthDependencies } from "../authDependencies";

const route = useRoute();
const { authRepository } = useAuthDependencies();
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);

async function loginWithGoogle() {
  if (isLoading.value) {
    return;
  }
  isLoading.value = true;
  errorMessage.value = null;

  try {
    const redirectPath = normalizeRedirectPath(
      typeof route.query.redirect === "string" ? route.query.redirect : "/"
    );
    const loginUrl = await authRepository.startGoogleLogin(redirectPath);
    window.location.assign(loginUrl);
  } catch (_error) {
    errorMessage.value = "No se pudo iniciar el login con Google.";
  } finally {
    isLoading.value = false;
  }
}

function normalizeRedirectPath(input: string) {
  const trimmed = String(input ?? "").trim();
  if (!trimmed.startsWith("/")) {
    return "/";
  }
  return trimmed;
}
</script>
