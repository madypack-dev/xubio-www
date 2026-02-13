import { z } from "zod";

const unknownRecordSchema = z.record(z.string(), z.unknown());

export const comprobanteDtoSchema = z
  .object({
    transaccionid: z.unknown().optional(),
    transaccionId: z.unknown().optional(),
    id: z.unknown().optional(),
    ID: z.unknown().optional(),
    nombre: z.unknown().optional(),
    fecha: z.unknown().optional(),
    fechaVto: z.unknown().optional(),
    tipo: z.unknown().optional(),
    numeroDocumento: z.unknown().optional(),
    CAE: z.unknown().optional(),
    descripcion: z.unknown().optional(),
    externalId: z.unknown().optional(),
    externalid: z.unknown().optional(),
    importetotal: z.unknown().optional(),
    importeTotal: z.unknown().optional(),
    importeMonPrincipal: z.unknown().optional(),
    importeImpuestos: z.unknown().optional(),
    impuestoTotal: z.unknown().optional(),
    importeGravado: z.unknown().optional(),
    clienteNombre: z.unknown().optional(),
    vendedorNombre: z.unknown().optional(),
    cliente: unknownRecordSchema.optional(),
    vendedor: unknownRecordSchema.optional()
  })
  .passthrough();

export type ComprobanteDto = z.infer<typeof comprobanteDtoSchema>;
