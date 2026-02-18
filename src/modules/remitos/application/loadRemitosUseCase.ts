import type { RemitosRepository } from "../domain";
import { buildHttpErrorLogContext, diagnoseHttpError } from "@/shared/lib/http/httpErrorDiagnostics";
import { logApiError } from "@/shared/lib/http/httpErrorSummary";

export function createLoadRemitosUseCase(remitosRepository: RemitosRepository) {
  return async function loadRemitos() {
    console.log("[MVP] Iniciando remitos.loadRemitosUseCase");

    try {
      const remitos = await remitosRepository.list();
      console.log("[MVP] remitos.loadRemitosUseCase OK", {
        total: remitos.length
      });
      return remitos;
    } catch (error) {
      const diagnosis = diagnoseHttpError(error);
      console.warn("[MVP] Diagnostico remitos.loadRemitosUseCase", {
        ...buildHttpErrorLogContext(error),
        nextAction: diagnosis.retryable
          ? "reintentar por politica de query"
          : "frenar retry y revisar backend/ngrok"
      });
      logApiError("Error al cargar remitos desde backend", error, "error");
      throw error;
    }
  };
}
