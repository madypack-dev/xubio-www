import type { RemitosRepository } from "../domain";
import { API_ENDPOINTS } from "@/shared/config/apiEndpoints";
import { MOCK_REMITOS } from "@/shared/config/mockData";
import { httpClient } from "@/shared/lib/http/httpClient";
import { parseListItems } from "@/shared/lib/acl/legacyPayload";
import { toRemitosDomain } from "./remitos.mapper";
import { remitoDtoSchema } from "./remitos.schemas";

export function createRemitosHttpRepository(
  baseUrl = ""
): RemitosRepository {
  return {
    async list() {
      const payload = await httpClient.get<unknown>(
        `${baseUrl}${API_ENDPOINTS.remitos}`
      );
      const dtos = parseListItems(remitoDtoSchema, payload, "remitos.list");
      return toRemitosDomain(dtos);
    }
  };
}

export function createRemitosMockRepository(): RemitosRepository {
  return {
    async list() {
      return JSON.parse(JSON.stringify(MOCK_REMITOS));
    }
  };
}
