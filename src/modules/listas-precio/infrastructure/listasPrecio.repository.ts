import type { ListasPrecioRepository } from "../domain";
import { API_ENDPOINTS } from "@/shared/config/apiEndpoints";
import { MOCK_LISTAS_PRECIO } from "@/shared/config/mockData";
import {
  cloneMockData,
  fetchLegacyList
} from "@/shared/lib/http/legacyRepository";
import { toListaPrecioDomain } from "./listasPrecio.mapper";
import { listaPrecioDtoSchema } from "./listasPrecio.schemas";

export function createListasPrecioHttpRepository(
  baseUrlOrBaseUrls: string | readonly string[] = ""
): ListasPrecioRepository {
  const baseUrls = Array.isArray(baseUrlOrBaseUrls) ? baseUrlOrBaseUrls : [baseUrlOrBaseUrls];

  return {
    async list() {
      return fetchLegacyList({
        baseUrls,
        endpoint: API_ENDPOINTS.listaPrecios,
        schema: listaPrecioDtoSchema,
        context: "listasPrecio.list",
        transform: (dtos) => dtos.map(toListaPrecioDomain)
      });
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
