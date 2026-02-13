import type { Cliente, ProvinciaCatalog, SimpleCatalog } from "../domain";
import type { ClienteDto } from "./clientes.schemas";
import {
  asBooleanOrNull,
  asRecord,
  asStringOrNull,
  pickFirstDefined
} from "@/shared/lib/acl/legacyPayload";
import { toClienteId } from "@/shared/types/valueObjects";

function toSimpleCatalog(value: unknown): SimpleCatalog | null {
  const item = asRecord(value);
  if (!item) {
    return null;
  }

  return {
    ID: asStringOrNull(item.ID),
    id: asStringOrNull(item.id),
    nombre: asStringOrNull(item.nombre) ?? "",
    codigo: asStringOrNull(item.codigo) ?? ""
  };
}

function toProvinciaCatalog(value: unknown): ProvinciaCatalog | null {
  const item = asRecord(value);
  if (!item) {
    return null;
  }

  return {
    provinciaId: pickFirstDefined(
      asStringOrNull(item.provincia_id),
      asStringOrNull(item.provinciaId),
      asStringOrNull(item.id),
      asStringOrNull(item.ID)
    ),
    codigo: asStringOrNull(item.codigo) ?? "",
    nombre: asStringOrNull(item.nombre) ?? "",
    pais: asStringOrNull(item.pais) ?? ""
  };
}

function toSimpleCatalogArray(value: unknown): SimpleCatalog[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => toSimpleCatalog(item))
    .filter((item): item is SimpleCatalog => item !== null);
}

export function toClienteDomain(dto: ClienteDto): Cliente {
  return {
    clienteId: toClienteId(
      pickFirstDefined(asStringOrNull(dto.cliente_id), asStringOrNull(dto.clienteId))
    ),
    nombre: asStringOrNull(dto.nombre) ?? "",
    primerApellido: asStringOrNull(dto.primerApellido) ?? "",
    segundoApellido: asStringOrNull(dto.segundoApellido) ?? "",
    primerNombre: asStringOrNull(dto.primerNombre) ?? "",
    otrosNombres: asStringOrNull(dto.otrosNombres) ?? "",
    razonSocial: asStringOrNull(dto.razonSocial) ?? "",
    nombreComercial: asStringOrNull(dto.nombreComercial) ?? "",
    identificacionTributaria: toSimpleCatalog(dto.identificacionTributaria),
    digitoVerificacion: asStringOrNull(dto.digitoVerificacion) ?? "",
    categoriaFiscal: toSimpleCatalog(dto.categoriaFiscal),
    provincia: toProvinciaCatalog(dto.provincia),
    direccion: asStringOrNull(dto.direccion) ?? "",
    email: asStringOrNull(dto.email) ?? "",
    telefono: asStringOrNull(dto.telefono) ?? "",
    codigoPostal: asStringOrNull(dto.codigoPostal) ?? "",
    cuentaVenta: toSimpleCatalog(
      pickFirstDefined(dto.cuentaVenta_id, dto.cuentaVentaId)
    ),
    cuentaCompra: toSimpleCatalog(
      pickFirstDefined(dto.cuentaCompra_id, dto.cuentaCompraId)
    ),
    pais: toSimpleCatalog(dto.pais),
    localidad: toSimpleCatalog(dto.localidad),
    usrCode:
      pickFirstDefined(asStringOrNull(dto.usrCode), asStringOrNull(dto.usrcode)) ?? "",
    listaPrecioVenta: toSimpleCatalog(dto.listaPrecioVenta),
    descripcion: asStringOrNull(dto.descripcion) ?? "",
    esClienteExtranjero: asBooleanOrNull(
      pickFirstDefined(dto.esclienteextranjero, dto.esClienteExtranjero)
    ),
    esProveedor: asBooleanOrNull(dto.esProveedor),
    cuit: asStringOrNull(dto.cuit) ?? "",
    tipoDeOrganizacion: toSimpleCatalog(
      pickFirstDefined(dto.tipoDeOrganizacion, dto.tipoorganizacion)
    ),
    responsabilidadOrganizacionItem: toSimpleCatalogArray(
      dto.responsabilidadOrganizacionItem
    ),
    cuitUpper: asStringOrNull(dto.CUIT) ?? "",
  };
}
