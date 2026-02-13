import type { z } from "zod";
import { parseListItems, parseSinglePayload } from "@/shared/lib/acl/legacyPayload";
import { HttpClientError, httpClient } from "./httpClient";

type EntityId = string | number;

type NotFoundLog = {
  message: string;
  meta: Record<string, unknown>;
};

function buildUrl(baseUrl: string, endpoint: string) {
  return `${baseUrl}${endpoint}`;
}

function logNotFound({ message, meta }: NotFoundLog) {
  console.warn(message, meta);
}

export async function fetchLegacyList<TDto, TResult>({
  baseUrl = "",
  endpoint,
  schema,
  context,
  transform
}: {
  baseUrl?: string;
  endpoint: string;
  schema: z.ZodType<TDto>;
  context: string;
  transform: (dtos: TDto[]) => TResult;
}): Promise<TResult> {
  const payload = await httpClient.get<unknown>(buildUrl(baseUrl, endpoint));
  const dtos = parseListItems(schema, payload, context);
  return transform(dtos);
}

export async function fetchLegacyByIdOrNull<TDto, TResult>({
  baseUrl = "",
  endpoint,
  id,
  schema,
  context,
  map,
  notFound
}: {
  baseUrl?: string;
  endpoint: string;
  id: EntityId;
  schema: z.ZodType<TDto>;
  context: string;
  map: (dto: TDto) => TResult;
  notFound: NotFoundLog;
}): Promise<TResult | null> {
  const safeId = encodeURIComponent(String(id));
  const url = `${buildUrl(baseUrl, endpoint)}/${safeId}`;

  try {
    const payload = await httpClient.get<unknown>(url);
    const dto = parseSinglePayload(schema, payload, context);
    return map(dto);
  } catch (error) {
    if (error instanceof HttpClientError && error.status === 404) {
      logNotFound(notFound);
      return null;
    }
    throw error;
  }
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
