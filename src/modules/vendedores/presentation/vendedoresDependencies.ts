import { inject, type InjectionKey } from "vue";
import type { VendedoresRepository } from "../domain";
import { createVendedoresHttpRepository } from "../infrastructure";
import { runtimeConfig } from "@/shared/config/runtimeConfig";

type VendedoresDependencies = {
  vendedoresRepository: VendedoresRepository;
};

export const vendedoresDependenciesKey: InjectionKey<VendedoresDependencies> = Symbol(
  "vendedoresDependencies"
);

export function createDefaultVendedoresDependencies(): VendedoresDependencies {
  return {
    vendedoresRepository: createVendedoresHttpRepository(runtimeConfig.apiBaseUrl)
  };
}

export function useVendedoresDependencies(): VendedoresDependencies {
  const dependencies = inject(vendedoresDependenciesKey);
  if (!dependencies) {
    return createDefaultVendedoresDependencies();
  }
  return dependencies;
}
