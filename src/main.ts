import { createApp } from "vue";
import App from "./App.vue";
import { installAppPlugins } from "./app/providers/installPlugins";
import { installObservability } from "./app/providers/installObservability";
import { router } from "./app/router";
import { runtimeConfig } from "./shared/config/runtimeConfig";
import {
  createDefaultRemitosDependencies,
  remitosDependenciesKey
} from "./modules/remitos/presentation/remitosDependencies";
import {
  comprobantesDependenciesKey,
  createDefaultComprobantesDependencies
} from "./modules/comprobantes/presentation/comprobantesDependencies";
import {
  clientesDependenciesKey,
  createDefaultClientesDependencies
} from "./modules/clientes/presentation/clientesDependencies";
import {
  createDefaultProductosDependencies,
  productosDependenciesKey
} from "./modules/productos/presentation/productosDependencies";
import {
  createDefaultVendedoresDependencies,
  vendedoresDependenciesKey
} from "./modules/vendedores/presentation/vendedoresDependencies";
import {
  createDefaultListasPrecioDependencies,
  listasPrecioDependenciesKey
} from "./modules/listas-precio/presentation/listasPrecioDependencies";
import {
  createDefaultDepositosDependencies,
  depositosDependenciesKey
} from "./modules/depositos/presentation/depositosDependencies";
import "bootstrap/dist/css/bootstrap.min.css";
import "./shared/design/theme.css";

if (runtimeConfig.verboseStartupLogs) {
  const notes: string[] = [];
  if (runtimeConfig.useDevProxyForApi) {
    notes.push("Dev proxy activo para /API.");
  }
  if (runtimeConfig.useRelativeApiBase) {
    notes.push("API base relativa forzada por mismo origen/loopback.");
  }
  if (runtimeConfig.observabilityEnabled) {
    notes.push("Observabilidad frontend activa.");
  }
  notes.push(`API base resuelta: ${runtimeConfig.apiBaseUrl || "<relativa>"}.`);
  if (notes.length > 0) {
    console.info("[MVP] Runtime config:", notes.join(" "));
  }
}

const app = createApp(App);

installAppPlugins(app);
app.provide(remitosDependenciesKey, createDefaultRemitosDependencies());
app.provide(comprobantesDependenciesKey, createDefaultComprobantesDependencies());
app.provide(clientesDependenciesKey, createDefaultClientesDependencies());
app.provide(productosDependenciesKey, createDefaultProductosDependencies());
app.provide(vendedoresDependenciesKey, createDefaultVendedoresDependencies());
app.provide(listasPrecioDependenciesKey, createDefaultListasPrecioDependencies());
app.provide(depositosDependenciesKey, createDefaultDepositosDependencies());
app.use(router);
installObservability(router);
app.mount("#app");
