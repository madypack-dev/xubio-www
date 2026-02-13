import type { ClientesRepository } from "../domain";
import { API_ENDPOINTS } from "@/shared/config/apiEndpoints";
import { MOCK_CLIENTES } from "@/shared/config/mockData";
import { parseSinglePayload } from "@/shared/lib/acl/legacyPayload";
import {
  HttpClientError,
  httpClient
} from "@/shared/lib/http/httpClient";
import { toClienteDomain } from "./clientes.mapper";
import { clienteDtoSchema } from "./clientes.schemas";

export function createClientesHttpRepository(
  baseUrl = ""
): ClientesRepository {
  return {
    async getById(clienteId) {
      const safeClienteId = encodeURIComponent(String(clienteId));
      const endpoint = `${baseUrl}${API_ENDPOINTS.clientes}/${safeClienteId}`;

      try {
        const payload = await httpClient.get<unknown>(endpoint);
        const dto = parseSinglePayload(clienteDtoSchema, payload, "clientes.getById");
        return toClienteDomain(dto);
      } catch (error) {
        if (error instanceof HttpClientError && error.status === 404) {
          console.warn("[MVP] Cliente no encontrado", { clienteId });
          return null;
        }
        throw error;
      }
    }
  };
}

export function createClientesMockRepository(): ClientesRepository {
  return {
    async getById(clienteId) {
      const key = String(clienteId);
      if (!(key in MOCK_CLIENTES)) {
        console.warn("[MVP] Cliente no encontrado en mock", { clienteId });
        return null;
      }
      return JSON.parse(JSON.stringify(MOCK_CLIENTES[key]));
    }
  };
}
