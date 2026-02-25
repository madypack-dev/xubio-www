# TODO - Backend con failover de 3 URLs

## Estado actual
- Fecha de auditoria: 2026-02-25
- Objetivo: primero refactorizar para mejorar arquitectura/SOLID/TypeScript; despues implementar failover 1->2->3.
- Resultado de ejecucion: refactor + failover implementados, tests unitarios en verde y `typecheck` en verde.
- Decisión temporal aplicada: si falta `VITE_API_BASE_URLS`, se usa fallback hardcodeado de 3 URLs.

## Archivos involucrados

### Nucleo de configuracion y transporte
- `src/shared/config/runtimeConfig.ts`
- `src/shared/lib/http/legacyRepository.ts`
- `src/shared/lib/http/httpClient.ts`
- `src/shared/lib/http/httpErrorSummary.ts`

### Wiring de dependencias (entrada de configuracion)
- `src/modules/remitos/presentation/remitosDependencies.ts`
- `src/modules/clientes/presentation/clientesDependencies.ts`
- `src/modules/productos/presentation/productosDependencies.ts`
- `src/modules/listas-precio/presentation/listasPrecioDependencies.ts`
- `src/modules/comprobantes/presentation/comprobantesDependencies.ts`
- `src/modules/vendedores/presentation/vendedoresDependencies.ts`

### Repositorios de infraestructura
- `src/modules/remitos/infrastructure/remitos.repository.ts`
- `src/modules/clientes/infrastructure/clientes.repository.ts`
- `src/modules/productos/infrastructure/productos.repository.ts`
- `src/modules/listas-precio/infrastructure/listasPrecio.repository.ts`
- `src/modules/comprobantes/infrastructure/comprobantes.repository.ts`
- `src/modules/vendedores/infrastructure/vendedores.repository.ts`

### Tests y documentacion
- `src/test/legacyRepository.spec.ts`
- `src/test/httpClient.spec.ts`
- `docs/env-vars.md`
- `README.md`

## Preguntas y respuestas desde evidencia

1. Pregunta: Hoy existe soporte nativo para varias URLs backend?
- Evidencia: `runtimeConfig` expone `apiBaseUrls` (readonly) y resuelve desde `VITE_API_BASE_URLS`.
- Respuesta tentativa: si; hay soporte multi-URL con deduplicacion, normalizacion y limite de 3.
- Certeza nueva: el contrato de configuracion multi-backend ya esta operativo.

2. Pregunta: Donde implementar failover sin romper arquitectura?
- Evidencia: todos los repositorios HTTP llaman a `fetchLegacyList`/`fetchLegacyByIdOrNull` en `legacyRepository.ts`.
- Respuesta tentativa: centralizar ahi evita duplicacion por modulo.
- Certeza nueva: `legacyRepository.ts` es el punto unico de orquestacion de intentos.

3. Pregunta: Debemos fallbackear tambien en 404 de detalle?
- Evidencia: `fetchLegacyByIdOrNull` hoy captura `HttpClientError` 404 y retorna `null` (comportamiento semantico de "no encontrado").
- Respuesta tentativa: no fallback en 404 por defecto para preservar semantica actual.
- Certeza nueva: cambiar eso implicaria cambio funcional, no solo resiliencia.

4. Pregunta: El wiring actual permite cambio incremental?
- Evidencia: `*Dependencies.ts` ya inyecta `runtimeConfig.apiBaseUrls` al factory de repositorio; repositorios no hacen fetch directo.
- Respuesta tentativa: si; la migracion quedo acotada a wiring/factory sin afectar pantallas.
- Certeza nueva: no hizo falta tocar capa de presentacion fuera de dependencias.

5. Pregunta: Hay cobertura base para evolucionar sin regresion?
- Evidencia: existen tests de `legacyRepository` y `httpClient` con 404, errores de red, timeout y parsing.
- Respuesta tentativa: si, hay base para extender casos de failover.
- Certeza nueva: podemos introducir failover con pruebas unitarias focalizadas sin e2e inicial.

## Auditoria tecnica

