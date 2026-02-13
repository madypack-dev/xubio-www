import { z } from "zod";

export const listaPrecioDtoSchema = z
  .object({
    listaPrecioID: z.unknown().optional(),
    listaPrecioId: z.unknown().optional(),
    ID: z.unknown().optional(),
    id: z.unknown().optional(),
    nombre: z.unknown().optional(),
    descripcion: z.unknown().optional(),
    detalle: z.unknown().optional(),
    activo: z.unknown().optional()
  })
  .passthrough();

export type ListaPrecioDto = z.infer<typeof listaPrecioDtoSchema>;
