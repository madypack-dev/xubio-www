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

## Google Login (parcial implementado)

- Fecha de avance: 2026-02-26

### Tareas completadas
- [x] Definir estrategia de sesion OIDC + backend session cookie HttpOnly.
- [x] Crear modulo `auth` por capas (frontend):
  - `src/modules/auth/domain/index.ts`
  - `src/modules/auth/application/*`
  - `src/modules/auth/infrastructure/*`
  - `src/modules/auth/presentation/*`
- [x] Crear pantalla `/login` con boton "Continuar con Google".
- [x] Agregar ruta publica `/login`.
- [x] Agregar `meta.requiresAuth` en rutas de negocio.
- [x] Guard de router con redireccion a login y retorno por `redirect`.
- [x] Wiring de dependencias `auth` en `main.ts`.

### Notas
- `auth` queda desactivado por defecto (`runtimeConfig.authEnabled = false`) para evitar romper el flujo actual hasta cerrar contrato backend.
- Endpoints asumidos temporalmente en frontend:
  - `GET /auth/session`
  - `POST /auth/login/google`
  - `POST /auth/logout`
