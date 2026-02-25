import type { z } from "zod";
import { parseListItems, parseSinglePayload } from "@/shared/lib/acl/legacyPayload";
import { logApiError } from "./httpErrorSummary";
import {
  HttpClientError,
  HttpNetworkError,
  HttpTimeoutError,
  httpClient
} from "./httpClient";

type EntityId = string | number;

type NotFoundLog = {
  message: string;
  meta: Record<string, unknown>;
};

function buildUrl(baseUrl: string, endpoint: string) {
  if (!baseUrl) {
    return endpoint;
  }

  const normalizedBaseUrl = baseUrl.replace(/\/+$/g, "");
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  return `${normalizedBaseUrl}${normalizedEndpoint}`;
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.trim().replace(/\/+$/g, "");
}

export function buildCandidateBaseUrls({
  baseUrl = "",
  baseUrls = []
}: {
  baseUrl?: string;
  baseUrls?: readonly string[];
}) {
  const candidates = (baseUrls.length > 0 ? baseUrls : [baseUrl]).map((entry) =>
    normalizeBaseUrl(entry)
  );
  const deduped: string[] = [];
  const seen = new Set<string>();

  for (const candidate of candidates) {
    if (seen.has(candidate)) {
      continue;
    }
    seen.add(candidate);
    deduped.push(candidate);
  }

  return deduped.length > 0 ? deduped : [""];
}

export function shouldFallback(error: unknown) {
  if (error instanceof HttpNetworkError || error instanceof HttpTimeoutError) {
    return true;
  }

  if (error instanceof HttpClientError) {
    return error.status >= 500 || error.status === 429;
  }

  return false;
}

function logFallbackAttempt({
  context,
  failedUrl,
  attempt,
  total,
  error
}: {
  context: string;
  failedUrl: string;
  attempt: number;
  total: number;
  error: unknown;
}) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[MVP] ${context}: fallback al siguiente backend`, {
    failedUrl,
    attempt,
    total,
    reason: message
  });
}

function logNotFound({ message, meta }: NotFoundLog) {
  console.warn(message, meta);
}

export async function fetchLegacyList<TDto, TResult>({
  baseUrl = "",
  baseUrls = [],
  endpoint,
  schema,
  context,
  transform
}: {
  baseUrl?: string;
  baseUrls?: readonly string[];
  endpoint: string;
  schema: z.ZodType<TDto>;
  context: string;
  transform: (dtos: TDto[]) => TResult;
}): Promise<TResult> {
  const candidates = buildCandidateBaseUrls({ baseUrl, baseUrls });
  let lastError: unknown;

  for (const [index, candidateBaseUrl] of candidates.entries()) {
    const requestUrl = buildUrl(candidateBaseUrl, endpoint);
    try {
      const payload = await httpClient.get<unknown>(requestUrl);
      const dtos = parseListItems(schema, payload, context);
      return transform(dtos);
    } catch (error) {
      lastError = error;
      const hasNext = index < candidates.length - 1;
      if (!hasNext || !shouldFallback(error)) {
        break;
      }
      logFallbackAttempt({
        context,
        failedUrl: requestUrl,
        attempt: index + 1,
        total: candidates.length,
        error
      });
    }
  }

  logApiError(`Fallo ${context} en fetchLegacyList`, lastError, "error");
  throw lastError;
}

export async function fetchLegacyByIdOrNull<TDto, TResult>({
  baseUrl = "",
  baseUrls = [],
  endpoint,
  id,
  schema,
  context,
  map,
  notFound
}: {
  baseUrl?: string;
  baseUrls?: readonly string[];
  endpoint: string;
  id: EntityId;
  schema: z.ZodType<TDto>;
  context: string;
  map: (dto: TDto) => TResult;
  notFound: NotFoundLog;
}): Promise<TResult | null> {
  const safeId = encodeURIComponent(String(id));
  const candidates = buildCandidateBaseUrls({ baseUrl, baseUrls });
  let lastError: unknown;

  for (const [index, candidateBaseUrl] of candidates.entries()) {
    const url = `${buildUrl(candidateBaseUrl, endpoint)}/${safeId}`;
    try {
      const payload = await httpClient.get<unknown>(url);
      const dto = parseSinglePayload(schema, payload, context);
      return map(dto);
    } catch (error) {
      if (error instanceof HttpClientError && error.status === 404) {
        logNotFound(notFound);
        return null;
      }
      lastError = error;
      const hasNext = index < candidates.length - 1;
      if (!hasNext || !shouldFallback(error)) {
        break;
      }
      logFallbackAttempt({
        context,
        failedUrl: url,
        attempt: index + 1,
        total: candidates.length,
        error
      });
    }
  }

  logApiError(`Fallo ${context} en fetchLegacyByIdOrNull`, lastError, "error");
  throw lastError;
}

export function cloneMockData<T>(input: T): T {
  return JSON.parse(JSON.stringify(input)) as T;
}

export function getMockByIdOrNull<T>({
  collection,
  id,
  resolveItemId,
  notFound
}: {
  collection: readonly T[];
  id: EntityId;
  resolveItemId: (item: T) => string | number | null | undefined;
  notFound: NotFoundLog;
}): T | null {
  const normalizedId = String(id);
  const found =
    collection.find((item) => String(resolveItemId(item) ?? "") === normalizedId) ?? null;

  if (!found) {
    logNotFound(notFound);
    return null;
  }

  return cloneMockData(found);
}

export function getMockRecordByIdOrNull<T>({
  record,
  id,
  notFound
}: {
  record: Record<string, T>;
  id: EntityId;
  notFound: NotFoundLog;
}): T | null {
  const key = String(id);
  if (!(key in record)) {
    logNotFound(notFound);
    return null;
  }

  return cloneMockData(record[key]);
}
