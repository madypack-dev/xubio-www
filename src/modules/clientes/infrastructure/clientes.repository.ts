import type { ClientesRepository } from "../domain";
import { API_ENDPOINTS } from "@/shared/config/apiEndpoints";
import { MOCK_CLIENTES } from "@/shared/config/mockData";
import {
  cloneMockData,
  fetchLegacyList,
  fetchLegacyByIdOrNull,
  getMockRecordByIdOrNull
} from "@/shared/lib/http/legacyRepository";
import { toClienteDomain } from "./clientes.mapper";
import { clienteDtoSchema } from "./clientes.schemas";

export function createClientesHttpRepository(
  baseUrlOrBaseUrls: string | readonly string[] = ""
): ClientesRepository {
  const baseUrls = Array.isArray(baseUrlOrBaseUrls) ? baseUrlOrBaseUrls : [baseUrlOrBaseUrls];

  return {
    async list() {
      return fetchLegacyList({
        baseUrls,
        endpoint: API_ENDPOINTS.clientes,
        schema: clienteDtoSchema,
        context: "clientes.list",
        transform: (dtos) => dtos.map((dto) => toClienteDomain(dto))
      });
    },
    async getById(clienteId) {
      return fetchLegacyByIdOrNull({
        baseUrls,
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
    }
  };
}

export function createClientesMockRepository(): ClientesRepository {
  return {
    async list() {
      return cloneMockData(Object.values(MOCK_CLIENTES));
    },
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
