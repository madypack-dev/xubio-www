# AGENTS.md

Guia para agentes que trabajen en este repositorio.

## Objetivo del proyecto

Aplicacion web estatica para visualizar informacion comercial (remitos, clientes, productos, listas de precios y comprobantes de venta) consumiendo endpoints REST.

## Stack y contexto tecnico

- Frontend sin framework: HTML + CSS + JavaScript ES Modules
- Sin build step, sin package manager obligatorio
- Bootstrap via CDN en `index.html`
- Estado global in-memory en `js/state/store.js`

## Principios de trabajo

1. Mantener arquitectura por capas ya existente.
2. Evitar mezclar renderizado DOM con logica de negocio.
3. No introducir dependencias ni tooling pesado sin pedido explicito.
4. Conservar compatibilidad con ejecucion estatica (`python -m http.server`).
5. Preferir cambios pequenos y trazables por archivo.

## Mapa de capas

- `js/controllers`: orquestacion de UI, estado y repositorios
- `js/state`: store y maquina de modos
- `js/router`: sincronizacion URL <-> estado
- `js/repositories`: estrategia de datos (HTTP/mock)
- `js/application`: casos de uso
- `js/services`: acceso HTTP y helpers de servicio
- `js/domain/mappers`: normalizacion de payloads API
- `js/ui`: referencias DOM y renderers
- `js/config`: endpoints, columnas, mensajes, fallback

## Reglas de cambio

1. Si agregas campos nuevos:
   - ajustar mapper en `js/domain/mappers/*`
   - ajustar columnas en `js/config/columns.js` (si se renderiza en tabla)
2. Si agregas un modulo/vista:
   - actualizar `MODES` y transiciones en `js/state/modeMachine.js`
   - actualizar `renderView()` y eventos en `js/controllers/appController.js`
   - agregar nodos necesarios en `index.html` y `js/ui/dom.js`
3. Si cambias rutas query:
   - mantener consistencia en lectura/escritura en `js/router/queryState.js`
   - validar comportamiento de `back`/`show all`
4. Si cambias llamadas API:
   - priorizar ajuste en `js/repositories/index.js`
   - manejar `404` con `null` donde aplique

## Checklist minimo antes de cerrar cambios

1. Levantar servidor local y abrir `http://localhost:5500`.
2. Probar seleccion de modulo:
   - Remito de venta
   - Listado de precios
   - Comprobante de venta
3. Validar links de detalle:
   - transaccion -> items
   - cliente
   - producto
   - comprobante
4. Validar estado de carga/error/not-found en al menos una entidad.
5. Validar navegacion con `back` y query params.

## Comandos utiles

```powershell
python -m http.server 5500
```

```powershell
rg --files
```

```powershell
rg -n "texto_a_buscar" js
```

## No hacer

- No reescribir todo a framework.
- No mover IDs del HTML sin actualizar `js/ui/dom.js`.
- No acoplar fetch directo dentro de `renderers`.
- No romper el soporte de modo mock/fallback existente.
