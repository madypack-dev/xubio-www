import type { App } from "vue";
import { createPinia } from "pinia";
import { vueQueryPlugin } from "./queryClient";

export function installAppPlugins(app: App<Element>) {
  app.use(createPinia());
  app.use(...vueQueryPlugin);
}
