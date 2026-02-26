# Integracion Xubio-like (FITBA)

Este repositorio contiene dos frontends:

- Legacy (actual): HTML + JavaScript modular en la raiz (`index.html`, `app.js`, `js/`)
- Nuevo (migracion): Vue 3 + TypeScript en `frontend-vue/`

## Requisitos

- Node.js 20+
- npm 10+
- Python 3.x (opcional, para levantar el legacy rapido)

## Importante sobre npm

En la raiz del repo no hay `package.json` del frontend Vue.
Por eso `npm run dev` en `C:\proyectos_software\madypack-dev\calidad_FITBA-www` da `ENOENT`.

Usa npm dentro de `frontend-vue/`.

## Ejecutar frontend Vue (nuevo)

```powershell
cd .\frontend-vue
npm install
npm run dev
```

Alternativa sin cambiar de carpeta:

```powershell
npm --prefix .\frontend-vue install
npm --prefix .\frontend-vue run dev
```

Scripts disponibles en Vue:

- `npm run dev`
- `npm run build`
- `npm run typecheck`
- `npm run test:run`
- `npm run test:coverage`

Variables de entorno Vue (política actualizada):

- No es obligatorio definir `.env` para levantar el proyecto: los defaults se mantienen en código.
- Ruta de defaults: `frontend-vue/src/shared/config/runtimeConfig.ts` y `frontend-vue/vite.config.ts`.
- Política: se soportan:
  - `VITE_API_BASE_URLS` (lista para failover, hasta 3 URLs).
  - `VITE_AUTH_ENABLED` (`true/false`) para activar/desactivar guard de autenticación.

Soporte actual:

- `VITE_API_BASE_URLS`: lista CSV de URLs backend para failover ordenado `URL1 -> URL2 -> URL3`.
- `VITE_AUTH_ENABLED`: habilita autenticación en frontend (`true`) o la deshabilita (`false`).
- Si `VITE_API_BASE_URLS` no está definida, el runtime usa un fallback hardcodeado temporal:
  - `https://api.madygraf.local/`
  - `https://10.176.61.33:8000/`
  - `https://confined-unexcused-garland.ngrok-free.dev/`

Valor por defecto de auth:

- `VITE_AUTH_ENABLED` no definido -> `false` (auth desactivada).

Ejemplo (`.env.local`):

```dotenv
VITE_API_BASE_URLS=http://127.0.0.1:8001
VITE_AUTH_ENABLED=true
```

Nota operativa:

- Las variables relacionadas con observabilidad y flags de depuración se gestionan desde `runtimeConfig.ts` como valores por defecto y NO se recomiendan como variables de entorno para evitar inconsistencias entre builds.
- Si necesitás crear una excepción (por ejemplo, permitir `VITE_OBSERVABILITY_ENDPOINT` en un entorno de staging), pedirlo y lo documentamos explícitamente.

Decisiones MVP vigentes:

- Performance de tablas: paginacion cliente (sin server-side por ahora).
- Observabilidad: backend local en `localhost:8000` con endpoint configurable por entorno.
- Contrato backend observado: `POST /observability/events` responde `202` (ok), `400` (payload invalido), `415` (content-type invalido), `413` (payload grande).

Nota CORS en desarrollo:

- Si la primera URL resuelta en `VITE_API_BASE_URLS` es absoluta (ej. `http://127.0.0.1:8000`),
  el frontend usa proxy de Vite para `/API` y evita CORS.
- Para desarrollo local se recomienda `127.0.0.1` en lugar de `localhost` para evitar problemas de proxy por IPv6 (`::1`).
- El modo mock/fallback del frontend Vue esta deshabilitado.

Nota produccion:

- Si frontend y backend se sirven en el mismo origen (ej. `http://localhost:8000`), deja vacia la configuración de backend
  para usar rutas relativas (`/API/...`).

## Ejecutar frontend legacy (actual)

Desde la raiz:

```powershell
python -m http.server 5500
```

Abrir:

```text
http://localhost:5500
```

## Estructura principal

```text
.
|-- index.html
|-- app.js
|-- js/
|-- frontend-vue/
|   |-- src/
|   |-- package.json
|   `-- vite.config.ts
`-- docs/
```

## Legacy: configuracion de endpoints

Archivo: `js/config/endpoints.js`

```js
export const API_ENDPOINTS = {
  remitos: "/API/1.1/remitoVentaBean",
  clientes: "/API/1.1/clienteBean",
  productos: "/API/1.1/ProductoVentaBean",
  listaPrecios: "/API/1.1/listaPrecioBean",
  comprobantesVenta: "/API/1.1/comprobanteVentaBean"
};
```

## Legacy: modo mock y fallback

- Remitos tiene fallback local en `js/config/fallbacks.js` si falla la API.
- Repositorios pueden forzarse en modo mock con:
  - Query param: `?mock=1` o `?mock=true`
  - `window.__USE_MOCKS__ = true`
  - `localStorage.setItem("USE_MOCKS", "true")`

## Documentacion adicional

- Backlog tecnico: `docs/todo.md`
- ADR de arquitectura Vue: `docs/adr/ADR-001-frontend-vue3-ts-architecture.md`
- Detalle tecnico actual: `docs/ARQUITECTURA.md`
- Informe backend MVP (observabilidad): `docs/INFORME_BACKEND_MVP.md`
- Guia operativa: `AGENTS.md`
