import type { Remito, RemitoItem } from "../domain";

export function rowKey(remito: Remito) {
  return String(remito.transaccionId ?? `${remito.numeroRemito}-${remito.fecha ?? ""}`);
}

export function itemRowKey(item: RemitoItem) {
  return String(item.transaccionCVItemId ?? `${item.transaccionId ?? ""}-${item.productoId ?? ""}`);
}

export function buildSelectRemitoIdLabel(transaccionId: string | null) {
  if (!transaccionId) {
    return "Seleccionar remito";
  }
  return `Seleccionar remito ${transaccionId}`;
}

export function buildGoToClienteLabel(clienteId: string | null) {
  if (!clienteId) {
    return "Abrir cliente";
  }
  return `Abrir cliente ${clienteId}`;
}

export function buildGoToVendedorLabel(vendedorId: string | null) {
  if (!vendedorId) {
    return "Abrir vendedor";
  }
  return `Abrir vendedor ${vendedorId}`;
}

export function buildGoToProductoLabel(productoId: string | null) {
  if (!productoId) {
    return "Abrir producto";
  }
  return `Abrir producto ${productoId}`;
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function formatDateDdMmYyyy(value: string | null): string {
  if (!value) {
    return "-";
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return "-";
  }

  const isoDateMatch = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ].*)?$/);
  if (isoDateMatch) {
    const year = Number(isoDateMatch[1]);
    const month = Number(isoDateMatch[2]);
    const day = Number(isoDateMatch[3]);
    if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
      return `${pad2(day)}/${pad2(month)}/${String(year)}`;
    }
  }

  const slashDateMatch = normalized.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/
  );
  if (slashDateMatch) {
    const day = Number(slashDateMatch[1]);
    const month = Number(slashDateMatch[2]);
    const year = Number(slashDateMatch[3]);
    if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
      return `${pad2(day)}/${pad2(month)}/${String(year)}`;
    }
  }

  return normalized;
}
