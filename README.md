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

Variables de entorno Vue (opcionales):

- No hace falta `.env` para correr el proyecto.
- Los defaults estan hardcodeados en `frontend-vue/src/shared/config/runtimeConfig.ts` y `frontend-vue/vite.config.ts`.
- Si necesitas override, crea `frontend-vue/.env.local` con las claves que quieras cambiar.

Claves disponibles:

- `VITE_API_BASE_URL`: base URL real del backend.
- `VITE_OBSERVABILITY_ENABLED`: `auto/true/false` para captura de errores y metricas.
- `VITE_OBSERVABILITY_ENDPOINT`: endpoint HTTP opcional para recibir eventos de frontend.
- `VITE_OBSERVABILITY_SAMPLE_RATE`: muestreo `0..1` para limitar volumen de eventos.

Decisiones MVP vigentes:

- Performance de tablas: paginacion cliente (sin server-side por ahora).
- Observabilidad: backend local en `localhost:8000` con endpoint configurable por entorno.
- Contrato backend observado: `POST /observability/events` responde `202` (ok), `400` (payload invalido), `415` (content-type invalido), `413` (payload grande).

Nota CORS en desarrollo:

- Si `VITE_API_BASE_URL` es absoluto (ej. `http://127.0.0.1:8000`),
  el frontend usa proxy de Vite para `/API` y evita CORS.
- Para desarrollo local se recomienda `127.0.0.1` en lugar de `localhost` para evitar problemas de proxy por IPv6 (`::1`).
- El modo mock/fallback del frontend Vue esta deshabilitado.

Nota produccion:

- Si frontend y backend se sirven en el mismo origen (ej. `http://localhost:8000`), deja
  `VITE_API_BASE_URL` vacio para usar rutas relativas (`/API/...`).

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
