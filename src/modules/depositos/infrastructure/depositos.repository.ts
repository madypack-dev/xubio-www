import type { DepositosRepository } from "../domain";
import { API_ENDPOINTS } from "@/shared/config/apiEndpoints";
import { fetchLegacyList } from "@/shared/lib/http/legacyRepository";
import { depositoDtoSchema } from "./depositos.schemas";
import { toDepositoDomain } from "./depositos.mapper";

export function createDepositosHttpRepository(
  baseUrlOrBaseUrls: string | readonly string[] = ""
): DepositosRepository {
  const baseUrls = Array.isArray(baseUrlOrBaseUrls) ? baseUrlOrBaseUrls : [baseUrlOrBaseUrls];

  return {
    async list() {
      return fetchLegacyList({
        baseUrls,
        endpoint: API_ENDPOINTS.depositos,
        schema: depositoDtoSchema,
        context: "depositos.list",
        transform: (dtos) => dtos.map((dto) => toDepositoDomain(dto))
      });
    }
  };
}
