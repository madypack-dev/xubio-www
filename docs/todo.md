(The file `/home/agustin/proyectos_software/xubio-www/docs/todo.md` exists, but is empty)
# TODO / Cambios recientes

Se documentan aquí los cambios relacionados con la simplificación de variables de entorno.

- Reducir variables de entorno: dejar solo `VITE_API_BASE_URL` como variable soportada.
- Eliminar flags legacy de `.env.example` (`VITE_USE_MOCKS`, `VITE_FALLBACK_TO_MOCKS_ON_ERROR`).
- Mover defaults de observabilidad y flags de debug a `src/shared/config/runtimeConfig.ts`.
- Actualizar `README.md` y añadir `docs/env-vars.md` con la política y pasos operativos.
- Ajustar `npm run build` para compilar directo en `/var/www/html/xubio-www` (Apache).
- Documentar workaround de permisos (`EACCES`) para builds locales a Apache.
- Generar informe para backend sobre bloqueo CORS en build local con Apache (`docs/backend-cors-informe.md`).

Próximos pasos:

- Validar que los equipos operativos conocen los secretos GitHub requeridos para deploy (FTP_SERVER, FTP_USERNAME, FTP_PASSWORD).
- Documentar en el README o en `AGENTS.md` el procedimiento de despliegue si hace falta.
