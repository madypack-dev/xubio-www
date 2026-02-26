import { inject, type InjectionKey } from "vue";
import type { CircuitosContablesRepository } from "../domain";
import { createCircuitosContablesHttpRepository } from "../infrastructure";
import { runtimeConfig } from "@/shared/config/runtimeConfig";

type CircuitosContablesDependencies = {
  circuitosContablesRepository: CircuitosContablesRepository;
};

export const circuitosContablesDependenciesKey: InjectionKey<CircuitosContablesDependencies> =
  Symbol("circuitosContablesDependencies");

export function createDefaultCircuitosContablesDependencies(): CircuitosContablesDependencies {
  return {
    circuitosContablesRepository: createCircuitosContablesHttpRepository(
      runtimeConfig.apiBaseUrls
    )
  };
}

export function useCircuitosContablesDependencies(): CircuitosContablesDependencies {
  const dependencies = inject(circuitosContablesDependenciesKey);
  if (!dependencies) {
    return createDefaultCircuitosContablesDependencies();
  }
  return dependencies;
}
