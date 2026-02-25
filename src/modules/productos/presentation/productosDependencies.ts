import { inject, type InjectionKey } from "vue";
import type { ProductosRepository } from "../domain";
import { createProductosHttpRepository } from "../infrastructure";
import { runtimeConfig } from "@/shared/config/runtimeConfig";

type ProductosDependencies = {
  productosRepository: ProductosRepository;
};

export const productosDependenciesKey: InjectionKey<ProductosDependencies> = Symbol(
  "productosDependencies"
);

export function createDefaultProductosDependencies(): ProductosDependencies {
  return {
    productosRepository: createProductosHttpRepository(runtimeConfig.apiBaseUrls)
  };
}

export function useProductosDependencies(): ProductosDependencies {
  const dependencies = inject(productosDependenciesKey);
  if (!dependencies) {
    return createDefaultProductosDependencies();
  }
  return dependencies;
}
