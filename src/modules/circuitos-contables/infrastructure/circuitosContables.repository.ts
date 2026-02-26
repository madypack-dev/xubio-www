import type { CircuitosContablesRepository } from "../domain";
import { API_ENDPOINTS } from "@/shared/config/apiEndpoints";
import { fetchLegacyList } from "@/shared/lib/http/legacyRepository";
import { circuitoContableDtoSchema } from "./circuitosContables.schemas";
import { toCircuitoContableDomain } from "./circuitosContables.mapper";

export function createCircuitosContablesHttpRepository(
  baseUrlOrBaseUrls: string | readonly string[] = ""
): CircuitosContablesRepository {
  const baseUrls = Array.isArray(baseUrlOrBaseUrls) ? baseUrlOrBaseUrls : [baseUrlOrBaseUrls];

  return {
    async list() {
      return fetchLegacyList({
        baseUrls,
        endpoint: API_ENDPOINTS.circuitosContables,
        schema: circuitoContableDtoSchema,
        context: "circuitosContables.list",
        transform: (dtos) => dtos.map((dto) => toCircuitoContableDomain(dto))
      });
    }
  };
}
