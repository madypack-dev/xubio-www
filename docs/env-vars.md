# Política de Variables de Entorno

Resumen de la decisión tomada:

- Mantener una configuración de backend acotada:
  - `VITE_API_BASE_URLS` para failover ordenado (hasta 3 URLs).
  - `VITE_AUTH_ENABLED` para activar/desactivar autenticación frontend.
- Si `VITE_API_BASE_URLS` no está definida, la app usa un fallback hardcodeado temporal:
  - `https://api.madygraf.local/`
  - `https://10.176.61.33:8000/`
  - `https://confined-unexcused-garland.ngrok-free.dev/`
- Todos los demás valores (flags de depuración, observabilidad, defaults de desarrollo) se definen en código en `src/shared/config/runtimeConfig.ts`.

¿Qué poner en archivos `.env`?

- Para desarrollo local, crea `frontend-vue/.env.local` y, si necesitas, solo sobrescribe la URL del backend:

```dotenv
# Multi-backend con failover URL1 -> URL2 -> URL3
VITE_API_BASE_URLS=http://127.0.0.1:8000,https://api-backup-1.example.com,https://api-backup-2.example.com

# Auth frontend
VITE_AUTH_ENABLED=true
```

`VITE_AUTH_ENABLED`:

- `true` -> habilita guard de autenticación y ruta de login.
- `false` -> deshabilita autenticación (comportamiento actual legacy-like).
- Si no se define, el default es `false`.

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
  - `VITE_API_BASE_URLS` (lista CSV para failover ordenado, hasta 3 URLs).
  - `PUBLIC_BASE_URL` (opcional, URL pública del frontend para smoke checks post-deploy; ejemplo: `https://xubio.madygraf.com`).

- Inputs de `workflow_dispatch` (al lanzar deploy manual):
  - `deploy_protocol` (opcional, `ftps` por defecto; opciones: `ftps`, `ftps-legacy`, `ftp`, `sftp`).
  - `deploy_port` (opcional; si no se define, usa `21` para `ftp/ftps`, `990` para `ftps-legacy` y `22` para `sftp`).
  - `dry_run` (opcional, `false` por defecto): si se define en `true`, ejecuta solo preflight/diagnóstico y no publica `dist/`.

- El workflow de deploy usa estas secrets y sube `./dist/` a `public_html/xubio-www/`.
- Si `PUBLIC_BASE_URL` está definido, el workflow ejecuta smoke checks de `GET /` y `GET /remitos` al finalizar publish.

Selección de protocolo en deploy:

- `deploy_protocol=ftps` (recomendado): despliega cifrado con `SamKirkland/FTP-Deploy-Action`.
- `deploy_protocol=ftps-legacy`: usa FTPS implícito (puerto 990 por defecto).
- `deploy_protocol=ftp`: usa FTP plano (sin cifrado).
- `deploy_protocol=sftp`: despliega con `appleboy/scp-action` por SSH.
- El workflow ejecuta una validación previa (presence de secrets, resolución DNS y reachability del puerto objetivo) para fallar temprano con mensajes claros.

Notas adicionales:

- Si necesitás habilitar observabilidad en un entorno concreto lo ideal es crear una PR que añada un override explícito y documentado en `runtimeConfig.ts` o que reintroduzcamos una variable única `VITE_OBSERVABILITY_ENDPOINT` como excepción.
- Para pruebas puntuales se puede instrumentar `runtimeConfig.ts` para leer variables opcionales, pero por ahora preferimos la simplicidad.

## Build a Apache (`npm run build`)

- El script `npm run build` compila directamente en `/var/www/html/xubio-www` (Apache).
- Si al compilar aparece `EACCES: permission denied, mkdir '/var/www/html/xubio-www'`, el problema es de permisos del sistema, no de Vite.

Preparación recomendada (una sola vez):

```bash
sudo mkdir -p /var/www/html/xubio-www
sudo chown -R $USER:$USER /var/www/html/xubio-www
```

Luego:

```bash
npm run build
```

Alternativa (sin cambiar ownership):

```bash
sudo npm run build
```

Esta alternativa requiere privilegios elevados en cada ejecución.
