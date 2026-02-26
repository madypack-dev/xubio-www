# DONE

## Backend failover de 3 URLs (cerrado)

- Fecha de cierre tecnico: 2026-02-25
- Resultado: refactor + failover implementados, tests unitarios en verde y `typecheck` en verde.

### Tareas completadas movidas desde `docs/todo.md`

#### P0 - Refactor arquitectura/SOLID/TypeScript
- [x] P0.1 Definir contrato tipado de configuracion de backends.
- [x] P0.2 Extraer funciones puras de normalizacion y deduplicacion de URLs.
- [x] P0.3 Diseñar contrato de politica de fallback por error.
- [x] P0.4 Identificar punto unico de orquestacion.
- [x] P0.5 Reducir acoplamiento en factories de repositorio.

#### P1 - Implementacion failover 1->2->3
- [x] P1.1 Secuencia de intentos en `fetchLegacyList`.
- [x] P1.2 Secuencia de intentos en `fetchLegacyByIdOrNull`.
- [x] P1.3 Logging de failover consolidado.
- [x] P1.4 Wiring de dependencias actualizado.
- [x] P1.5 Compatibilidad proxy/dev preservada.

#### P2 - Testing y documentacion
- [x] P2.1 Extender `legacyRepository.spec.ts` para URL2/URL3.
- [x] P2.2 Casos no-fallback para 404 detalle.
- [x] P2.3 Casos fallback para red/timeout/5xx.
- [x] P2.4 Tests runtime config para lista de URLs.
- [x] P2.5 Actualizar `docs/env-vars.md` y `README.md`.

### Evidencia de cierre (resumen)
- Contrato multi-backend operativo con `VITE_API_BASE_URLS` (hasta 3 URLs).
- Fallback centralizado en `src/shared/lib/http/legacyRepository.ts`.
- Semantica de `404` detalle preservada (`null` sin fallback).
