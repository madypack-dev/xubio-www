import type { ProductosRepository } from "../domain";
import { API_ENDPOINTS } from "@/shared/config/apiEndpoints";
import { MOCK_PRODUCTOS } from "@/shared/config/mockData";
import { parseSinglePayload } from "@/shared/lib/acl/legacyPayload";
import {
  HttpClientError,
  httpClient
} from "@/shared/lib/http/httpClient";
import { toProductoDomain } from "./productos.mapper";
import { productoDtoSchema } from "./productos.schemas";

export function createProductosHttpRepository(
  baseUrl = ""
): ProductosRepository {
  return {
    async getById(productoId) {
      const safeProductoId = encodeURIComponent(String(productoId));
      const endpoint = `${baseUrl}${API_ENDPOINTS.productos}/${safeProductoId}`;

      try {
        const payload = await httpClient.get<unknown>(endpoint);
        const dto = parseSinglePayload(productoDtoSchema, payload, "productos.getById");
        return toProductoDomain(dto);
      } catch (error) {
        if (error instanceof HttpClientError && error.status === 404) {
          console.warn("[MVP] Producto no encontrado", { productoId });
          return null;
        }
        throw error;
      }
    }
  };
}

export function createProductosMockRepository(): ProductosRepository {
  return {
    async getById(productoId) {
      const key = String(productoId);
      if (!(key in MOCK_PRODUCTOS)) {
        console.warn("[MVP] Producto no encontrado en mock", { productoId });
        return null;
      }
      return JSON.parse(JSON.stringify(MOCK_PRODUCTOS[key]));
    }
  };
}
