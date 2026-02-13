import type { ProductosRepository } from "../domain";
import { API_ENDPOINTS } from "@/shared/config/apiEndpoints";
import { MOCK_PRODUCTOS } from "@/shared/config/mockData";
import {
  fetchLegacyByIdOrNull,
  getMockRecordByIdOrNull
} from "@/shared/lib/http/legacyRepository";
import { logApiError } from "@/shared/lib/http/httpErrorSummary";
import { toProductoDomain } from "./productos.mapper";
import { productoDtoSchema } from "./productos.schemas";

export function createProductosHttpRepository(
  baseUrl = ""
): ProductosRepository {
  return {
    async getById(productoId) {
      try {
        return await fetchLegacyByIdOrNull({
          baseUrl,
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
      } catch (error) {
        logApiError("Fallo productos.repository.getById", error, "error");
        throw error;
      }
    }
  };
}

export function createProductosMockRepository(): ProductosRepository {
  return {
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
