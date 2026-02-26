# Informe Frontend -> Backend
## Integracion Login Google (OIDC + session cookie HttpOnly)

Fecha: 2026-02-26  
Proyecto: Xubio Web (Vue 3 + TypeScript)

## 1. Objetivo

Definir el contrato backend necesario para habilitar autenticacion con Google usando:

- OIDC (Authorization Code + PKCE en backend).
- Sesion de aplicacion gestionada por backend.
- Cookie de sesion `HttpOnly` (sin tokens en `localStorage/sessionStorage`).

El frontend ya fue preparado para consumir este contrato.

## 2. Estado actual en frontend

Implementado:

- Ruta publica `/login` con boton "Continuar con Google".
- Guard de rutas con `meta.requiresAuth`.
- Redireccion a `/login?redirect=...` para rutas protegidas.
- Repositorio auth HTTP y query de sesion.
- Wiring de dependencias para auth.

Nota operativa:

- La autenticacion esta desactivada por default (`authEnabled: false`) hasta validar backend.
- Endpoints asumidos e implementados en frontend:
  - `GET /auth/session`
  - `POST /auth/login/google`
  - `POST /auth/logout`

## 3. Contrato HTTP esperado

### 3.1 GET /auth/session

Uso:

- Consultar sesion actual del navegador.
- Debe funcionar con cookie de sesion existente.

Request:

- Metodo: `GET`
- Headers: `Accept: application/json`
- Cookie: enviada por navegador cuando corresponda.

Response esperada:

- `200 OK`
- `Content-Type: application/json`

Ejemplo autenticado:

```json
{
  "authenticated": true,
  "user": {
    "id": "usr_123",
    "email": "usuario@dominio.com",
    "name": "Nombre Apellido",
    "pictureUrl": "https://..."
  }
}
```

Ejemplo no autenticado:

```json
{
  "authenticated": false,
  "user": null
}
```

Consideraciones:

- Si backend devuelve `401`, el frontend lo tratara como no autenticado.
- Recomendado mantener `200` con payload consistente para simplificar clientes.

### 3.2 POST /auth/login/google

Uso:

- Iniciar flujo OIDC desde backend.
- Backend construye URL de autorizacion de Google.

Request:

- Metodo: `POST`
- Body JSON:

```json
{
  "redirectPath": "/remitos"
}
```

`redirectPath`:

- Path relativo interno al frontend (ej. `/remitos`, `/clientes?...`).
- Backend debe validarlo (whitelist/internal-only) para evitar open redirect.

Response esperada:

- `200 OK`
- `Content-Type: application/json`
- Payload con URL de redireccion:

```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

Alternativa aceptada:

```json
{
  "redirectUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

Fallback frontend:

- Si no viene `url/redirectUrl`, frontend usara `/auth/login/google` como URL de navegacion.

### 3.3 POST /auth/logout

Uso:

- Cerrar sesion backend y limpiar cookie.

Request:

- Metodo: `POST`
- Body JSON vacio: `{}`

Response esperada:

- `200 OK` o `204 No Content`.

Comportamiento backend:

- Invalidar sesion server-side.
- Expirar cookie con mismos atributos de emision.

## 4. Flujo funcional end-to-end

1. Usuario accede a ruta protegida (ej. `/remitos`).
2. Guard frontend consulta sesion (`GET /auth/session`).
3. Si no autenticado:
   - Redirige a `/login?redirect=/remitos`.
4. Usuario hace click en "Continuar con Google":
   - Frontend llama `POST /auth/login/google` con `redirectPath`.
   - Frontend navega a URL devuelta por backend.
5. Google autentica y retorna a callback backend.
6. Backend:
   - valida `state`/`nonce`/PKCE.
   - crea sesion interna.
   - emite cookie HttpOnly.
   - redirige al frontend con ruta segura (`redirectPath` validada).
7. Frontend vuelve a consultar `/auth/session` y habilita acceso.

## 5. Requisitos de seguridad backend

## 5.1 Cookie de sesion

Requerido:

- `HttpOnly`
- `Secure` (en HTTPS real)
- `SameSite=Lax` (o `Strict` si el flujo lo permite)
- `Path=/`

Recomendado:

- TTL corta + renovacion controlada.
- Rotacion de identificador de sesion post-login.

## 5.2 OIDC

Requerido:

- Authorization Code flow.
- Validacion estricta de `state`.
- Validacion de `nonce` (si aplica en implementacion elegida).
- PKCE validado en backend.
- Validar `iss`, `aud`, `exp` del ID token.

## 5.3 Redirect safety

Requerido:

- No aceptar URLs absolutas externas en `redirectPath`.
- Permitir solo rutas internas conocidas (`/...`).
- Sanitizar/normalizar valores de retorno.

## 5.4 CORS/CSRF

Si frontend y backend quedan en distinto origen:

- Configurar CORS para origen exacto del frontend.
- Permitir credenciales (`Access-Control-Allow-Credentials: true`).
- No usar `*` cuando hay credenciales.
- Evaluar proteccion CSRF para endpoints mutables (`POST /auth/logout` y otros de negocio autenticados).

Si frontend y backend comparten origen:

- Preferible por simplicidad operativa y menor superficie CORS.

## 6. Manejo de errores esperado

`/auth/session`:

- `200` con `authenticated:false` en no autenticado (preferido).
- `401` aceptable, frontend lo interpreta como no autenticado.

`/auth/login/google`:

- `400` si `redirectPath` invalido.
- `500` en error interno/proveedor.
- body JSON con `message` legible.

`/auth/logout`:

- `200/204` aun si no habia sesion activa (idempotencia recomendada).

## 7. Observabilidad y trazabilidad

Recomendado:

- Correlation ID por request auth.
- Logs estructurados en eventos:
  - `auth.login.start`
  - `auth.login.callback.success`
  - `auth.login.callback.failure`
  - `auth.session.read`
  - `auth.logout`
- Nunca loggear tokens/cookies.

## 8. Checklist de validacion conjunta

Backend:

- [ ] Endpoints implementados con contrato acordado.
- [ ] Cookie HttpOnly segura en login.
- [ ] Callback OIDC validando `state`/PKCE.
- [ ] Redirect interno validado.

Frontend:

- [ ] Activar `authEnabled` al confirmar entorno backend.
- [ ] Verificar redirecciones con `redirect`.
- [ ] Verificar logout e invalidacion de sesion.

QA:

- [ ] Ruta protegida sin sesion redirige a login.
- [ ] Login Google vuelve a ruta original.
- [ ] Logout bloquea rutas protegidas.
- [ ] Sesion expirada vuelve a login sin loops.

## 9. Riesgos abiertos

- Definicion de entorno final (dominio/protocolo) pendiente para cerrar politica cookie definitiva (`Secure`, `SameSite`) y CORS exacto.
- Falta cobertura automatizada especifica de auth en frontend (pendiente en backlog).

## 10. Siguientes pasos

1. Backend confirma payload final de `/auth/session`, `/auth/login/google`, `/auth/logout`.
2. Frontend ajusta mapeos si hubiese diferencia de nombres de campos.
3. Activar `authEnabled` para entorno objetivo.
4. Ejecutar smoke conjunto y luego cobertura automatizada auth.
