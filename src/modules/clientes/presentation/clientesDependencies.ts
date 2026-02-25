import { inject, type InjectionKey } from "vue";
import type { ClientesRepository } from "../domain";
import { createClientesHttpRepository } from "../infrastructure";
import { runtimeConfig } from "@/shared/config/runtimeConfig";

type ClientesDependencies = {
  clientesRepository: ClientesRepository;
};

export const clientesDependenciesKey: InjectionKey<ClientesDependencies> = Symbol(
  "clientesDependencies"
);

export function createDefaultClientesDependencies(): ClientesDependencies {
  return {
    clientesRepository: createClientesHttpRepository(runtimeConfig.apiBaseUrls)
  };
}

export function useClientesDependencies(): ClientesDependencies {
  const dependencies = inject(clientesDependenciesKey);
  if (!dependencies) {
    return createDefaultClientesDependencies();
  }
  return dependencies;
}
