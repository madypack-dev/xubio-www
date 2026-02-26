import type { Deposito } from "../domain";
import type { DepositoDto } from "./depositos.schemas";
import { asStringOrNull, pickFirstDefined } from "@/shared/lib/acl/legacyPayload";

export function toDepositoDomain(dto: DepositoDto): Deposito {
  return {
    depositoId: pickFirstDefined(
      asStringOrNull(dto.depositoId),
      asStringOrNull(dto.depositoID),
      asStringOrNull(dto.deposito_id),
      asStringOrNull(dto.id),
      asStringOrNull(dto.ID)
    ),
    nombre:
      pickFirstDefined(asStringOrNull(dto.nombre), asStringOrNull(dto.descripcion)) ?? "",
    raw: { ...dto }
  };
}
