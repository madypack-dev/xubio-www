import type { ComprobantesRepository } from "../domain";
import { API_ENDPOINTS } from "@/shared/config/apiEndpoints";
import { MOCK_COMPROBANTES } from "@/shared/config/mockData";
import {
  cloneMockData,
  fetchLegacyByIdOrNull,
  fetchLegacyList,
  getMockByIdOrNull
} from "@/shared/lib/http/legacyRepository";
import { toComprobanteDomain, toComprobantesDomain } from "./comprobantes.mapper";
import { comprobanteDtoSchema } from "./comprobantes.schemas";

export function createComprobantesHttpRepository(
  baseUrl = ""
): ComprobantesRepository {
  return {
    async list() {
      return fetchLegacyList({
        baseUrl,
        endpoint: API_ENDPOINTS.comprobantesVenta,
        schema: comprobanteDtoSchema,
        context: "comprobantes.list",
        transform: toComprobantesDomain
      });
    },
    async getById(comprobanteVentaId) {
      return fetchLegacyByIdOrNull({
        baseUrl,
        endpoint: API_ENDPOINTS.comprobantesVenta,
        id: comprobanteVentaId,
        schema: comprobanteDtoSchema,
        context: "comprobantes.getById",
        map: toComprobanteDomain,
        notFound: {
          message: "[MVP] Comprobante no encontrado",
          meta: { comprobanteVentaId }
        }
      });
    }
  };
}

export function createComprobantesMockRepository(): ComprobantesRepository {
  return {
    async list() {
      return cloneMockData(MOCK_COMPROBANTES);
    },
    async getById(comprobanteVentaId) {
      return getMockByIdOrNull({
        collection: MOCK_COMPROBANTES,
        id: comprobanteVentaId,
        resolveItemId: (comprobante) => comprobante.comprobanteVentaId,
        notFound: {
          message: "[MVP] Comprobante no encontrado en mock",
          meta: { comprobanteVentaId }
        }
      });
    }
  };
}
