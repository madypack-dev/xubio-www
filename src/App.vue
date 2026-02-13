<template>
  <div class="app-shell">
    <a class="skip-link" href="#main-content">Saltar al contenido principal</a>

    <header class="app-header border-bottom border-2 border-success-subtle mb-3">
      <div class="container-fluid py-3">
        <h1 class="h4 mb-2 fw-semibold">FITBA Frontend Vue</h1>
        <p class="app-subtitle mb-2">Consola comercial estilo AS400</p>
        <p class="app-shortcuts mb-3" aria-label="Atajos de teclado AS400">
          F2 Foco | F3 Limpiar | F5 Recargar | F12 Volver
        </p>
        <nav class="nav nav-pills gap-2" aria-label="Modulos principales">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            class="nav-link fitba-nav-link"
            active-class="active"
            :to="item.to"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </div>
    </header>

    <main id="main-content" class="container-fluid pb-4" tabindex="-1">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";

const navItems = [
  { to: "/remitos", label: "Remitos" },
  { to: "/listas-precio", label: "Listas de precio" },
  { to: "/comprobantes", label: "Comprobantes" },
  { to: "/clientes", label: "Clientes" },
  { to: "/productos", label: "Productos" }
];
</script>
