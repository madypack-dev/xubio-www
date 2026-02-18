import type { RemitosRepository } from "../domain";
import { API_ENDPOINTS } from "@/shared/config/apiEndpoints";
import { MOCK_REMITOS } from "@/shared/config/mockData";
import {
  cloneMockData,
  fetchLegacyList
} from "@/shared/lib/http/legacyRepository";
import { buildHttpErrorLogContext } from "@/shared/lib/http/httpErrorDiagnostics";
import { logApiError } from "@/shared/lib/http/httpErrorSummary";
import { toRemitosDomain } from "./remitos.mapper";
import { remitoDtoSchema } from "./remitos.schemas";

export function createRemitosHttpRepository(
  baseUrl = ""
): RemitosRepository {
  return {
    async list() {
      console.log("[MVP] Iniciando remitos.repository.list", {
        baseUrl,
        endpoint: API_ENDPOINTS.remitos
      });

      try {
        const remitos = await fetchLegacyList({
          baseUrl,
          endpoint: API_ENDPOINTS.remitos,
          schema: remitoDtoSchema,
          context: "remitos.list",
          transform: toRemitosDomain
        });

        console.log("[MVP] remitos.repository.list OK", {
          total: remitos.length,
          endpoint: API_ENDPOINTS.remitos
        });

        return remitos;
      } catch (error) {
        console.warn("[MVP] Diagnostico remitos.repository.list", {
          ...buildHttpErrorLogContext(error),
          endpoint: API_ENDPOINTS.remitos
        });
        logApiError("Fallo remitos.repository.list", error, "error");
        throw error;
      }
    }
  };
}

export function createRemitosMockRepository(): RemitosRepository {
  return {
    async list() {
      return cloneMockData(MOCK_REMITOS);
    }
  };
}
