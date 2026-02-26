import type { CircuitoContable } from "../domain";
import type { CircuitoContableDto } from "./circuitosContables.schemas";
import { asStringOrNull, pickFirstDefined } from "@/shared/lib/acl/legacyPayload";

export function toCircuitoContableDomain(dto: CircuitoContableDto): CircuitoContable {
  return {
    circuitoContableId: pickFirstDefined(
      asStringOrNull(dto.circuitoContable_id),
      asStringOrNull(dto.circuitoContableId),
      asStringOrNull(dto.circuitoContableID),
      asStringOrNull(dto.id),
      asStringOrNull(dto.ID)
    ),
    nombre: asStringOrNull(dto.nombre) ?? "",
    codigo: asStringOrNull(dto.codigo) ?? "",
    raw: { ...dto }
  };
}
