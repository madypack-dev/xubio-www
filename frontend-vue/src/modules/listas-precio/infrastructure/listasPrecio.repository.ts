import type { ListasPrecioRepository } from "../domain";
import { API_ENDPOINTS } from "@/shared/config/apiEndpoints";
import { MOCK_LISTAS_PRECIO } from "@/shared/config/mockData";
import { parseListItems } from "@/shared/lib/acl/legacyPayload";
import { httpClient } from "@/shared/lib/http/httpClient";
import { toListaPrecioDomain } from "./listasPrecio.mapper";
import { listaPrecioDtoSchema } from "./listasPrecio.schemas";

export function createListasPrecioHttpRepository(
  baseUrl = ""
): ListasPrecioRepository {
  return {
    async list() {
      const payload = await httpClient.get<unknown>(
        `${baseUrl}${API_ENDPOINTS.listaPrecios}`
      );
      const dtos = parseListItems(listaPrecioDtoSchema, payload, "listasPrecio.list");
      return dtos.map(toListaPrecioDomain);
    }
  };
}

export function createListasPrecioMockRepository(): ListasPrecioRepository {
  return {
    async list() {
      return JSON.parse(JSON.stringify(MOCK_LISTAS_PRECIO));
    }
  };
}
