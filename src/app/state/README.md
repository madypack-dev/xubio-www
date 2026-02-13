# Estado de la aplicacion

Regla principal:

- `TanStack Query` para estado de servidor (listas, detalles, cache, stale/retry).
- `Pinia` para estado de UI (modulo activo, banners, toggles, filtros de pantalla).

Reglas operativas:

1. No guardar en Pinia respuestas completas de API.
2. Si un dato viene del backend, se lee desde `useQuery`/cache.
3. Pinia puede guardar IDs seleccionados, flags de interfaz y preferencias locales.
4. Los `queryKeys` se centralizan en `src/shared/lib/queryKeys.ts`.
