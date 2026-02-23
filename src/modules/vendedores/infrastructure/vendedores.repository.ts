import type { VendedoresRepository } from "../domain";
import { API_ENDPOINTS } from "@/shared/config/apiEndpoints";
import { MOCK_VENDEDORES } from "@/shared/config/mockData";
import {
  cloneMockData,
  fetchLegacyList,
  fetchLegacyByIdOrNull,
  getMockRecordByIdOrNull
} from "@/shared/lib/http/legacyRepository";
import { toVendedorDomain } from "./vendedores.mapper";
import { vendedorDtoSchema } from "./vendedores.schemas";

export function createVendedoresHttpRepository(
  baseUrl = ""
): VendedoresRepository {
  return {
    async list() {
      return fetchLegacyList({
        baseUrl,
        endpoint: API_ENDPOINTS.vendedores,
        schema: vendedorDtoSchema,
        context: "vendedores.list",
        transform: (dtos) => dtos.map((dto) => toVendedorDomain(dto))
      });
    },
    async getById(vendedorId) {
      return fetchLegacyByIdOrNull({
        baseUrl,
        endpoint: API_ENDPOINTS.vendedores,
        id: vendedorId,
        schema: vendedorDtoSchema,
        context: "vendedores.getById",
        map: toVendedorDomain,
        notFound: {
          message: "[MVP] Vendedor no encontrado",
          meta: { vendedorId }
        }
      });
    }
  };
}

export function createVendedoresMockRepository(): VendedoresRepository {
  return {
    async list() {
      return cloneMockData(Object.values(MOCK_VENDEDORES));
    },
    async getById(vendedorId) {
      return getMockRecordByIdOrNull({
        record: MOCK_VENDEDORES,
        id: vendedorId,
        notFound: {
          message: "[MVP] Vendedor no encontrado en mock",
          meta: { vendedorId }
        }
      });
    }
  };
}
