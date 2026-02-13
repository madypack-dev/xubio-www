import type { Vendedor } from "../domain";
import type { VendedorDto } from "./vendedores.schemas";
import { asStringOrNull, pickFirstDefined } from "@/shared/lib/acl/legacyPayload";

export function toVendedorDomain(dto: VendedorDto): Vendedor {
  return {
    vendedorId: pickFirstDefined(
      asStringOrNull(dto.vendedor_id),
      asStringOrNull(dto.vendedorId),
      asStringOrNull(dto.id),
      asStringOrNull(dto.ID)
    ),
    nombre:
      pickFirstDefined(asStringOrNull(dto.nombre), asStringOrNull(dto.primerNombre)) ?? "",
    apellido:
      pickFirstDefined(asStringOrNull(dto.apellido), asStringOrNull(dto.primerApellido)) ?? "",
    email: asStringOrNull(dto.email) ?? "",
    telefono: asStringOrNull(dto.telefono) ?? "",
    direccion: asStringOrNull(dto.direccion) ?? "",
    raw: { ...dto }
  };
}
