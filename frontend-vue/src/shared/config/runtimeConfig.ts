const apiBaseUrlRaw = import.meta.env.VITE_API_BASE_URL ?? "";
const useMocksRaw = import.meta.env.VITE_USE_MOCKS ?? "";
const fallbackToMocksOnErrorRaw =
  import.meta.env.VITE_FALLBACK_TO_MOCKS_ON_ERROR ?? "";
const verboseStartupLogsRaw = import.meta.env.VITE_VERBOSE_STARTUP_LOGS ?? "";
const debugRemitosRaw = import.meta.env.VITE_DEBUG_REMITOS ?? "";
const normalizedUseMocks = String(useMocksRaw).trim().toLowerCase();
const normalizedFallbackToMocksOnError = String(fallbackToMocksOnErrorRaw)
  .trim()
  .toLowerCase();
const normalizedApiBaseUrl = String(apiBaseUrlRaw).trim();
const normalizedVerboseStartupLogs = String(verboseStartupLogsRaw)
  .trim()
  .toLowerCase();
const normalizedDebugRemitos = String(debugRemitosRaw).trim().toLowerCase();
const isAbsoluteApiBaseUrl = /^https?:\/\//i.test(normalizedApiBaseUrl);
const useDevProxyForApi = import.meta.env.DEV && isAbsoluteApiBaseUrl;

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

const useRelativeApiBase = shouldUseRelativeApiBase(normalizedApiBaseUrl);
const resolvedApiBaseUrl =
  useDevProxyForApi || useRelativeApiBase ? "" : normalizedApiBaseUrl;

export const runtimeConfig = {
  apiBaseUrl: resolvedApiBaseUrl,
  useDevProxyForApi,
  useRelativeApiBase,
  verboseStartupLogs:
    import.meta.env.DEV &&
    (normalizedVerboseStartupLogs === "true" || normalizedVerboseStartupLogs === "1"),
  debugRemitos:
    import.meta.env.DEV &&
    (normalizedDebugRemitos === "true" || normalizedDebugRemitos === "1"),
  useMocks:
    normalizedUseMocks === "true" ||
    (import.meta.env.DEV && normalizedApiBaseUrl === ""),
  fallbackToMocksOnError:
    normalizedFallbackToMocksOnError === "true" ||
    (normalizedFallbackToMocksOnError !== "false" && import.meta.env.DEV)
};
