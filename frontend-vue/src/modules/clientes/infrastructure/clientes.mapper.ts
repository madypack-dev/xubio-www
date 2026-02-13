import type { Cliente, SimpleCatalog } from "../domain";
import type { ClienteDto } from "./clientes.schemas";
import {
  asBooleanOrNull,
  asRecord,
  asStringOrNull,
  pickFirstDefined
} from "@/shared/lib/acl/legacyPayload";

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

export function toClienteDomain(dto: ClienteDto): Cliente {
  return {
    clienteId:
      pickFirstDefined(asStringOrNull(dto.cliente_id), asStringOrNull(dto.clienteId)) ??
      null,
    nombre: asStringOrNull(dto.nombre) ?? "",
    razonSocial: asStringOrNull(dto.razonSocial) ?? "",
    identificacionTributaria: toSimpleCatalog(dto.identificacionTributaria),
    categoriaFiscal: toSimpleCatalog(dto.categoriaFiscal),
    cuit: asStringOrNull(dto.cuit) ?? "",
    cuitUpper: asStringOrNull(dto.CUIT) ?? "",
    responsabilidadOrganizacionItem: Array.isArray(dto.responsabilidadOrganizacionItem)
      ? dto.responsabilidadOrganizacionItem
      : [],
    esClienteExtranjero: asBooleanOrNull(dto.esclienteextranjero),
    esProveedor: asBooleanOrNull(dto.esProveedor),
    direccion: asStringOrNull(dto.direccion) ?? "",
    email: asStringOrNull(dto.email) ?? "",
    telefono: asStringOrNull(dto.telefono) ?? "",
    provincia: asRecord(dto.provincia),
    pais: toSimpleCatalog(dto.pais),
    cuentaVenta: toSimpleCatalog(dto.cuentaVenta_id),
    cuentaCompra: toSimpleCatalog(dto.cuentaCompra_id),
    usrCode:
      pickFirstDefined(asStringOrNull(dto.usrCode), asStringOrNull(dto.usrcode)) ?? "",
    descripcion: asStringOrNull(dto.descripcion) ?? ""
  };
}
