function normalizeSpaces(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function parseLegacyDateToTimestamp(value: string | null): number {
  if (!value) {
    return Number.NEGATIVE_INFINITY;
  }

  const normalized = normalizeSpaces(value);
  const native = Date.parse(normalized);
  if (Number.isFinite(native)) {
    return native;
  }

  const slashDateMatch = normalized.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/
  );
  if (!slashDateMatch) {
    return Number.NEGATIVE_INFINITY;
  }

  const day = Number(slashDateMatch[1]);
  const month = Number(slashDateMatch[2]);
  const year = Number(slashDateMatch[3]);
  const hours = Number(slashDateMatch[4] ?? 0);
  const minutes = Number(slashDateMatch[5] ?? 0);
  const seconds = Number(slashDateMatch[6] ?? 0);

  return Date.UTC(year, month - 1, day, hours, minutes, seconds);
}
