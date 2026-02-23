const MONEY_FORMATTER = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: true
});

export function formatMoney(value: unknown): string {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return "-";
    }
    return MONEY_FORMATTER.format(value);
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    if (!normalized) {
      return "-";
    }
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) {
      return normalized;
    }
    return MONEY_FORMATTER.format(parsed);
  }

  return "-";
}

