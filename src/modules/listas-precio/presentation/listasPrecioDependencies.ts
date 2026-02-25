import { inject, type InjectionKey } from "vue";
import type { ListasPrecioRepository } from "../domain";
import { createListasPrecioHttpRepository } from "../infrastructure";
import { runtimeConfig } from "@/shared/config/runtimeConfig";

type ListasPrecioDependencies = {
  listasPrecioRepository: ListasPrecioRepository;
};

export const listasPrecioDependenciesKey: InjectionKey<ListasPrecioDependencies> = Symbol(
  "listasPrecioDependencies"
);

export function createDefaultListasPrecioDependencies(): ListasPrecioDependencies {
  return {
    listasPrecioRepository: createListasPrecioHttpRepository(runtimeConfig.apiBaseUrls)
  };
}

export function useListasPrecioDependencies(): ListasPrecioDependencies {
  const dependencies = inject(listasPrecioDependenciesKey);
  if (!dependencies) {
    return createDefaultListasPrecioDependencies();
  }
  return dependencies;
}
