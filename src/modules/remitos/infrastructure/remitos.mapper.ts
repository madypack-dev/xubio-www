import type { Remito, RemitoItem } from "../domain";
import type { RemitoDto, RemitoItemDto } from "./remitos.schemas";
import {
  asNumberOrNull,
  asRecord,
  asStringOrNull,
  pickFirstDefined
} from "@/shared/lib/acl/legacyPayload";
import { parseLegacyDateToTimestamp } from "@/shared/lib/date/legacyDate";
import {
  toClienteId,
  toFechaComercial,
  toMoney,
  toProductoId,
  toTransaccionId
} from "@/shared/types/valueObjects";
import { runtimeConfig } from "@/shared/config/runtimeConfig";
import { createLogger } from "@/shared/lib/observability/logger";

const debugRemitos = runtimeConfig.debugRemitos;
let missingObservacionLogCount = 0;
const logger = createLogger("MVP RemitosMapper");

function toRemitoItem(item: RemitoItemDto): RemitoItem {
  const producto = asRecord(item.producto);
  const productoID = toProductoId(
    pickFirstDefined(asStringOrNull(producto?.ID), asStringOrNull(item.productoId))
  );
  const productoid = toProductoId(
    pickFirstDefined(asStringOrNull(producto?.id), asStringOrNull(item.productoid))
  );
  const productoId =
    toProductoId(
      pickFirstDefined(productoID, productoid, asStringOrNull(item.productoId))
    );

  return {
    transaccionCVItemId: asStringOrNull(item.transaccionCVItemId),
    transaccionId: toTransaccionId(asStringOrNull(item.transaccionId)),
    productoId,
    descripcion: asStringOrNull(item.descripcion) ?? "",
    cantidad: asNumberOrNull(item.cantidad),
    precio: toMoney(asNumberOrNull(item.precio))
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
    logger.info("Remito sin observacion tras map", {
      transaccionId: asStringOrNull(dto.transaccionId),
      observacion: asStringOrNull(dto.observacion),
      observaciones: asStringOrNull(dto.observaciones),
      encabezadoObservacion: asStringOrNull(encabezado?.observacion),
      encabezadoObservaciones: asStringOrNull(encabezado?.observaciones)
    });
  }

  return {
    transaccionId: toTransaccionId(asStringOrNull(dto.transaccionId)),
    numeroRemito:
      pickFirstDefined(
        asStringOrNull(dto.numeroRemito),
        asStringOrNull(encabezado?.numeroRemito)
      ) ?? "",
    fecha: toFechaComercial(
      pickFirstDefined(asStringOrNull(dto.fecha), asStringOrNull(encabezado?.fecha))
    ),
    observacion,
    clienteId: toClienteId(
      pickFirstDefined(
        asStringOrNull(dto.clienteId),
        asStringOrNull(dto.cliente_id),
        asStringOrNull(relaciones?.clienteId),
        asStringOrNull(relaciones?.cliente_id)
      )
    ),
    vendedorId:
      pickFirstDefined(
        asStringOrNull(dto.vendedorId),
        asStringOrNull(dto.vendedor_id),
        asStringOrNull(relaciones?.vendedorId),
        asStringOrNull(relaciones?.vendedor_id)
      ) ?? null,
    comisionVendedor: toMoney(
      pickFirstDefined(
        asNumberOrNull(dto.comisionVendedor),
        asNumberOrNull(dto.comision_vendedor),
        asNumberOrNull(relaciones?.comisionVendedor),
        asNumberOrNull(relaciones?.comision_vendedor)
      )
    ),
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
