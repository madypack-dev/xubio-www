import type { ListaPrecio } from "../domain";
import type { ListaPrecioDto } from "./listasPrecio.schemas";
import {
  asBooleanOrNull,
  asStringOrNull,
  pickFirstDefined
} from "@/shared/lib/acl/legacyPayload";

export function toListaPrecioDomain(dto: ListaPrecioDto): ListaPrecio {
  return {
    listaPrecioId:
      pickFirstDefined(
        asStringOrNull(dto.listaPrecioID),
        asStringOrNull(dto.listaPrecioId),
        asStringOrNull(dto.ID),
        asStringOrNull(dto.id)
      ) ?? null,
    nombre: asStringOrNull(dto.nombre) ?? "",
    descripcion:
      pickFirstDefined(asStringOrNull(dto.descripcion), asStringOrNull(dto.detalle)) ??
      "",
    activo: asBooleanOrNull(dto.activo)
  };
}
