import type { ClientesRepository } from "../domain";
import { API_ENDPOINTS } from "@/shared/config/apiEndpoints";
import { MOCK_CLIENTES } from "@/shared/config/mockData";
import {
  fetchLegacyByIdOrNull,
  getMockRecordByIdOrNull
} from "@/shared/lib/http/legacyRepository";
import { logApiError } from "@/shared/lib/http/httpErrorSummary";
import { toClienteDomain } from "./clientes.mapper";
import { clienteDtoSchema } from "./clientes.schemas";

export function createClientesHttpRepository(
  baseUrl = ""
): ClientesRepository {
  return {
    async getById(clienteId) {
      try {
        return await fetchLegacyByIdOrNull({
          baseUrl,
          endpoint: API_ENDPOINTS.clientes,
          id: clienteId,
          schema: clienteDtoSchema,
          context: "clientes.getById",
          map: toClienteDomain,
          notFound: {
            message: "[MVP] Cliente no encontrado",
            meta: { clienteId }
          }
        });
      } catch (error) {
        logApiError("Fallo clientes.repository.getById", error, "error");
        throw error;
      }
    }
  };
}

export function createClientesMockRepository(): ClientesRepository {
  return {
    async getById(clienteId) {
      return getMockRecordByIdOrNull({
        record: MOCK_CLIENTES,
        id: clienteId,
        notFound: {
          message: "[MVP] Cliente no encontrado en mock",
          meta: { clienteId }
        }
      });
    }
  };
}
