# TODO tecnico

Convenciones de estado:
- `[ ]` pendiente
- `[>]` en proceso
- `[x]` finalizado

Directriz activa (2026-02-13):
- No tomar nuevas tareas sobre legacy (`js/*`, `index.html`) salvo incidentes criticos.
- Priorizar exclusivamente migracion y hardening de `frontend-vue/`.

## Finalizado

- [x] Crear documentacion base del proyecto (`README.md`).
- [x] Crear guia operativa para agentes (`AGENTS.md`).
- [x] Crear documento de arquitectura actual (`docs/ARQUITECTURA.md`).
- [x] Completar auditoria tecnica inicial (Clean Architecture, SOLID, DDD, patrones).
- [x] Definir plan macro de migracion a Vue 3 + TypeScript.
- [x] Ajustar UX de tabla de Remitos en Vue (columnas de payload, fecha `DD/MM/YYYY`, seleccion por `transaccionId` y enlaces en IDs).

## Alta prioridad

- [x] Definir ADR-001 de arquitectura objetivo para frontend Vue 3 + TypeScript.
  Que hacer: documentar capas (`presentation`, `application`, `domain`, `infrastructure`), reglas de dependencia y limites por modulo.
- [x] Crear base del nuevo frontend con Vite + Vue 3 + TypeScript.
  Que hacer: inicializar proyecto, configurar `tsconfig`, scripts de build/test y estructura de carpetas por modulos.
- [x] Estandarizar gestion de estado.
  Que hacer: usar `TanStack Query` para estado de servidor y `Pinia` para estado de UI, evitando duplicar datos remotos.
- [x] Implementar capa HTTP robusta.
  Que hacer: centralizar cliente HTTP con timeout, cancelacion (`AbortController`), parser de errores y tipado de respuestas.
- [x] Implementar anti-corruption layer para APIs legacy.
  Que hacer: crear mappers tipados y validacion runtime de payloads para remitos, clientes, productos, listas y comprobantes.
- [x] Corregir estrategia de navegacion de historial.
  Que hacer: reemplazar dependencia de `window.history.length` por reglas de historial in-app y fallback consistente de ruta.
- [x] Crear smoke tests E2E del frontend Vue.
  Que hacer: cubrir flujos minimos de seleccion de modulo, detalle de remito, detalle de cliente/producto y comprobante.
- [x] Unificar render de estados async en Vue.
  Que hacer: crear componentes reutilizables para `loading`, `error`, `empty`, `not_found` y eliminar repeticion de logica en paginas Vue.

## Media prioridad

- [x] Migrar modulo Lista de Precios a Vue 3 + TypeScript.
  Que hacer: implementar pagina, tabla, estados de carga/error/vacio y consumo de repositorio tipado.
- [x] Migrar modulo Comprobantes de Venta (lista + detalle).
  Que hacer: implementar vista de lista, seleccion de comprobante, detalle y navegacion de retorno.
- [x] Migrar flujo Remitos (lista + item + cliente + producto).
  Que hacer: implementar drill-down completo con rutas equivalentes a query params legacy.
- [x] Eliminar duplicacion entre capas de datos en Vue (`infrastructure`/`shared/lib`).
  Que hacer: consolidar responsabilidades de acceso y transformacion de datos, borrando codigo no referenciado.
- [x] Formalizar modelo de dominio minimo en Vue.
  Que hacer: definir entidades y value objects clave (`TransaccionId`, `ClienteId`, `ProductoId`, `FechaComercial`, `Money`).

## Baja prioridad

- [x] Implementar tema visual AS400 (IBM) sobre Bootstrap.
  Resuelto (2026-02-13): tokens CSS centralizados, tipografia monoespaciada, tablas densas y estados visuales accesibles en `frontend-vue/src/shared/design/theme.css`.
- [x] Mejorar accesibilidad de tablas y acciones.
  Resuelto (2026-02-13): navegacion por teclado en acciones, foco visible global, contraste reforzado, skip-link, labels de formularios y ARIA en tablas/mensajes async.
- [x] Optimizar performance para datasets grandes.
  Resuelto (2026-02-13): paginacion reutilizable para render acotado de tablas de alto volumen (`usePaginatedRows` + `DataPaginationControls`) en remitos/listas/comprobantes.
- [x] Agregar observabilidad frontend.
  Resuelto (2026-02-13): captura de errores JS globales, metricas de carga/navegacion y timings HTTP con muestreo y endpoint configurable.

## Decisiones cerradas (2026-02-13)

- [x] Backend de observabilidad destino definido.
  Decision: enviar eventos a backend en `localhost:8000` via `VITE_OBSERVABILITY_ENDPOINT` (MVP: endpoint configurable por entorno).
- [x] Estrategia de performance para volumen extremo definida.
  Decision: mantener paginacion cliente actual en esta fase MVP; postergar paginacion server-side hasta requerimiento real.

## En proceso

- [>] Mantener este backlog actualizado por sprint.
  Estado (2026-02-13): pendientes de baja prioridad movidos a finalizado; dudas abiertas registradas para decision funcional/infra.
  Que hacer: mover tareas entre estados, agregar fechas y responsables, y descomponer items grandes en subtareas ejecutables.

## Fuera de alcance temporal (legacy)

- [ ] Reducir complejidad del controlador actual (`js/controllers/appController.js`).
  Que hacer: pausar hasta definir estrategia de deprecacion legacy; no ejecutar mientras rija directriz Vue-first.
