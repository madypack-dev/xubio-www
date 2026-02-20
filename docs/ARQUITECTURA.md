# Arquitectura tecnica

Este documento describe la arquitectura actual y el flujo de datos de la app.

## 1. Vision general

La app es un frontend estatico que consume API REST y renderiza tablas por modulo.

Modulos funcionales:

- Remito de venta
- Listado de precios
- Comprobante de venta
- Detalles de cliente y producto

## 2. Flujo de inicializacion

1. `app.js` ejecuta `initApp()`.
2. `initApp()`:
   - obtiene referencias DOM (`getDomRefs`)
   - crea repositorios (`createRepositories`)
   - suscribe `renderView` al store
   - enlaza eventos (`bindEvents`, `bindLocationEvents`)
   - carga remitos iniciales (`loadRemitos`)

## 3. Capas y responsabilidades

## UI (`js/ui`)

- `dom.js`: contrato de nodos obligatorios del HTML
- `renderers.js`: render de tablas, mensajes y secciones

## Estado (`js/state`)

- `store.js`: estado global y mutaciones
- `modeMachine.js`: modos y transiciones permitidas

Estados relevantes:

- `mainTable`
- `selectedTransaccionId`
- `clienteDetail`
- `productoDetail`
- `listaPrecios`
- `comprobantesVenta`
- `comprobanteVentaDetail`
- `banner`

## Router (`js/router`)

- `queryState.js` sincroniza estado con query params (`remitoVenta`, `cliente`, `producto`)
- Mantiene indice interno de historial para detectar navegacion in-app

## Orquestacion (`js/controllers`)

- `appController.js` conecta eventos UI, estado, rutas y repositorios
- Usa request trackers para evitar race conditions en cargas async

## Dominio (`js/domain`)

- `mappers/*.js` normalizan payloads inconsistentes de API
- `dateUtils.js` estandariza parseo/ordenamiento/formato de fechas

## Datos (`js/repositories` + `js/services`)

- `repositories/index.js` decide modo `http` o `mock`
- `services/httpClient.js` centraliza `fetch` y errores HTTP

## 4. Estrategia de datos

`createRepositories()` resuelve modo:

1. Query `mock=1|true`
2. `window.__USE_MOCKS__ === true`
3. `localStorage.USE_MOCKS === "true"`
4. fallback: modo `http`

En modo HTTP:

- se consumen endpoints de `js/config/endpoints.js`
- se normaliza respuesta con mappers

En modo mock:

- remitos usan `FALLBACK_REMITOS`
- resto de entidades devuelven listas vacias o `null`

## 5. Render y navegacion

La vista activa depende de `mainTable`.

- `none`: estado vacio
- `listaPrecio`: tabla de listas
- `comprobanteVenta`: tabla + posible detalle
- `remito/cliente/producto`: flujo remito con drill-down

Acciones UI clave:

- Select principal de modulo
- Click en links de tabla (`transaccion`, `cliente`, `producto`, `comprobante`)
- Boton `Volver`
- Boton `Ver todos`

Cada accion actualiza estado + URL y dispara re-render.

## 6. Extension segura

Para agregar un nuevo campo desde API hasta UI:

1. Extender mapper correspondiente en `js/domain/mappers`.
2. Extender columnas en `js/config/columns.js` si va a tabla.
3. Ajustar renderer solo si hay logica condicional nueva.

Para agregar un nuevo modulo:

1. Declarar modo en `modeMachine.js`.
2. Crear estado en `store.js` (si aplica).
3. Integrar carga de datos y eventos en `appController.js`.
4. Crear secciones HTML + refs en `dom.js`.
5. Crear renderizador dedicado en `renderers.js`.

## 7. Riesgos tecnicos actuales

- No hay suite automatica de tests.
- Dependencia a estructura de payload API sin contratos tipados.
- Muchas secciones DOM dependen de IDs exactos (acoplamiento fuerte).

## 8. Recomendaciones de evolucion

1. Incorporar tests unitarios para mappers y `dateUtils`.
2. Agregar smoke tests de navegacion basica.
3. Definir contrato de API (OpenAPI o schemas JSON) para validar mappers.

## 9. Build y salida de artefactos

- El build de produccion del frontend (`npm run build`) esta configurado para escribir en `/var/www/html/xubio-www` (directorio servido por Apache).
- En entornos locales, si el directorio no existe o no tiene permisos de escritura para el usuario actual, el build falla con `EACCES`.
- La preparacion de permisos se documenta en `docs/env-vars.md`.
