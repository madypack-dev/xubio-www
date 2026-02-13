import { z } from "zod";

const unknownRecordSchema = z.record(z.string(), z.unknown());

export const clienteDtoSchema = z
  .object({
    cliente_id: z.unknown().optional(),
    clienteId: z.unknown().optional(),
    nombre: z.unknown().optional(),
    primerApellido: z.unknown().optional(),
    segundoApellido: z.unknown().optional(),
    primerNombre: z.unknown().optional(),
    otrosNombres: z.unknown().optional(),
    razonSocial: z.unknown().optional(),
    nombreComercial: z.unknown().optional(),
    identificacionTributaria: unknownRecordSchema.optional(),
    digitoVerificacion: z.unknown().optional(),
    categoriaFiscal: unknownRecordSchema.optional(),
    provincia: unknownRecordSchema.optional(),
    direccion: z.unknown().optional(),
    email: z.unknown().optional(),
    telefono: z.unknown().optional(),
    codigoPostal: z.unknown().optional(),
    cuentaVenta_id: unknownRecordSchema.optional(),
    cuentaVentaId: unknownRecordSchema.optional(),
    cuentaCompra_id: unknownRecordSchema.optional(),
    cuentaCompraId: unknownRecordSchema.optional(),
    pais: unknownRecordSchema.optional(),
    localidad: unknownRecordSchema.optional(),
    usrCode: z.unknown().optional(),
    usrcode: z.unknown().optional(),
    listaPrecioVenta: unknownRecordSchema.optional(),
    descripcion: z.unknown().optional(),
    esclienteextranjero: z.unknown().optional(),
    esClienteExtranjero: z.unknown().optional(),
    esProveedor: z.unknown().optional(),
    cuit: z.unknown().optional(),
    CUIT: z.unknown().optional(),
    tipoDeOrganizacion: unknownRecordSchema.optional(),
    responsabilidadOrganizacionItem: z.array(z.unknown()).optional(),
    tipoorganizacion: unknownRecordSchema.optional()
  })
  .passthrough();

export type ClienteDto = z.infer<typeof clienteDtoSchema>;
