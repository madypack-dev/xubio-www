import type { ComprobanteVenta } from "../domain";
import type { ComprobanteDto } from "./comprobantes.schemas";
import {
  asNumberOrNull,
  asRecord,
  asStringOrNull,
  pickFirstDefined
} from "@/shared/lib/acl/legacyPayload";
import { parseLegacyDateToTimestamp } from "@/shared/lib/date/legacyDate";
import {
  toFechaComercial,
  toMoney,
  toTransaccionId
} from "@/shared/types/valueObjects";

function resolveVendedorNombre(value: unknown) {
  const vendedor = asRecord(value);
  if (!vendedor) {
    return "";
  }
  const nombre = asStringOrNull(vendedor.nombre) ?? "";
  const apellido = asStringOrNull(vendedor.apellido) ?? "";
  return `${nombre} ${apellido}`.trim();
}

function resolveClienteNombre(value: unknown) {
  const cliente = asRecord(value);
  if (!cliente) {
    return "";
  }
  return asStringOrNull(cliente.nombre) ?? "";
}

function toFechaComercialFromArray(value: unknown) {
  if (!Array.isArray(value) || value.length < 3) {
    return null;
  }
  const year = Number(value[0]);
  const month = Number(value[1]);
  const day = Number(value[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  const normalized = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return toFechaComercial(normalized);
}

function mapComprobante(dto: ComprobanteDto): ComprobanteVenta {
  return {
    comprobanteVentaId: toTransaccionId(
      pickFirstDefined(
        asStringOrNull(dto.transaccionid),
        asStringOrNull(dto.transaccionId),
        asStringOrNull(dto.id),
        asStringOrNull(dto.ID)
      )
    ),
    nombre: asStringOrNull(dto.nombre) ?? "",
    fecha: toFechaComercial(asStringOrNull(dto.fecha)),
    fechaVto: toFechaComercial(asStringOrNull(dto.fechaVto)),
    caeFechaVto:
      toFechaComercial(asStringOrNull(dto.caeFechaVto)) ??
      toFechaComercialFromArray(dto.caefechaVto),
    tipo: asStringOrNull(dto.tipo),
    numeroDocumento: asStringOrNull(dto.numeroDocumento) ?? "",
    cae: asStringOrNull(dto.CAE) ?? "",
    descripcion: asStringOrNull(dto.descripcion) ?? "",
    externalId:
      pickFirstDefined(asStringOrNull(dto.externalId), asStringOrNull(dto.externalid)) ??
      "",
    importeTotal: toMoney(
      pickFirstDefined(
        asNumberOrNull(dto.importetotal),
        asNumberOrNull(dto.importeTotal),
        asNumberOrNull(dto.importeMonPrincipal)
      )
    ),
    importeImpuestos: toMoney(
      pickFirstDefined(
        asNumberOrNull(dto.importeImpuestos),
        asNumberOrNull(dto.impuestoTotal)
      )
    ),
    importeGravado: toMoney(asNumberOrNull(dto.importeGravado)),
    clienteNombre:
      pickFirstDefined(
        asStringOrNull(dto.clienteNombre),
        resolveClienteNombre(dto.cliente)
      ) ?? "",
    vendedorNombre:
      pickFirstDefined(
        asStringOrNull(dto.vendedorNombre),
        resolveVendedorNombre(dto.vendedor)
      ) ?? ""
  };
}

export function toComprobantesDomain(dtos: ComprobanteDto[]): ComprobanteVenta[] {
  return dtos.map(mapComprobante).sort((left, right) => {
    const byDate =
      parseLegacyDateToTimestamp(right.fecha) - parseLegacyDateToTimestamp(left.fecha);
    if (byDate !== 0) {
      return byDate;
    }
    const leftId = Number(left.comprobanteVentaId);
    const rightId = Number(right.comprobanteVentaId);
    if (Number.isFinite(leftId) && Number.isFinite(rightId) && leftId !== rightId) {
      return rightId - leftId;
    }
    return 0;
  });
}

export function toComprobanteDomain(dto: ComprobanteDto): ComprobanteVenta {
  return mapComprobante(dto);
}
