import { createApp } from "vue";
import App from "./App.vue";
import { installAppPlugins } from "./app/providers/installPlugins";
import { router } from "./app/router";
import { runtimeConfig } from "./shared/config/runtimeConfig";
import "bootstrap/dist/css/bootstrap.min.css";
import "./shared/design/theme.css";

if (runtimeConfig.verboseStartupLogs) {
  const notes: string[] = [];
  if (runtimeConfig.useMocks) {
    notes.push("Modo mock activo.");
  }
  if (runtimeConfig.useDevProxyForApi) {
    notes.push("Dev proxy activo para /API.");
  }
  if (runtimeConfig.useRelativeApiBase) {
    notes.push("API base relativa forzada por mismo origen/loopback.");
  }
  if (!runtimeConfig.useMocks && runtimeConfig.fallbackToMocksOnError) {
    notes.push("Fallback a mocks por error de API activo.");
  }
  if (notes.length > 0) {
    console.info("[MVP] Runtime config:", notes.join(" "));
  }
}

const app = createApp(App);

installAppPlugins(app);
app.use(router);
app.mount("#app");
