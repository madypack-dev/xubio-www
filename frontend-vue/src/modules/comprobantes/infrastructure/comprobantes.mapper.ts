import type { ComprobanteVenta } from "../domain";
import type { ComprobanteDto } from "./comprobantes.schemas";
import {
  asNumberOrNull,
  asRecord,
  asStringOrNull,
  pickFirstDefined
} from "@/shared/lib/acl/legacyPayload";
import { parseLegacyDateToTimestamp } from "@/shared/lib/date/legacyDate";

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

function mapComprobante(dto: ComprobanteDto): ComprobanteVenta {
  return {
    comprobanteVentaId:
      pickFirstDefined(
        asStringOrNull(dto.transaccionid),
        asStringOrNull(dto.transaccionId),
        asStringOrNull(dto.id),
        asStringOrNull(dto.ID)
      ) ?? null,
    nombre: asStringOrNull(dto.nombre) ?? "",
    fecha: asStringOrNull(dto.fecha),
    fechaVto: asStringOrNull(dto.fechaVto),
    tipo: asStringOrNull(dto.tipo),
    numeroDocumento: asStringOrNull(dto.numeroDocumento) ?? "",
    cae: asStringOrNull(dto.CAE) ?? "",
    descripcion: asStringOrNull(dto.descripcion) ?? "",
    externalId:
      pickFirstDefined(asStringOrNull(dto.externalId), asStringOrNull(dto.externalid)) ??
      "",
    importeTotal:
      pickFirstDefined(
        asNumberOrNull(dto.importetotal),
        asNumberOrNull(dto.importeTotal),
        asNumberOrNull(dto.importeMonPrincipal)
      ) ?? null,
    importeImpuestos:
      pickFirstDefined(
        asNumberOrNull(dto.importeImpuestos),
        asNumberOrNull(dto.impuestoTotal)
      ) ?? null,
    importeGravado: asNumberOrNull(dto.importeGravado),
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
