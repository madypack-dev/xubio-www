import { inject, type InjectionKey } from "vue";
import type { AuthRepository } from "../domain";
import { createAuthHttpRepository } from "../infrastructure";
import { runtimeConfig } from "@/shared/config/runtimeConfig";

type AuthDependencies = {
  authRepository: AuthRepository;
};

export const authDependenciesKey: InjectionKey<AuthDependencies> =
  Symbol("authDependencies");

export function createDefaultAuthDependencies(): AuthDependencies {
  return {
    authRepository: createAuthHttpRepository(runtimeConfig.apiBaseUrls)
  };
}

export function useAuthDependencies(): AuthDependencies {
  const dependencies = inject(authDependenciesKey);
  if (!dependencies) {
    return createDefaultAuthDependencies();
  }
  return dependencies;
}
