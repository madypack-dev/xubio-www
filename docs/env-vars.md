# Política de Variables de Entorno

Resumen de la decisión tomada:

- Mantener una sola variable de entorno pública para el frontend: `VITE_API_BASE_URL`.
- Todos los demás valores (flags de depuración, observabilidad, defaults de desarrollo) se definen en código en `src/shared/config/runtimeConfig.ts`.

¿Qué poner en archivos `.env`?

- Para desarrollo local, crea `frontend-vue/.env.local` y, si necesitas, solo sobrescribe la URL del backend:

```dotenv
# frontend-vue/.env.local
VITE_API_BASE_URL=http://127.0.0.1:8000
```

¿Por qué esta restricción?

- Reduce la posibilidad de desincronización entre el build y el runtime.
- Evita confusión con flags legacy que ya no tienen efecto.
- Facilita el despliegue: menos variables que controlar como secretos/config en CI.

Operativa para despliegue CI/CD (GitHub Actions):

- Variables sensibles/secretos que sí deben configurarse en GitHub Secrets:
  - `FTP_SERVER` (host o IP del servidor FTP)
  - `FTP_SERVER_IP` (opcional, fallback por IP si DNS del host falla en el runner)
  - `FTP_USERNAME`
  - `FTP_PASSWORD`

- Variables de repositorio (Settings > Secrets and variables > Actions > Variables):
  - `VITE_API_BASE_URL` (URL del backend para el build).

- Inputs de `workflow_dispatch` (al lanzar deploy manual):
  - `deploy_protocol` (opcional, `ftp` por defecto; usar `sftp` si tu hosting no expone puerto 21).
  - `deploy_port` (opcional; si no se define, usa `21` para `ftp` y `22` para `sftp`).

- El workflow de deploy usa estas secrets y sube `./dist/` a `public_html/xubio-www/`.

Selección de protocolo en deploy:

- `DEPLOY_PROTOCOL=ftp`: despliega con `SamKirkland/FTP-Deploy-Action`.
- `DEPLOY_PROTOCOL=sftp`: despliega con `appleboy/scp-action` por puerto SSH.
- El workflow ejecuta una validación previa (presence de secrets, resolución DNS y reachability del puerto objetivo) para fallar temprano con mensajes claros.

Notas adicionales:

- Si necesitás habilitar observabilidad en un entorno concreto lo ideal es crear una PR que añada un override explícito y documentado en `runtimeConfig.ts` o que reintroduzcamos una variable única `VITE_OBSERVABILITY_ENDPOINT` como excepción.
- Para pruebas puntuales se puede instrumentar `runtimeConfig.ts` para leer variables opcionales, pero por ahora preferimos la simplicidad.
