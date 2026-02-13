import { createApp } from "vue";
import App from "./App.vue";
import { installAppPlugins } from "./app/providers/installPlugins";
import { installObservability } from "./app/providers/installObservability";
import { router } from "./app/router";
import { runtimeConfig } from "./shared/config/runtimeConfig";
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
app.use(router);
installObservability(router);
app.mount("#app");
