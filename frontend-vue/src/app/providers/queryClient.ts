import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { runtimeConfig } from "@/shared/config/runtimeConfig";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: runtimeConfig.fallbackToMocksOnError ? false : 1,
      refetchOnWindowFocus: false
    }
  }
});

export const vueQueryPlugin = [
  VueQueryPlugin,
  {
    queryClient
  }
] as const;
