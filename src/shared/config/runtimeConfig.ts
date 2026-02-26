type RuntimeConfig = Readonly<{
  authEnabled: boolean;
  apiBaseUrls: readonly string[];
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
  authEnabled: false,
  fallbackApiBaseUrls: [
    "https://api.madygraf.local/",
    "https://10.176.61.33:8000/",
    "https://confined-unexcused-garland.ngrok-free.dev/"
  ],
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

function parseBoolean(value: unknown, fallback: boolean) {
  if (value === undefined || value === null) {
    return fallback;
  }
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "n", "off"].includes(normalized)) {
    return false;
  }
  return fallback;
}

export function normalizeBaseUrl(value: unknown) {
  const normalized = normalizeString(value);
  if (!normalized) {
    return "";
  }
  return normalized.replace(/\/+$/g, "");
}

function parseOptionalString(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  return String(value).trim();
}

export function parseApiBaseUrls(value: unknown) {
  const raw = parseOptionalString(value);
  if (raw === null) {
    return [] as string[];
  }

  return raw
    .split(/[\n,;]+/g)
    .map((entry) => normalizeBaseUrl(entry))
    .filter((entry) => entry.length > 0);
}

export function dedupeBaseUrls(baseUrls: readonly string[]) {
  const result: string[] = [];
  const seen = new Set<string>();

  for (const baseUrl of baseUrls) {
    const normalized = normalizeBaseUrl(baseUrl);
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

export function resolveApiBaseUrls({
  envApiBaseUrls,
  defaultApiBaseUrls,
  maxUrls = 3
}: {
  envApiBaseUrls: string | null;
  defaultApiBaseUrls: readonly string[];
  maxUrls?: number;
}) {
  const configuredFromList = parseApiBaseUrls(envApiBaseUrls);

  const fallbackList = dedupeBaseUrls(defaultApiBaseUrls);

  const baseUrls = dedupeBaseUrls(
    (configuredFromList.length > 0 ? configuredFromList : fallbackList).filter(Boolean)
  );

  return baseUrls.slice(0, Math.max(maxUrls, 1));
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

const envApiBaseUrls = parseOptionalString(import.meta.env.VITE_API_BASE_URLS);
const configuredApiBaseUrls = resolveApiBaseUrls({
  envApiBaseUrls,
  defaultApiBaseUrls: DEFAULT_RUNTIME_ENV.fallbackApiBaseUrls
});
const primaryConfiguredApiBaseUrl = configuredApiBaseUrls[0] ?? "";
const isAbsoluteApiBaseUrl = /^https?:\/\//i.test(primaryConfiguredApiBaseUrl);
const useDevProxyForApi = import.meta.env.DEV && isAbsoluteApiBaseUrl;

const useRelativeApiBase = shouldUseRelativeApiBase(primaryConfiguredApiBaseUrl);
const resolvedApiBaseUrls =
  useDevProxyForApi || useRelativeApiBase ? [""] : configuredApiBaseUrls;
const resolvedApiBaseUrl = resolvedApiBaseUrls[0] ?? "";
// Observability and debug flags are controlled by defaults in this file.
// We intentionally avoid reading additional VITE_ variables here; only
// `VITE_API_BASE_URLS` is kept as network override.
if (import.meta.env.DEV && envApiBaseUrls === null) {
  console.info(
    `[MVP] VITE_API_BASE_URLS no definido. Se usa fallback hardcodeado temporal ${dedupeBaseUrls(
      DEFAULT_RUNTIME_ENV.fallbackApiBaseUrls
    ).join(", ")}.`
  );
}
if (import.meta.env.DEV && resolvedApiBaseUrl === "" && !useDevProxyForApi) {
  console.warn(
    "[MVP] API base resuelta vacia. Se usara base URL relativa y cualquier error vendra del backend real."
  );
}
const verboseStartupLogs = import.meta.env.DEV && DEFAULT_RUNTIME_ENV.verboseStartupLogs;
const authEnabled = parseBoolean(
  import.meta.env.VITE_AUTH_ENABLED,
  DEFAULT_RUNTIME_ENV.authEnabled
);
const debugRemitos = import.meta.env.DEV && DEFAULT_RUNTIME_ENV.debugRemitos;
const observabilityEnabled = DEFAULT_RUNTIME_ENV.observabilityEnabled;
const observabilityEndpoint = DEFAULT_RUNTIME_ENV.observabilityEndpoint;
const observabilitySampleRate = DEFAULT_RUNTIME_ENV.observabilitySampleRate;

export const runtimeConfig: RuntimeConfig = Object.freeze({
  authEnabled,
  apiBaseUrls: Object.freeze([...resolvedApiBaseUrls]),
  apiBaseUrl: resolvedApiBaseUrl,
  useDevProxyForApi,
  useRelativeApiBase,
  verboseStartupLogs,
  debugRemitos,
  observabilityEnabled,
  observabilityEndpoint,
  observabilitySampleRate
});
