import { z } from "zod";

const unknownRecordSchema = z.record(z.string(), z.unknown());
const legacyScalarSchema = z.union([z.string(), z.number(), z.null()]);

export const remitoItemDtoSchema = z
  .object({
    transaccionCVItemId: legacyScalarSchema.optional(),
    transaccionId: legacyScalarSchema.optional(),
    productoId: legacyScalarSchema.optional(),
    productoid: legacyScalarSchema.optional(),
    producto: unknownRecordSchema.optional(),
    descripcion: legacyScalarSchema.optional(),
    cantidad: legacyScalarSchema.optional(),
    precio: legacyScalarSchema.optional()
  })
  .passthrough();

export const remitoDtoSchema = z
  .object({
    transaccionId: legacyScalarSchema.optional(),
    numeroRemito: legacyScalarSchema.optional(),
    fecha: legacyScalarSchema.optional(),
    observacion: legacyScalarSchema.optional(),
    observaciones: legacyScalarSchema.optional(),
    clienteId: legacyScalarSchema.optional(),
    cliente_id: legacyScalarSchema.optional(),
    vendedorId: legacyScalarSchema.optional(),
    vendedor_id: legacyScalarSchema.optional(),
    comisionVendedor: legacyScalarSchema.optional(),
    comision_vendedor: legacyScalarSchema.optional(),
    depositoId: legacyScalarSchema.optional(),
    depositoID: legacyScalarSchema.optional(),
    circuitoContableId: legacyScalarSchema.optional(),
    circuitoContableID: legacyScalarSchema.optional(),
    encabezado: unknownRecordSchema.optional(),
    relaciones: unknownRecordSchema.optional(),
    transaccionProductoItem: z.array(remitoItemDtoSchema).optional()
  })
  .passthrough();

export type RemitoDto = z.infer<typeof remitoDtoSchema>;
export type RemitoItemDto = z.infer<typeof remitoItemDtoSchema>;
