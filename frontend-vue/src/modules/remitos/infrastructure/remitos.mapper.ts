import type { Remito, RemitoItem } from "../domain";
import type { RemitoDto, RemitoItemDto } from "./remitos.schemas";
import {
  asNumberOrNull,
  asRecord,
  asStringOrNull,
  pickFirstDefined
} from "@/shared/lib/acl/legacyPayload";
import { parseLegacyDateToTimestamp } from "@/shared/lib/date/legacyDate";

const debugRemitos =
  import.meta.env.DEV &&
  (() => {
    const raw = String(import.meta.env.VITE_DEBUG_REMITOS ?? "").trim().toLowerCase();
    return raw === "true" || raw === "1";
  })();
let missingObservacionLogCount = 0;

function toRemitoItem(item: RemitoItemDto): RemitoItem {
  const producto = asRecord(item.producto);
  const productoID =
    pickFirstDefined(asStringOrNull(producto?.ID), asStringOrNull(item.productoId)) ??
    null;
  const productoid =
    pickFirstDefined(asStringOrNull(producto?.id), asStringOrNull(item.productoid)) ??
    null;
  const productoId =
    pickFirstDefined(productoID, productoid, asStringOrNull(item.productoId)) ?? null;

  return {
    transaccionCVItemId: asStringOrNull(item.transaccionCVItemId),
    transaccionId: asStringOrNull(item.transaccionId),
    productoID,
    productoid,
    productoId,
    descripcion: asStringOrNull(item.descripcion) ?? "",
    cantidad: asNumberOrNull(item.cantidad),
    precio: asNumberOrNull(item.precio)
  };
}

function mapRemito(dto: RemitoDto): Remito {
  const encabezado = asRecord(dto.encabezado);
  const relaciones = asRecord(dto.relaciones);
  const items = Array.isArray(dto.transaccionProductoItem)
    ? dto.transaccionProductoItem.map(toRemitoItem)
    : [];
  const observacion =
    pickFirstDefined(
      asStringOrNull(dto.observacion),
      asStringOrNull(dto.observaciones),
      asStringOrNull(encabezado?.observacion),
      asStringOrNull(encabezado?.observaciones)
    ) ?? "";

  if (debugRemitos && observacion === "" && missingObservacionLogCount < 5) {
    missingObservacionLogCount += 1;
    console.info("[MVP][Remitos] Remito sin observacion tras map", {
      transaccionId: asStringOrNull(dto.transaccionId),
      observacion: asStringOrNull(dto.observacion),
      observaciones: asStringOrNull(dto.observaciones),
      encabezadoObservacion: asStringOrNull(encabezado?.observacion),
      encabezadoObservaciones: asStringOrNull(encabezado?.observaciones)
    });
  }

  return {
    transaccionId: asStringOrNull(dto.transaccionId),
    numeroRemito:
      pickFirstDefined(
        asStringOrNull(dto.numeroRemito),
        asStringOrNull(encabezado?.numeroRemito)
      ) ?? "",
    fecha:
      pickFirstDefined(asStringOrNull(dto.fecha), asStringOrNull(encabezado?.fecha)) ??
      null,
    observacion,
    clienteId:
      pickFirstDefined(
        asStringOrNull(dto.clienteId),
        asStringOrNull(dto.cliente_id),
        asStringOrNull(relaciones?.clienteId),
        asStringOrNull(relaciones?.cliente_id)
      ) ?? null,
    vendedorId:
      pickFirstDefined(
        asStringOrNull(dto.vendedorId),
        asStringOrNull(dto.vendedor_id),
        asStringOrNull(relaciones?.vendedorId),
        asStringOrNull(relaciones?.vendedor_id)
      ) ?? null,
    comisionVendedor:
      pickFirstDefined(
        asNumberOrNull(dto.comisionVendedor),
        asNumberOrNull(dto.comision_vendedor),
        asNumberOrNull(relaciones?.comisionVendedor),
        asNumberOrNull(relaciones?.comision_vendedor)
      ) ?? null,
    depositoId:
      pickFirstDefined(
        asStringOrNull(dto.depositoId),
        asStringOrNull(dto.depositoID),
        asStringOrNull(relaciones?.depositoId),
        asStringOrNull(relaciones?.depositoID)
      ) ?? null,
    circuitoContableId:
      pickFirstDefined(
        asStringOrNull(dto.circuitoContableId),
        asStringOrNull(dto.circuitoContableID),
        asStringOrNull(relaciones?.circuitoContableId),
        asStringOrNull(relaciones?.circuitoContableID)
      ) ?? null,
    items
  };
}

export function toRemitosDomain(dtos: RemitoDto[]): Remito[] {
  return dtos.map(mapRemito).sort((left, right) => {
    const byDate =
      parseLegacyDateToTimestamp(right.fecha) - parseLegacyDateToTimestamp(left.fecha);
    if (byDate !== 0) {
      return byDate;
    }

    const leftId = Number(left.transaccionId);
    const rightId = Number(right.transaccionId);
    if (Number.isFinite(leftId) && Number.isFinite(rightId) && leftId !== rightId) {
      return rightId - leftId;
    }

    return 0;
  });
}
