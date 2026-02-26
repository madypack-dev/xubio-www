import { inject, type InjectionKey } from "vue";
import type { DepositosRepository } from "../domain";
import { createDepositosHttpRepository } from "../infrastructure";
import { runtimeConfig } from "@/shared/config/runtimeConfig";

type DepositosDependencies = {
  depositosRepository: DepositosRepository;
};

export const depositosDependenciesKey: InjectionKey<DepositosDependencies> = Symbol(
  "depositosDependencies"
);

export function createDefaultDepositosDependencies(): DepositosDependencies {
  return {
    depositosRepository: createDepositosHttpRepository(runtimeConfig.apiBaseUrls)
  };
}

export function useDepositosDependencies(): DepositosDependencies {
  const dependencies = inject(depositosDependenciesKey);
  if (!dependencies) {
    return createDefaultDepositosDependencies();
  }
  return dependencies;
}
