<template>
  <div class="app-shell">
    <header class="border-bottom border-2 border-success-subtle mb-3">
      <div class="container-fluid py-3">
        <h1 class="h4 mb-2 fw-semibold">FITBA Frontend Vue</h1>
        <nav class="nav nav-pills gap-2">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            class="nav-link"
            active-class="active"
            :to="item.to"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="container-fluid pb-4">
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
