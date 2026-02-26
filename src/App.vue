<template>
  <div class="app-shell fitba-screen--phosphor">
    <a class="skip-link" href="#main-content">Saltar al contenido principal</a>

    <header class="app-header border-bottom border-2 border-success-subtle mb-3">
      <div class="container-fluid py-3">
        <div class="fitba-title-row d-flex flex-column gap-2 mb-3">
          <h1 class="h4 mb-0 fw-semibold">FITBA Frontend Vue</h1>
          <p class="app-subtitle mb-0">Consola comercial estilo AS400</p>
          <div class="app-shortcuts" aria-label="Atajos de teclado AS400">
            <span class="fitba-command-item">
              <kbd class="fitba-key">F2</kbd>
              <span>Foco</span>
            </span>
            <span class="fitba-command-item">
              <kbd class="fitba-key">F3</kbd>
              <span>Limpiar</span>
            </span>
            <span class="fitba-command-item">
              <kbd class="fitba-key">F5</kbd>
              <span>Recargar</span>
            </span>
            <span class="fitba-command-item">
              <kbd class="fitba-key">Back / Alt+Left</kbd>
              <span>Volver</span>
            </span>
            <span class="fitba-command-item">
              <kbd class="fitba-key">↑ ↓</kbd>
              <span>Mover fila</span>
            </span>
            <span class="fitba-command-item">
              <kbd class="fitba-key">Enter</kbd>
              <span>Abrir</span>
            </span>
          </div>
        </div>
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

    <main id="main-content" class="container-fluid pb-4 fitba-workspace" tabindex="-1">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";

const navItems = [
  { to: "/remitos", label: "Remitos" },
  { to: "/clientes", label: "Clientes" },
  { to: "/productos", label: "Productos" },
  { to: "/vendedores", label: "Vendedores" },
  { to: "/depositos", label: "Depositos" },
  { to: "/listas-precio", label: "Listas de precio" },
  { to: "/comprobantes", label: "Comprobantes" }
];
</script>