### Arquitectura Limpia
- Certeza: la capa `presentation` inyecta repositorios por dependencias, sin fetch directo.
- Certeza: la capa `infrastructure` encapsula endpoint/schema/mapper por modulo.
- Hallazgo: falta abstraccion explicita de politica de resiliencia en transporte.
- Decision propuesta: crear estrategia de fallback comun en shared HTTP y mantener repositorios como adaptadores finos.

### SOLID
- SRP: `runtimeConfig.ts` combina parse/env + decisiones de red; requiere extraer funciones puras para crecer limpio.
- OCP: APIs actuales reciben `baseUrl` simple; ampliar a `baseUrls` retrocompatible evita tocar logica por modulo repetidamente.
- DIP: hoy la infraestructura depende de detalle string; conviene depender de contrato de configuracion (`readonly string[]`).
- ISP/LSP: sin hallazgos criticos actuales.

### Buenas practicas TypeScript
- Certeza: tipado de errores HTTP ya existe y permite politica por tipo de error.
- Hallazgo: faltan tipos de dominio para fallback (`ApiBaseUrlPool`, predicado `shouldFallback`).
- Recomendacion: preferir funciones puras y tipos readonly para evitar estados mutables y ramificaciones ambiguas.

## Plan priorizado (estado)

- Leyenda de estado por tarea: `[x]` finalizada, `[>]` en proceso, `[ ]` pendiente.

### P0 - Refactor arquitectura/SOLID/TypeScript (antes de failover)
- [x] P0.1 Definir contrato tipado de configuracion de backends
  - Crear `apiBaseUrls: readonly string[]` en `runtimeConfig`.
  - Unificar lectura de entorno en `VITE_API_BASE_URLS`.
- [x] P0.2 Extraer funciones puras de normalizacion y deduplicacion de URLs
  - `normalizeBaseUrl`, `dedupeBaseUrls`, `resolveApiBaseUrls`.
- [x] P0.3 Diseñar contrato de politica de fallback por error
  - Predicado tipado `shouldFallback(error)` con reglas explicitas.
- [x] P0.4 Identificar punto unico de orquestacion
  - Confirmado: `legacyRepository.ts` centraliza todas las llamadas legacy.
- [x] P0.5 Reducir acoplamiento en factories de repositorio
  - Migrar firma `baseUrl` -> `baseUrls` (retrocompatible).

### P1 - Implementacion de failover 1->2->3
- [x] P1.1 Implementar secuencia de intentos en `fetchLegacyList`
  - Intentar URL1, luego URL2, luego URL3 ante error recuperable.
- [x] P1.2 Implementar secuencia de intentos en `fetchLegacyByIdOrNull`
  - Preservar `404 => null` sin fallback (default).
- [x] P1.3 Consolidar logging de failover
  - Log de intento y causa; error final consolidado sin ruido excesivo.
- [x] P1.4 Actualizar wiring de dependencias
  - Pasar `runtimeConfig.apiBaseUrls` desde `*Dependencies.ts`.
- [x] P1.5 Asegurar compatibilidad proxy/dev
  - Preservar comportamiento actual de `useDevProxyForApi`/base relativa.

### P2 - Testing, hardening y documentacion
- [x] P2.1 Extender `legacyRepository.spec.ts` con casos URL2/URL3
- [x] P2.2 Agregar casos de no-fallback para 404 detalle
- [x] P2.3 Agregar casos fallback para `HttpNetworkError`, `HttpTimeoutError`, 5xx
- [x] P2.4 Tests de runtime config para lista de URLs
- [x] P2.5 Actualizar `docs/env-vars.md` y `README.md`
- [ ] P2.6 Checklist manual por modulos (remitos, listas, comprobantes) + links de detalle

## Criterios de aceptacion
- Failover estricto y ordenado: URL1 -> URL2 -> URL3.
- Sin cambios funcionales de dominio fuera de resiliencia.
- `404` detalle mantiene semantica `null` (salvo decision explicita en contrario).
- Cobertura unitaria de fallback y configuracion agregada y en verde.
