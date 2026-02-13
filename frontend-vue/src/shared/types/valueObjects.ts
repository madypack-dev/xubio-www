import { parseLegacyDateToTimestamp } from "@/shared/lib/date/legacyDate";

export type TransaccionId = string;
export type ClienteId = string;
export type ProductoId = string;
export type FechaComercial = string;
export type Money = number;

function normalizeString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized ? normalized : null;
}

export function toTransaccionId(value: unknown): TransaccionId | null {
  return normalizeString(value);
}

export function toClienteId(value: unknown): ClienteId | null {
  return normalizeString(value);
}

export function toProductoId(value: unknown): ProductoId | null {
  return normalizeString(value);
}

export function toFechaComercial(value: unknown): FechaComercial | null {
  const normalized = normalizeString(value);
  if (!normalized) {
    return null;
  }

  const timestamp = parseLegacyDateToTimestamp(normalized);
  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return normalized;
}

export function toMoney(value: unknown): Money | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
