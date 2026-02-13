import { z } from "zod";

const unknownRecordSchema = z.record(z.string(), z.unknown());

export const clienteDtoSchema = z
  .object({
    cliente_id: z.unknown().optional(),
    clienteId: z.unknown().optional(),
    nombre: z.unknown().optional(),
    razonSocial: z.unknown().optional(),
    identificacionTributaria: unknownRecordSchema.optional(),
    categoriaFiscal: unknownRecordSchema.optional(),
    cuit: z.unknown().optional(),
    CUIT: z.unknown().optional(),
    responsabilidadOrganizacionItem: z.array(z.unknown()).optional(),
    esclienteextranjero: z.unknown().optional(),
    esProveedor: z.unknown().optional(),
    direccion: z.unknown().optional(),
    email: z.unknown().optional(),
    telefono: z.unknown().optional(),
    provincia: unknownRecordSchema.optional(),
    pais: unknownRecordSchema.optional(),
    cuentaVenta_id: unknownRecordSchema.optional(),
    cuentaCompra_id: unknownRecordSchema.optional(),
    usrCode: z.unknown().optional(),
    usrcode: z.unknown().optional(),
    descripcion: z.unknown().optional()
  })
  .passthrough();

export type ClienteDto = z.infer<typeof clienteDtoSchema>;
