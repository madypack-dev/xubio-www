import { inject, type InjectionKey } from "vue";
import type { ComprobantesRepository } from "../domain";
import { createComprobantesHttpRepository } from "../infrastructure";
import { runtimeConfig } from "@/shared/config/runtimeConfig";

type ComprobantesDependencies = {
  comprobantesRepository: ComprobantesRepository;
};

export const comprobantesDependenciesKey: InjectionKey<ComprobantesDependencies> = Symbol(
  "comprobantesDependencies"
);

export function createDefaultComprobantesDependencies(): ComprobantesDependencies {
  return {
    comprobantesRepository: createComprobantesHttpRepository(runtimeConfig.apiBaseUrl)
  };
}

export function useComprobantesDependencies(): ComprobantesDependencies {
  const dependencies = inject(comprobantesDependenciesKey);
  if (!dependencies) {
    return createDefaultComprobantesDependencies();
  }
  return dependencies;
}
