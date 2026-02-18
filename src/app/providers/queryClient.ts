import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import {
  decideHttpQueryRetry,
  logHttpQueryRetryDecision
} from "@/shared/lib/http/queryRetryPolicy";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        const decision = decideHttpQueryRetry({ failureCount, error, maxRetries: 2 });
        logHttpQueryRetryDecision(failureCount, decision);
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
