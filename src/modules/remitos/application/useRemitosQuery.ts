import { useQuery } from "@tanstack/vue-query";
import type { RemitosRepository } from "../domain";
import { logApiError } from "@/shared/lib/http/httpErrorSummary";
import { queryKeys } from "@/shared/lib/queryKeys";
import { buildHttpErrorLogContext, diagnoseHttpError } from "@/shared/lib/http/httpErrorDiagnostics";

export function useRemitosQuery(remitosRepository: RemitosRepository) {
  return useQuery({
    queryKey: queryKeys.remitos(),
    queryFn: async () => {
      try {
        console.log("[MVP] Iniciando remitos.queryFn");
        return await remitosRepository.list();
      } catch (error) {
        const diagnosis = diagnoseHttpError(error);
        console.warn("[MVP] Diagnostico remitos.queryFn", {
          ...buildHttpErrorLogContext(error),
          nextAction: diagnosis.retryable
            ? "reintentar por politica de query"
            : "frenar retry y revisar backend/ngrok"
        });
        logApiError("Error al cargar remitos desde backend", error, "error");
        throw error;
      }
    }
  });
}
