import { z } from "zod";

const unknownRecordSchema = z.record(z.string(), z.unknown());

export const productoDtoSchema = z
  .object({
    productoid: z.unknown().optional(),
    productoID: z.unknown().optional(),
    id: z.unknown().optional(),
    ID: z.unknown().optional(),
    nombre: z.unknown().optional(),
    codigo: z.unknown().optional(),
    usrcode: z.unknown().optional(),
    usrCode: z.unknown().optional(),
    codigoBarra: z.unknown().optional(),
    unidadMedida: unknownRecordSchema.optional(),
    categoria: z.unknown().optional(),
    stockNegativo: z.unknown().optional(),
    tasaIva: unknownRecordSchema.optional(),
    cuentaContable: unknownRecordSchema.optional(),
    catFormIVA2002: z.unknown().optional(),
    precioUltCompra: z.unknown().optional(),
    activo: z.unknown().optional(),
    sincronizaStock: z.unknown().optional()
  })
  .passthrough();

export type ProductoDto = z.infer<typeof productoDtoSchema>;
