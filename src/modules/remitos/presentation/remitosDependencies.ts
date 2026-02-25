import { inject, type InjectionKey } from "vue";
import type { RemitosRepository } from "../domain";
import { createRemitosHttpRepository } from "../infrastructure";
import { runtimeConfig } from "@/shared/config/runtimeConfig";

type RemitosDependencies = {
  remitosRepository: RemitosRepository;
};

export const remitosDependenciesKey: InjectionKey<RemitosDependencies> =
  Symbol("remitosDependencies");

export function createDefaultRemitosDependencies(): RemitosDependencies {
  return {
    remitosRepository: createRemitosHttpRepository(runtimeConfig.apiBaseUrls)
  };
}

export function useRemitosDependencies(): RemitosDependencies {
  const dependencies = inject(remitosDependenciesKey);
  if (!dependencies) {
    return createDefaultRemitosDependencies();
  }
  return dependencies;
}
