import type {
  NavigationGuardReturn,
  RouteLocationNormalized,
  RouteRecordRaw
} from "vue-router";
import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "@/modules/auth/presentation/pages/LoginPage.vue";
import ClientesPage from "@/modules/clientes/presentation/pages/ClientesPage.vue";
import CircuitosContablesPage from "@/modules/circuitos-contables/presentation/pages/CircuitosContablesPage.vue";
import ComprobantesPage from "@/modules/comprobantes/presentation/pages/ComprobantesPage.vue";
import DepositosPage from "@/modules/depositos/presentation/pages/DepositosPage.vue";
import ListasPrecioPage from "@/modules/listas-precio/presentation/pages/ListasPrecioPage.vue";
import ProductosPage from "@/modules/productos/presentation/pages/ProductosPage.vue";
import RemitosPage from "@/modules/remitos/presentation/pages/RemitosPage.vue";
import VendedoresPage from "@/modules/vendedores/presentation/pages/VendedoresPage.vue";
import { createAuthHttpRepository } from "@/modules/auth/infrastructure";
import { runtimeConfig } from "@/shared/config/runtimeConfig";
import { createLogger } from "@/shared/lib/observability/logger";

const logger = createLogger("MVP AppRouter");

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: { name: "remitos" },
    meta: { requiresAuth: true }
  },
  {
    path: "/login",
    name: "login",
    component: LoginPage,
    meta: { requiresAuth: false }
  },
  {
    path: "/remitos",
    name: "remitos",
    component: RemitosPage,
    meta: { requiresAuth: true }
  },
  {
    path: "/remito",
    redirect: { name: "remitos" },
    meta: { requiresAuth: true }
  },
  {
    path: "/listas-precio",
    name: "listas-precio",
    component: ListasPrecioPage,
    meta: { requiresAuth: true }
  },
  {
    path: "/comprobantes",
    name: "comprobantes",
    component: ComprobantesPage,
    meta: { requiresAuth: true }
  },
  {
    path: "/clientes",
    name: "clientes",
    component: ClientesPage,
    meta: { requiresAuth: true }
  },
  {
    path: "/vendedores",
    name: "vendedores",
    component: VendedoresPage,
    meta: { requiresAuth: true }
  },
  {
    path: "/depositos",
    name: "depositos",
    component: DepositosPage,
    meta: { requiresAuth: true }
  },
  {
    path: "/circuitos-contables",
    name: "circuitos-contables",
    component: CircuitosContablesPage,
    meta: { requiresAuth: true }
  },
  {
    path: "/productos",
    name: "productos",
    component: ProductosPage,
    meta: { requiresAuth: true }
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

function resolveRequiresAuth(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }
  return true;
}

function normalizeRedirectPath(fullPath: string) {
  const normalized = String(fullPath ?? "").trim();
  if (!normalized.startsWith("/")) {
    return "/";
  }
  return normalized;
}

const authRepository = createAuthHttpRepository(runtimeConfig.apiBaseUrls);

async function runAuthGuard(to: RouteLocationNormalized): Promise<NavigationGuardReturn> {
  if (!runtimeConfig.authEnabled) {
    return true;
  }

  const requiresAuth = resolveRequiresAuth(to.meta.requiresAuth);
  const session = await authRepository.getSession();

  if (!requiresAuth) {
    if (session.authenticated) {
      return { name: "remitos" };
    }
    return true;
  }

  if (session.authenticated) {
    return true;
  }

  return {
    name: "login",
    query: {
      redirect: normalizeRedirectPath(to.fullPath)
    }
  };
}

function runLegacyRootRedirect(to: RouteLocationNormalized): NavigationGuardReturn {
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
}

router.beforeEach(async (to) => {
  try {
    const authResult = await runAuthGuard(to);
    if (authResult !== true) {
      return authResult;
    }
    return runLegacyRootRedirect(to);
  } catch (error) {
    logger.error("Error en guard de router", { error });
    return true;
  }
});
