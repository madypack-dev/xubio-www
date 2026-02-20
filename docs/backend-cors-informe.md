# Informe para Backend: bloqueo CORS en entorno local con build Apache

## Resumen ejecutivo

El frontend compilado y servido en `http://localhost` no puede consumir el endpoint de remitos publicado en ngrok por una falla de CORS en preflight.

Error observado en navegador:

- `Access to fetch at 'https://confined-unexcused-garland.ngrok-free.dev/API/1.1/remitoVentaBean' from origin 'http://localhost' has been blocked by CORS policy`
- `Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource`

## Contexto técnico

- Frontend: build de producción servido por Apache en `http://localhost` (`/var/www/html/xubio-www`).
- API target configurada en build: `https://confined-unexcused-garland.ngrok-free.dev`.
- Request afectada: `GET /API/1.1/remitoVentaBean`.
- La app en dev puede funcionar por proxy de Vite, pero en build local (Apache) el navegador aplica CORS contra el backend remoto.

## Síntomas en frontend

- Fallo de carga de remitos (`remitos.list`).
- Logs de error de repositorio y query en frontend.
- Pantalla sin datos por error de red/CORS.

## Diagnóstico

La preflight (`OPTIONS`) no retorna cabeceras CORS válidas para el origen `http://localhost`.

Falta al menos:

- `Access-Control-Allow-Origin: http://localhost` (o política equivalente permitida)

Y según el request real, usualmente también se requieren:

- `Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization, ngrok-skip-browser-warning, ...`

## Requerimiento al equipo backend

1. Habilitar CORS para `http://localhost` en el entorno expuesto por ngrok (incluyendo preflight `OPTIONS`).
2. Verificar que el upstream/backend no elimine cabeceras CORS agregadas por middleware.
3. Confirmar política para entornos de prueba:
   - opción A: whitelist explícita de orígenes de QA/dev,
   - opción B: estrategia temporal controlada para túnel ngrok.
4. Validar endpoint de remitos con preflight desde navegador real.

## Criterio de aceptación

- Desde navegador en `http://localhost`, la request a `https://<ngrok>/API/1.1/remitoVentaBean` deja de fallar por CORS.
- El módulo de remitos carga datos en build local sin errores de preflight.

## Nota de arquitectura (alternativa)

Si backend decide no abrir CORS para localhost, se puede operar vía mismo origen usando reverse proxy Apache:

- `http://localhost/API/*` -> proxy a backend remoto/ngrok.

Esto evita CORS en navegador, pero agrega dependencia de infraestructura local.
