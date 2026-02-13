import type { ComprobantesRepository } from "../domain";
import { API_ENDPOINTS } from "@/shared/config/apiEndpoints";
import { MOCK_COMPROBANTES } from "@/shared/config/mockData";
import { parseListItems, parseSinglePayload } from "@/shared/lib/acl/legacyPayload";
import {
  HttpClientError,
  httpClient
} from "@/shared/lib/http/httpClient";
import { toComprobanteDomain, toComprobantesDomain } from "./comprobantes.mapper";
import { comprobanteDtoSchema } from "./comprobantes.schemas";

export function createComprobantesHttpRepository(
  baseUrl = ""
): ComprobantesRepository {
  return {
    async list() {
      const payload = await httpClient.get<unknown>(
        `${baseUrl}${API_ENDPOINTS.comprobantesVenta}`
      );
      const dtos = parseListItems(comprobanteDtoSchema, payload, "comprobantes.list");
      return toComprobantesDomain(dtos);
    },
    async getById(comprobanteVentaId) {
      const safeId = encodeURIComponent(String(comprobanteVentaId));
      const endpoint = `${baseUrl}${API_ENDPOINTS.comprobantesVenta}/${safeId}`;

      try {
        const payload = await httpClient.get<unknown>(endpoint);
        const dto = parseSinglePayload(
          comprobanteDtoSchema,
          payload,
          "comprobantes.getById"
        );
        return toComprobanteDomain(dto);
      } catch (error) {
        if (error instanceof HttpClientError && error.status === 404) {
          console.warn("[MVP] Comprobante no encontrado", { comprobanteVentaId });
          return null;
        }
        throw error;
      }
    }
  };
}

export function createComprobantesMockRepository(): ComprobantesRepository {
  return {
    async list() {
      return JSON.parse(JSON.stringify(MOCK_COMPROBANTES));
    },
    async getById(comprobanteVentaId) {
      const key = String(comprobanteVentaId);
      const found =
        MOCK_COMPROBANTES.find(
          (comprobante) => String(comprobante.comprobanteVentaId) === key
        ) ?? null;
      if (!found) {
        console.warn("[MVP] Comprobante no encontrado en mock", { comprobanteVentaId });
        return null;
      }
      return JSON.parse(JSON.stringify(found));
    }
  };
}
