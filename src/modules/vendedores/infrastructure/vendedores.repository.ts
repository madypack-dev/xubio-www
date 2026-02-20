import type { VendedoresRepository } from "../domain";
import { API_ENDPOINTS } from "@/shared/config/apiEndpoints";
import { MOCK_VENDEDORES } from "@/shared/config/mockData";
import {
  fetchLegacyByIdOrNull,
  getMockRecordByIdOrNull
} from "@/shared/lib/http/legacyRepository";
import { toVendedorDomain } from "./vendedores.mapper";
import { vendedorDtoSchema } from "./vendedores.schemas";

export function createVendedoresHttpRepository(
  baseUrl = ""
): VendedoresRepository {
  return {
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
