import type { ProductosRepository } from "../domain";
import { API_ENDPOINTS } from "@/shared/config/apiEndpoints";
import { MOCK_PRODUCTOS } from "@/shared/config/mockData";
import {
  cloneMockData,
  fetchLegacyList,
  fetchLegacyByIdOrNull,
  getMockRecordByIdOrNull
} from "@/shared/lib/http/legacyRepository";
import { toProductoDomain } from "./productos.mapper";
import { productoDtoSchema } from "./productos.schemas";

export function createProductosHttpRepository(
  baseUrlOrBaseUrls: string | readonly string[] = ""
): ProductosRepository {
  const baseUrls = Array.isArray(baseUrlOrBaseUrls) ? baseUrlOrBaseUrls : [baseUrlOrBaseUrls];

  return {
    async list() {
      return fetchLegacyList({
        baseUrls,
        endpoint: API_ENDPOINTS.productos,
        schema: productoDtoSchema,
        context: "productos.list",
        transform: (dtos) => dtos.map((dto) => toProductoDomain(dto))
      });
    },
    async getById(productoId) {
      return fetchLegacyByIdOrNull({
        baseUrls,
        endpoint: API_ENDPOINTS.productos,
        id: productoId,
        schema: productoDtoSchema,
        context: "productos.getById",
        map: toProductoDomain,
        notFound: {
          message: "[MVP] Producto no encontrado",
          meta: { productoId }
        }
      });
    }
  };
}

export function createProductosMockRepository(): ProductosRepository {
  return {
    async list() {
      return cloneMockData(Object.values(MOCK_PRODUCTOS));
    },
    async getById(productoId) {
      return getMockRecordByIdOrNull({
        record: MOCK_PRODUCTOS,
        id: productoId,
        notFound: {
          message: "[MVP] Producto no encontrado en mock",
          meta: { productoId }
        }
      });
    }
  };
}
