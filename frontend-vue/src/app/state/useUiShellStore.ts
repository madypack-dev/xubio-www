import { defineStore } from "pinia";

export type MainModule =
  | "remitos"
  | "listas-precio"
  | "comprobantes"
  | "clientes"
  | "productos";

type BannerState = {
  message: string;
  variant: "success" | "warning" | "danger" | "info";
} | null;

type UiShellState = {
  activeModule: MainModule;
  banner: BannerState;
};

export const useUiShellStore = defineStore("ui-shell", {
  state: (): UiShellState => ({
    activeModule: "remitos",
    banner: null
  }),
  actions: {
    setActiveModule(module: MainModule) {
      this.activeModule = module;
    },
    showBanner(message: string, variant: NonNullable<BannerState>["variant"]) {
      this.banner = { message, variant };
    },
    clearBanner() {
      this.banner = null;
    }
  }
});
