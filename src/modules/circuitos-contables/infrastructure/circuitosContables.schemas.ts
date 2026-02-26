import { z } from "zod";

export const circuitoContableDtoSchema = z
  .object({
    circuitoContable_id: z.unknown().optional(),
    circuitoContableId: z.unknown().optional(),
    circuitoContableID: z.unknown().optional(),
    id: z.unknown().optional(),
    ID: z.unknown().optional(),
    nombre: z.unknown().optional(),
    codigo: z.unknown().optional()
  })
  .passthrough();

export type CircuitoContableDto = z.infer<typeof circuitoContableDtoSchema>;
