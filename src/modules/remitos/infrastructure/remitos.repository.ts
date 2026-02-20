import type { RemitosRepository } from "../domain";
import { API_ENDPOINTS } from "@/shared/config/apiEndpoints";
import { MOCK_REMITOS } from "@/shared/config/mockData";
import {
  cloneMockData,
  fetchLegacyList
} from "@/shared/lib/http/legacyRepository";
import { logApiError } from "@/shared/lib/http/httpErrorSummary";
import { toRemitosDomain } from "./remitos.mapper";
import { remitoDtoSchema } from "./remitos.schemas";

export function createRemitosHttpRepository(
  baseUrl = ""
): RemitosRepository {
  return {
    async list() {
      try {
        const remitos = await fetchLegacyList({
          baseUrl,
          endpoint: API_ENDPOINTS.remitos,
          schema: remitoDtoSchema,
          context: "remitos.list",
          transform: toRemitosDomain
        });

        return remitos;
      } catch (error) {
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
