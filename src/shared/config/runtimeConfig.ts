type RuntimeConfig = Readonly<{
  apiBaseUrl: string;
  useDevProxyForApi: boolean;
  useRelativeApiBase: boolean;
  verboseStartupLogs: boolean;
  debugRemitos: boolean;
  observabilityEnabled: boolean;
  observabilityEndpoint: string | null;
  observabilitySampleRate: number;
}>;

const DEFAULT_RUNTIME_ENV = {
  apiBaseUrl: "",
  devApiBaseUrl: "http://127.0.0.1:8000",
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

// parseBoolean removed: debug/observability env parsing is no longer used.

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

// Observability parsing and legacy mock warnings were removed because
// observability and debug defaults are now provided directly from
// `DEFAULT_RUNTIME_ENV` and are not driven by environment variables.

const envApiBaseUrl = parseOptionalString(import.meta.env.VITE_API_BASE_URL);
const apiBaseUrlInput =
  envApiBaseUrl ??
  (import.meta.env.DEV ? DEFAULT_RUNTIME_ENV.devApiBaseUrl : DEFAULT_RUNTIME_ENV.apiBaseUrl);
const normalizedApiBaseUrl = normalizeString(apiBaseUrlInput);
const isAbsoluteApiBaseUrl = /^https?:\/\//i.test(normalizedApiBaseUrl);
const useDevProxyForApi = import.meta.env.DEV && isAbsoluteApiBaseUrl;

const useRelativeApiBase = shouldUseRelativeApiBase(normalizedApiBaseUrl);
const resolvedApiBaseUrl =
  useDevProxyForApi || useRelativeApiBase ? "" : normalizedApiBaseUrl;
// Observability and debug flags are controlled by defaults in this file.
// We intentionally avoid reading additional VITE_ variables here; only
// `VITE_API_BASE_URL` is kept as an override coming from the environment.
if (import.meta.env.DEV && envApiBaseUrl === null) {
  console.info(
    `[MVP] VITE_API_BASE_URL no definido. Se usa default de desarrollo ${DEFAULT_RUNTIME_ENV.devApiBaseUrl}.`
  );
}
if (import.meta.env.DEV && normalizedApiBaseUrl === "" && !useDevProxyForApi) {
  console.warn(
    "[MVP] VITE_API_BASE_URL esta vacio. Se usara base URL relativa y cualquier error vendra del backend real."
  );
}
const verboseStartupLogs = import.meta.env.DEV && DEFAULT_RUNTIME_ENV.verboseStartupLogs;
const debugRemitos = import.meta.env.DEV && DEFAULT_RUNTIME_ENV.debugRemitos;
const observabilityEnabled = DEFAULT_RUNTIME_ENV.observabilityEnabled;
const observabilityEndpoint = DEFAULT_RUNTIME_ENV.observabilityEndpoint;
const observabilitySampleRate = DEFAULT_RUNTIME_ENV.observabilitySampleRate;

export const runtimeConfig: RuntimeConfig = Object.freeze({
  apiBaseUrl: resolvedApiBaseUrl,
  useDevProxyForApi,
  useRelativeApiBase,
  verboseStartupLogs,
  debugRemitos,
  observabilityEnabled,
  observabilityEndpoint,
  observabilitySampleRate
});
