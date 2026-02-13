import { z } from "zod";
import { RuntimeValidationError } from "./runtimeValidationError";

const listEnvelopeSchema = z.object({
  items: z.array(z.unknown())
});

function parseListPayload(input: unknown, context: string): unknown[] {
  if (Array.isArray(input)) {
    return input;
  }

  const parsed = listEnvelopeSchema.safeParse(input);
  if (parsed.success) {
    return parsed.data.items;
  }

  throw new RuntimeValidationError(context, parsed.error);
}

export function parseSinglePayload<T>(
  schema: z.ZodType<T>,
  input: unknown,
  context: string
): T {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new RuntimeValidationError(context, parsed.error);
  }
  return parsed.data;
}

export function parseListItems<T>(
  schema: z.ZodType<T>,
  input: unknown,
  context: string
): T[] {
  const items = parseListPayload(input, context);
  return items.map((item, index) => parseSinglePayload(schema, item, `${context}[${index}]`));
}

export function pickFirstDefined<T>(
  ...values: Array<T | null | undefined>
): T | null {
  for (const value of values) {
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return null;
}

export function asStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const normalized = String(value).trim();
  return normalized ? normalized : null;
}

export function asNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export function asBooleanOrNull(value: unknown): boolean | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    if (value === 1) {
      return true;
    }
    if (value === 0) {
      return false;
    }
    return null;
  }
  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "si", "yes"].includes(normalized)) {
    return true;
  }
  if (["false", "0", "no"].includes(normalized)) {
    return false;
  }
  return null;
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}
