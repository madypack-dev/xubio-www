import type { Producto, SimpleCatalog } from "../domain";
import type { ProductoDto } from "./productos.schemas";
import {
  asBooleanOrNull,
  asNumberOrNull,
  asRecord,
  asStringOrNull,
  pickFirstDefined
} from "@/shared/lib/acl/legacyPayload";

function toSimpleCatalog(value: unknown): SimpleCatalog | null {
  const item = asRecord(value);
  if (!item) {
    return null;
  }

  return {
    ID: asStringOrNull(item.ID),
    id: asStringOrNull(item.id),
    nombre: asStringOrNull(item.nombre) ?? "",
    codigo: asStringOrNull(item.codigo) ?? ""
  };
}

export function toProductoDomain(dto: ProductoDto): Producto {
  return {
    productoId:
      pickFirstDefined(
        asStringOrNull(dto.productoid),
        asStringOrNull(dto.productoID),
        asStringOrNull(dto.id),
        asStringOrNull(dto.ID)
      ) ?? null,
    nombre: asStringOrNull(dto.nombre) ?? "",
    codigo: asStringOrNull(dto.codigo) ?? "",
    usrCode:
      pickFirstDefined(asStringOrNull(dto.usrcode), asStringOrNull(dto.usrCode)) ?? "",
    codigoBarra: asStringOrNull(dto.codigoBarra) ?? "",
    unidadMedida: toSimpleCatalog(dto.unidadMedida),
    categoria: asStringOrNull(dto.categoria),
    stockNegativo: asBooleanOrNull(dto.stockNegativo),
    tasaIva: toSimpleCatalog(dto.tasaIva),
    cuentaContable: toSimpleCatalog(dto.cuentaContable),
    catFormIVA2002: asStringOrNull(dto.catFormIVA2002),
    precioUltCompra: asNumberOrNull(dto.precioUltCompra),
    activo: asBooleanOrNull(dto.activo),
    sincronizaStock: asBooleanOrNull(dto.sincronizaStock)
  };
}
