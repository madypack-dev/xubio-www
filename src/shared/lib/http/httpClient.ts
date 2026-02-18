import { trackHttpRequest } from "@/shared/lib/observability/telemetry";

export class HttpClientError extends Error {
  readonly status: number;
  readonly url: string;
  readonly bodyText: string;
  readonly requestId: string | null;

  constructor({
    status,
    url,
    message,
    bodyText,
    requestId = null
  }: {
    status: number;
    url: string;
    message: string;
    bodyText: string;
    requestId?: string | null;
  }) {
    super(message);
    this.name = "HttpClientError";
    this.status = status;
    this.url = url;
    this.bodyText = bodyText;
    this.requestId = requestId;
  }
}

export class HttpTimeoutError extends Error {
  readonly timeoutMs: number;
  readonly url: string;
  readonly requestId: string | null;

  constructor({
    timeoutMs,
    url,
    requestId = null
  }: {
    timeoutMs: number;
    url: string;
    requestId?: string | null;
  }) {
    super(`Timeout de ${timeoutMs}ms en ${url}`);
    this.name = "HttpTimeoutError";
    this.timeoutMs = timeoutMs;
    this.url = url;
    this.requestId = requestId;
  }
}

export class HttpNetworkError extends Error {
  readonly url: string;
  readonly likelyCors: boolean;
  readonly originalMessage: string;
  readonly requestId: string | null;

  constructor({
    url,
    likelyCors,
    originalMessage,
    message,
    requestId = null
  }: {
    url: string;
    likelyCors: boolean;
    originalMessage: string;
    message: string;
    requestId?: string | null;
  }) {
    super(message);
    this.name = "HttpNetworkError";
    this.url = url;
    this.likelyCors = likelyCors;
    this.originalMessage = originalMessage;
    this.requestId = requestId;
  }
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ParseMode = "json" | "text" | "raw";

type RequestOptions<TBody> = {
  method?: HttpMethod;
  headers?: HeadersInit;
  body?: TBody;
  signal?: AbortSignal;
  timeoutMs?: number;
  parseAs?: ParseMode;
};

function isAbortError(error: unknown): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeHeaders(headers?: HeadersInit) {
  return new Headers(headers ?? {});
}

function isHttpDebugEnabled() {
  if (typeof window === "undefined") {
    return false;
  }

  const globalFlag = (window as unknown as { __MVP_DEBUG_HTTP__?: boolean }).__MVP_DEBUG_HTTP__;
  if (globalFlag === true) {
    return true;
  }

  try {
    const localFlag = window.localStorage.getItem("MVP_DEBUG_HTTP");
    return localFlag === "1" || localFlag === "true";
  } catch (_error) {
    return false;
  }
}

function debugHttpLog(message: string, payload: Record<string, unknown>) {
  if (!isHttpDebugEnabled()) {
    return;
  }
  console.info(`[MVP][HTTP DEBUG] ${message}`, payload);
}

let requestSequence = 0;

function nextRequestId() {
  requestSequence += 1;
  return `http-${Date.now()}-${requestSequence}`;
}

function isNgrokUrl(url: string) {
  try {
    const baseOrigin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "http://localhost";
    const parsedUrl = new URL(url, baseOrigin);
    const hostname = parsedUrl.hostname.toLowerCase();
    return (
      hostname.endsWith(".ngrok-free.dev") ||
      hostname.endsWith(".ngrok.io") ||
      hostname.endsWith(".ngrok.app")
    );
  } catch (_error) {
    return false;
  }
}

function isCrossOriginRequest(url: string) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const parsedUrl = new URL(url, window.location.origin);
    return parsedUrl.origin !== window.location.origin;
  } catch (_error) {
    return false;
  }
}

function toHttpNetworkError(url: string, error: TypeError, requestId: string) {
  const originalMessage = error.message || "Failed to fetch";
  const likelyCors = /failed to fetch/i.test(originalMessage) && isCrossOriginRequest(url);

  const message = likelyCors
    ? `No se pudo acceder a ${url}. Posible bloqueo CORS/preflight desde el navegador.`
    : `Error de red al acceder a ${url}: ${originalMessage}`;

  return new HttpNetworkError({
    url,
    likelyCors,
    originalMessage,
    message,
    requestId
  });
}

