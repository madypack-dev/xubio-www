import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { diagnoseHttpError } from "@/shared/lib/http/httpErrorDiagnostics";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        const diagnosis = diagnoseHttpError(error);
        const allowRetry = diagnosis.retryable && failureCount < 2;

        if (!allowRetry) {
          console.warn("[MVP] Retry deshabilitado por diagnostico HTTP", {
            failureCount,
            kind: diagnosis.kind,
            status: diagnosis.status ?? null,
            url: diagnosis.url ?? null,
            ngrokErrorCode: diagnosis.ngrokErrorCode ?? null
          });
        } else {
          console.log("[MVP] Retry habilitado por diagnostico HTTP", {
            failureCount,
            kind: diagnosis.kind,
            status: diagnosis.status ?? null
          });
        }

        return allowRetry;
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
