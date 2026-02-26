import { z } from "zod";

export const depositoDtoSchema = z
  .object({
    depositoId: z.unknown().optional(),
    depositoID: z.unknown().optional(),
    deposito_id: z.unknown().optional(),
    id: z.unknown().optional(),
    ID: z.unknown().optional(),
    nombre: z.unknown().optional(),
    descripcion: z.unknown().optional()
  })
  .passthrough();

export type DepositoDto = z.infer<typeof depositoDtoSchema>;
