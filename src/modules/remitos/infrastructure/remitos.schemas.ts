import { z } from "zod";

const unknownRecordSchema = z.record(z.string(), z.unknown());

export const remitoItemDtoSchema = z
  .object({
    transaccionCVItemId: z.unknown().optional(),
    transaccionId: z.unknown().optional(),
    productoId: z.unknown().optional(),
    productoid: z.unknown().optional(),
    producto: unknownRecordSchema.optional(),
    descripcion: z.unknown().optional(),
    cantidad: z.unknown().optional(),
    precio: z.unknown().optional()
  })
  .passthrough();

export const remitoDtoSchema = z
  .object({
    transaccionId: z.unknown().optional(),
    numeroRemito: z.unknown().optional(),
    fecha: z.unknown().optional(),
    observacion: z.unknown().optional(),
    observaciones: z.unknown().optional(),
    clienteId: z.unknown().optional(),
    cliente_id: z.unknown().optional(),
    vendedorId: z.unknown().optional(),
    vendedor_id: z.unknown().optional(),
    comisionVendedor: z.unknown().optional(),
    comision_vendedor: z.unknown().optional(),
    depositoId: z.unknown().optional(),
    depositoID: z.unknown().optional(),
    circuitoContableId: z.unknown().optional(),
    circuitoContableID: z.unknown().optional(),
    encabezado: unknownRecordSchema.optional(),
    relaciones: unknownRecordSchema.optional(),
    transaccionProductoItem: z.array(remitoItemDtoSchema).optional()
  })
  .passthrough();

export type RemitoDto = z.infer<typeof remitoDtoSchema>;
export type RemitoItemDto = z.infer<typeof remitoItemDtoSchema>;
