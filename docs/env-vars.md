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
  - `FTP_USERNAME`
  - `FTP_PASSWORD`

- El workflow de deploy usa estas secrets y sube `./dist/` a `public_html/xubio-www/`.

Notas adicionales:

- Si necesitás habilitar observabilidad en un entorno concreto lo ideal es crear una PR que añada un override explícito y documentado en `runtimeConfig.ts` o que reintroduzcamos una variable única `VITE_OBSERVABILITY_ENDPOINT` como excepción.
- Para pruebas puntuales se puede instrumentar `runtimeConfig.ts` para leer variables opcionales, pero por ahora preferimos la simplicidad.