function applyRequestDiagnostics(url: string, headers: Headers, parseAs: ParseMode) {
  if (parseAs === "json" && !headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (import.meta.env.DEV && isNgrokUrl(url) && !headers.has("ngrok-skip-browser-warning")) {
    headers.set("ngrok-skip-browser-warning", "true");
  }
}

function serializeBody<TBody>(body: TBody, headers: Headers) {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (
    typeof body === "string" ||
    body instanceof Blob ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer
  ) {
    return body;
  }

  if (isObject(body) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return JSON.stringify(body);
}

function mergeSignals(primary: AbortSignal, secondary?: AbortSignal) {
  if (!secondary) {
    return primary;
  }

  const mergedController = new AbortController();

  const abortMergedSignal = () => {
    mergedController.abort();
  };

  primary.addEventListener("abort", abortMergedSignal, { once: true });
  secondary.addEventListener("abort", abortMergedSignal, { once: true });

  return mergedController.signal;
}

function previewText(text: string, maxLength = 220) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength)}...`;
}

function looksLikeHtmlResponse(contentType: string, bodyText: string) {
  const trimmedBody = bodyText.trim().toLowerCase();
  return (
    contentType.includes("text/html") ||
    trimmedBody.startsWith("<!doctype html") ||
    trimmedBody.startsWith("<html")
  );
}

async function parseBody<TResponse>(
  response: Response,
  parseAs: ParseMode,
  requestId: string
) {
  if (parseAs === "raw") {
    return response as TResponse;
  }

  if (response.status === 204) {
    return null as TResponse;
  }

  if (parseAs === "text") {
    return (await response.text()) as TResponse;
  }

  const bodyText = await response.text();
  if (!bodyText.trim()) {
    return null as TResponse;
  }

  try {
    return JSON.parse(bodyText) as TResponse;
  } catch (error) {
    const contentType = response.headers.get("content-type") ?? "";
    const looksLikeHtml = looksLikeHtmlResponse(contentType, bodyText);
    const likelyNgrokInterstitial =
      looksLikeHtml && /ngrok/i.test(bodyText.slice(0, 2500));
    const shouldSuggestNgrokHeader = import.meta.env.DEV && likelyNgrokInterstitial;

    const message = looksLikeHtml
      ? `Se esperaba JSON y se recibio HTML en ${response.url || "<unknown>"}. Revisa VITE_API_BASE_URL y el proxy /API.${
          shouldSuggestNgrokHeader
            ? " Posible pagina de advertencia de ngrok: verifica el endpoint publicado y el header ngrok-skip-browser-warning."
            : ""
        }`
      : `JSON invalido recibido desde ${response.url || "<unknown>"}.`;
    console.error("[MVP] Error parseando respuesta HTTP", {
      requestId,
      url: response.url || "<unknown>",
      status: response.status,
      parseAs,
      contentType,
      bodyPreview: previewText(bodyText),
      likelyNgrokInterstitial,
      errorName: error instanceof Error ? error.name : "UnknownError"
    });

    throw new HttpClientError({
      status: response.status,
      url: response.url || "<unknown>",
      bodyText,
      message,
      requestId
    });
  }
}

async function readErrorBody(response: Response) {
  try {
    return await response.text();
  } catch (_error) {
    return "";
  }
}

async function request<TResponse, TBody = unknown>(
  url: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const {
    method = "GET",
    headers: inputHeaders,
    body,
    signal,
    timeoutMs = 15_000,
    parseAs = "json"
  } = options;
  const requestId = nextRequestId();

  const timeoutController = new AbortController();
  const headers = normalizeHeaders(inputHeaders);
  applyRequestDiagnostics(url, headers, parseAs);
  const serializedBody = serializeBody(body, headers);
  debugHttpLog("Request prepared", {
    requestId,
    method,
    url,
    parseAs,
    timeoutMs,
    headers: Object.fromEntries(headers.entries()),
    bodyPreview: typeof serializedBody === "string" ? previewText(serializedBody) : "<non-string-body>"
  });
  const requestSignal = mergeSignals(timeoutController.signal, signal);
  const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);
  const startedAt =
    typeof performance !== "undefined" && typeof performance.now === "function"
      ? performance.now()
      : Date.now();
  let responseStatus: number | null = null;

  const elapsedMs = () => {
    const now =
      typeof performance !== "undefined" && typeof performance.now === "function"
        ? performance.now()
        : Date.now();
    return Math.round((now - startedAt) * 100) / 100;
  };

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: serializedBody,
      signal: requestSignal
    });
    responseStatus = response.status;
    debugHttpLog("Response received", {
      requestId,
      method,
      url,
      responseUrl: response.url || "<unknown>",
      status: response.status,
      ok: response.ok,
      contentType: response.headers.get("content-type")
    });

    if (!response.ok) {
      const bodyText = await readErrorBody(response);
      const contentType = response.headers.get("content-type") ?? "";
      const ngrokErrorCode = response.headers.get("ngrok-error-code") ?? "";
      const looksLikeHtml = looksLikeHtmlResponse(contentType, bodyText);
      const responseUrl = response.url || url;
      const message = ngrokErrorCode
        ? `El tunel ngrok devolvio ${ngrokErrorCode} para ${responseUrl}. Verifica si la URL sigue activa y publica el backend correcto.`
        : looksLikeHtml
          ? `HTTP ${response.status} en ${responseUrl}: se recibio HTML en vez del payload esperado.`
          : bodyText || `HTTP ${response.status}`;
      debugHttpLog("Non-2xx response body", {
        requestId,
        method,
        url,
        status: response.status,
        contentType,
        ngrokErrorCode: ngrokErrorCode || undefined,
        bodyPreview: previewText(bodyText)
      });
      throw new HttpClientError({
        status: response.status,
        url: responseUrl,
        bodyText,
        message,
        requestId
      });
    }

    const payload = await parseBody<TResponse>(response, parseAs, requestId);
    trackHttpRequest({
      method,
      url,
      durationMs: elapsedMs(),
      status: responseStatus,
      outcome: "success"
    });
    return payload;
  } catch (error) {
    debugHttpLog("Request failed", {
      requestId,
      method,
      url,
      durationMs: elapsedMs(),
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message : String(error)
    });
    if (isAbortError(error)) {
      const timeoutError = new HttpTimeoutError({ timeoutMs, url, requestId });
      console.error("[MVP] Timeout en request HTTP", {
        requestId,
        method,
        url,
        timeoutMs,
        durationMs: elapsedMs()
      });
      trackHttpRequest({
        method,
        url,
        durationMs: elapsedMs(),
        status: responseStatus,
        outcome: "timeout",
        errorName: timeoutError.name
      });
      throw timeoutError;
    }
    let handledError: unknown = error;

    if (error instanceof HttpClientError) {
      console.error("[MVP] Error HTTP en request", {
        requestId,
        method,
        url,
        status: error.status,
        message: error.message,
        bodyPreview: previewText(error.bodyText),
        durationMs: elapsedMs()
      });
    } else if (error instanceof TypeError) {
      const networkError = toHttpNetworkError(url, error, requestId);
      handledError = networkError;
      console.warn("[MVP] Error de red tipado en request", {
        requestId,
        method,
        url,
        durationMs: elapsedMs(),
        likelyCors: networkError.likelyCors,
        originalMessage: networkError.originalMessage,
        message: networkError.message
      });
    } else if (error instanceof HttpNetworkError) {
      handledError = error;
      console.warn("[MVP] Error de red tipado en request", {
        requestId,
        method,
        url,
        durationMs: elapsedMs(),
        likelyCors: error.likelyCors,
        originalMessage: error.originalMessage,
        message: error.message
      });
    } else {
      console.error("[MVP] Error de red/no controlado en request", {
        requestId,
        method,
        url,
        durationMs: elapsedMs(),
        errorName: error instanceof Error ? error.name : "UnknownError",
        message: error instanceof Error ? error.message : String(error)
      });
    }
    trackHttpRequest({
      method,
      url,
      durationMs: elapsedMs(),
      status: responseStatus,
      outcome: "error",
      errorName: handledError instanceof Error ? handledError.name : "UnknownError"
    });
    throw handledError;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const httpClient = {
  get<TResponse>(url: string, options?: Omit<RequestOptions<never>, "method">) {
    return request<TResponse>(url, { ...options, method: "GET" });
  },
  post<TResponse, TBody = unknown>(
    url: string,
    body: TBody,
    options?: Omit<RequestOptions<TBody>, "method" | "body">
  ) {
    return request<TResponse, TBody>(url, { ...options, method: "POST", body });
  },
  put<TResponse, TBody = unknown>(
    url: string,
    body: TBody,
    options?: Omit<RequestOptions<TBody>, "method" | "body">
  ) {
    return request<TResponse, TBody>(url, { ...options, method: "PUT", body });
  },
  patch<TResponse, TBody = unknown>(
    url: string,
    body: TBody,
    options?: Omit<RequestOptions<TBody>, "method" | "body">
  ) {
    return request<TResponse, TBody>(url, { ...options, method: "PATCH", body });
  },
  delete<TResponse>(url: string, options?: Omit<RequestOptions<never>, "method">) {
    return request<TResponse>(url, { ...options, method: "DELETE" });
  }
};
