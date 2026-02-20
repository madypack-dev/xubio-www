import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { decideHttpQueryRetry } from "@/shared/lib/http/queryRetryPolicy";

const maxHttpRetries = import.meta.env.DEV ? 0 : 2;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        const decision = decideHttpQueryRetry({
          failureCount,
          error,
          maxRetries: maxHttpRetries
        });
        return decision.allowRetry;
      },
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
