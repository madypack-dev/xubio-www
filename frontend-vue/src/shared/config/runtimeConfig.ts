const DEFAULT_RUNTIME_ENV = {
  apiBaseUrl: "",
  fallbackToMocksOnError: import.meta.env.DEV,
  verboseStartupLogs: false,
  debugRemitos: false,
  observabilityEnabled: import.meta.env.PROD,
  observabilityEndpoint: import.meta.env.DEV
    ? "http://127.0.0.1:8000/observability/events"
    : null,
  observabilitySampleRate: 1
} as const;

function normalizeString(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
}

function parseBoolean(value: unknown): boolean | null {
  const normalized = normalizeString(value).toLowerCase();
  if (!normalized) {
    return null;
  }
  if (normalized === "true" || normalized === "1") {
    return true;
  }
  if (normalized === "false" || normalized === "0") {
    return false;
  }
  return null;
}

function parseOptionalString(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  return String(value).trim();
}

function isLoopbackHost(hostname: string) {
  const normalized = String(hostname).trim().toLowerCase();
  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized === "[::1]"
  );
}

function resolvePort(url: URL) {
  if (url.port) {
    return url.port;
  }
  return url.protocol === "https:" ? "443" : "80";
}

function shouldUseRelativeApiBase(apiBaseUrl: string) {
  if (import.meta.env.DEV) {
    return false;
  }

  if (!apiBaseUrl || !/^https?:\/\//i.test(apiBaseUrl)) {
    return false;
  }

  if (typeof window === "undefined") {
    return false;
  }

  try {
    const configuredUrl = new URL(apiBaseUrl);
    const currentUrl = new URL(window.location.origin);
    const sameOrigin = configuredUrl.origin === currentUrl.origin;
    const sameLoopbackHost =
      isLoopbackHost(configuredUrl.hostname) && isLoopbackHost(currentUrl.hostname);
    const sameProtocol = configuredUrl.protocol === currentUrl.protocol;
    const samePort = resolvePort(configuredUrl) === resolvePort(currentUrl);

    return sameOrigin || (sameLoopbackHost && sameProtocol && samePort);
  } catch (_error) {
    return false;
  }
}

function parseObservabilitySampleRate(value: string) {
  if (!value) {
    return DEFAULT_RUNTIME_ENV.observabilitySampleRate;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_RUNTIME_ENV.observabilitySampleRate;
  }
  if (parsed < 0) {
    return 0;
  }
  if (parsed > 1) {
    return 1;
  }
  return parsed;
}

function parseObservabilityEnabled(value: unknown) {
  const normalized = normalizeString(value).toLowerCase();
  if (!normalized || normalized === "auto") {
    return DEFAULT_RUNTIME_ENV.observabilityEnabled;
  }
  const parsed = parseBoolean(normalized);
  return parsed ?? DEFAULT_RUNTIME_ENV.observabilityEnabled;
}

const apiBaseUrlInput =
  parseOptionalString(import.meta.env.VITE_API_BASE_URL) ??
  DEFAULT_RUNTIME_ENV.apiBaseUrl;
const normalizedApiBaseUrl = normalizeString(apiBaseUrlInput);
const isAbsoluteApiBaseUrl = /^https?:\/\//i.test(normalizedApiBaseUrl);
const useDevProxyForApi = import.meta.env.DEV && isAbsoluteApiBaseUrl;

const useRelativeApiBase = shouldUseRelativeApiBase(normalizedApiBaseUrl);
const resolvedApiBaseUrl =
  useDevProxyForApi || useRelativeApiBase ? "" : normalizedApiBaseUrl;
const useMocksDefault = import.meta.env.DEV && normalizedApiBaseUrl === "";
const observabilitySampleRate = parseObservabilitySampleRate(
  normalizeString(import.meta.env.VITE_OBSERVABILITY_SAMPLE_RATE)
);
const useMocks = parseBoolean(import.meta.env.VITE_USE_MOCKS) ?? useMocksDefault;
const fallbackToMocksOnError =
  parseBoolean(import.meta.env.VITE_FALLBACK_TO_MOCKS_ON_ERROR) ??
  DEFAULT_RUNTIME_ENV.fallbackToMocksOnError;
const verboseStartupLogs =
  import.meta.env.DEV &&
  (parseBoolean(import.meta.env.VITE_VERBOSE_STARTUP_LOGS) ??
    DEFAULT_RUNTIME_ENV.verboseStartupLogs);
const debugRemitos =
  import.meta.env.DEV &&
  (parseBoolean(import.meta.env.VITE_DEBUG_REMITOS) ??
    DEFAULT_RUNTIME_ENV.debugRemitos);
const observabilityEnabled = parseObservabilityEnabled(
  import.meta.env.VITE_OBSERVABILITY_ENABLED
);
const observabilityEndpointOverride = parseOptionalString(
  import.meta.env.VITE_OBSERVABILITY_ENDPOINT
);
const observabilityEndpoint =
  observabilityEndpointOverride === null
    ? DEFAULT_RUNTIME_ENV.observabilityEndpoint
    : observabilityEndpointOverride || null;

export const runtimeConfig = {
  apiBaseUrl: resolvedApiBaseUrl,
  useDevProxyForApi,
  useRelativeApiBase,
  verboseStartupLogs,
  debugRemitos,
  useMocks,
  fallbackToMocksOnError,
  observabilityEnabled,
  observabilityEndpoint,
  observabilitySampleRate
};
