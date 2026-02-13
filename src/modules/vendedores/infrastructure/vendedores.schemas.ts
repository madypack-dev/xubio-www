import { z } from "zod";

export const vendedorDtoSchema = z
  .object({
    vendedor_id: z.unknown().optional(),
    vendedorId: z.unknown().optional(),
    id: z.unknown().optional(),
    ID: z.unknown().optional(),
    nombre: z.unknown().optional(),
    primerNombre: z.unknown().optional(),
    apellido: z.unknown().optional(),
    primerApellido: z.unknown().optional(),
    email: z.unknown().optional(),
    telefono: z.unknown().optional(),
    direccion: z.unknown().optional()
  })
  .passthrough();

export type VendedorDto = z.infer<typeof vendedorDtoSchema>;
