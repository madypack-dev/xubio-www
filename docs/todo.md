# TODO (pendiente)

## 1) Pendiente heredado (failover)

- [ ] P2.6 Checklist manual por modulos (remitos, listas, comprobantes) + links de detalle.

## 2) Google Login (nuevo)

### Objetivo
- Incorporar autenticacion con Google para proteger rutas de la app y consumir APIs con sesion valida.

### Archivos involucrados (certeza)
- `src/app/router/index.ts`
- `src/main.ts`
- `src/App.vue`
- `src/shared/config/runtimeConfig.ts`
- `src/shared/lib/http/httpClient.ts`
- `src/app/providers/installPlugins.ts`
- `src/app/providers/queryClient.ts`
- `index.html`
- `vite.config.ts`
- `src/test/app.spec.ts`
- `src/test/httpClient.spec.ts`

### Auditoria resumida (certezas)
- No existe capa de autenticacion/autorizacion actual en frontend.
- No hay guard de rutas por sesion (`requiresAuth`) en router.
- No hay store de identidad (usuario/sesion/tokens).
- No hay flujo OAuth/OIDC implementado.
- `vite.config.ts` usa `secure: false` en proxy dev; aceptable en desarrollo, no apto como referencia de produccion.
- `index.html` no define CSP ni politicas de seguridad de cabeceras (esto normalmente se completa en servidor/CDN, pero debe documentarse).
- `httpClient.ts` tiene saneo de logs de secretos (positivo), pero aun no contempla estrategia de autenticacion (cookies HttpOnly o Bearer).
- Cobertura de tests para autenticacion es inexistente (solo hay tests de routing/utilidades/transporte generico).

### Tareas propuestas (pendientes)
- [ ] Definir estrategia de sesion:
  - OIDC Authorization Code + PKCE.
  - Sesion backend con cookie HttpOnly `Secure; SameSite=Lax/Strict`.
- [ ] Crear modulo `auth` por capas:
  - `src/modules/auth/domain/*`
  - `src/modules/auth/application/*`
  - `src/modules/auth/infrastructure/*`
  - `src/modules/auth/presentation/*`
- [ ] Agregar estado de sesion (Pinia):
  - usuario autenticado, loading, error, expiracion, logout.
- [ ] Router guards:
  - ruta publica `/login`.
  - rutas de negocio protegidas con `meta.requiresAuth`.
  - redireccion a login y retorno seguro (`redirect` whitelisteado).
- [ ] UI:
  - pantalla `/login` con boton "Continuar con Google".
  - estado de usuario en header + accion logout.
- [ ] Integrar `httpClient` con credenciales:
  - si sesion cookie: `credentials: "include"` (solo para origenes permitidos).
  - manejo consistente de `401/403` -> invalidar sesion + redirigir.
- [ ] Hardening seguridad:
  - politica CSP documentada y aplicada en server.
  - validacion estricta de `state`/`nonce` y redirect URIs.
  - no persistir tokens en `localStorage`/`sessionStorage`.
- [ ] Testing:
  - unit tests de store auth y guards.
  - tests de `httpClient` para `401/403`.
  - smoke de login/logout y acceso a rutas protegidas.

### Dudas abiertas (requieren definicion)
- [ ] Confirmar proveedor de identidad:
  - Google directo (GIS) o Google via broker (Auth0/Keycloak/Firebase Auth).
- [ ] Confirmar dominio final y entorno:
  - para definir `Secure`, `SameSite`, callback URL y CORS exactos.

### Decisiones cerradas
- [x] Estrategia de sesion: OIDC + backend session cookie HttpOnly.
- [x] No persistir tokens en `localStorage`/`sessionStorage`.
