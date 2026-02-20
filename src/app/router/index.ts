import type { RouteRecordRaw } from "vue-router";
import { createRouter, createWebHistory } from "vue-router";
import ClientesPage from "@/modules/clientes/presentation/pages/ClientesPage.vue";
import ComprobantesPage from "@/modules/comprobantes/presentation/pages/ComprobantesPage.vue";
import ListasPrecioPage from "@/modules/listas-precio/presentation/pages/ListasPrecioPage.vue";
import ProductosPage from "@/modules/productos/presentation/pages/ProductosPage.vue";
import RemitosPage from "@/modules/remitos/presentation/pages/RemitosPage.vue";
import VendedoresPage from "@/modules/vendedores/presentation/pages/VendedoresPage.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: { name: "remitos" }
  },
  {
    path: "/remitos",
    name: "remitos",
    component: RemitosPage
  },
  {
    path: "/remito",
    redirect: { name: "remitos" }
  },
  {
    path: "/listas-precio",
    name: "listas-precio",
    component: ListasPrecioPage
  },
  {
    path: "/comprobantes",
    name: "comprobantes",
    component: ComprobantesPage
  },
  {
    path: "/clientes",
    name: "clientes",
    component: ClientesPage
  },
  {
    path: "/vendedores",
    name: "vendedores",
    component: VendedoresPage
  },
  {
    path: "/productos",
    name: "productos",
    component: ProductosPage
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});

function hasQueryKey(value: unknown) {
  if (Array.isArray(value)) {
    return value.some((item) => String(item).trim().length > 0);
  }
  if (value === null || value === undefined) {
    return false;
  }
  return String(value).trim().length > 0;
}

router.beforeEach((to) => {
  try {
    if (to.path !== "/") {
      return true;
    }

    const hasCliente = hasQueryKey(to.query.cliente);
    const hasVendedor = hasQueryKey(to.query.vendedor);
    const hasProducto = hasQueryKey(to.query.producto);
    const hasRemito = hasQueryKey(to.query.remitoVenta);

    if (hasCliente) {
      return { name: "clientes", query: to.query };
    }
    if (hasVendedor) {
      return { name: "vendedores", query: to.query };
    }
    if (hasProducto) {
      return { name: "productos", query: to.query };
    }
    if (hasRemito) {
      return { name: "remitos", query: to.query };
    }

    return { name: "remitos", query: to.query };
  } catch (error) {
    console.error("[MVP] Error en guard de router legacy query", error);
    return true;
  }
});
