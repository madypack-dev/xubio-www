import type { ListasPrecioRepository } from "../domain";
import { API_ENDPOINTS } from "@/shared/config/apiEndpoints";
import { MOCK_LISTAS_PRECIO } from "@/shared/config/mockData";
import {
  cloneMockData,
  fetchLegacyList
} from "@/shared/lib/http/legacyRepository";
import { logApiError } from "@/shared/lib/http/httpErrorSummary";
import { toListaPrecioDomain } from "./listasPrecio.mapper";
import { listaPrecioDtoSchema } from "./listasPrecio.schemas";

export function createListasPrecioHttpRepository(
  baseUrl = ""
): ListasPrecioRepository {
  return {
    async list() {
      try {
        return await fetchLegacyList({
          baseUrl,
          endpoint: API_ENDPOINTS.listaPrecios,
          schema: listaPrecioDtoSchema,
          context: "listasPrecio.list",
          transform: (dtos) => dtos.map(toListaPrecioDomain)
        });
      } catch (error) {
        logApiError("Fallo listasPrecio.repository.list", error, "error");
        throw error;
      }
    }
  };
}

export function createListasPrecioMockRepository(): ListasPrecioRepository {
  return {
    async list() {
      return cloneMockData(MOCK_LISTAS_PRECIO);
    }
  };
}
