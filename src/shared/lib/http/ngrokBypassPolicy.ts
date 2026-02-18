export type NgrokBypassMode = "always" | "dev-only";

type ResolveNgrokBypassHeaderParams = {
  url: string;
  hasHeader: boolean;
  isDevelopment: boolean;
  mode?: NgrokBypassMode;
};

function isNgrokHostname(hostname: string) {
  const normalizedHostname = hostname.toLowerCase();
  return (
    normalizedHostname.endsWith(".ngrok-free.dev") ||
    normalizedHostname.endsWith(".ngrok.io") ||
    normalizedHostname.endsWith(".ngrok.app")
  );
}

export function isNgrokUrl(url: string) {
  try {
    const baseOrigin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "http://localhost";
    const parsedUrl = new URL(url, baseOrigin);
    return isNgrokHostname(parsedUrl.hostname);
  } catch (_error) {
    return false;
  }
}

export function resolveNgrokBypassHeader({
  url,
  hasHeader,
  isDevelopment,
  mode = "always"
}: ResolveNgrokBypassHeaderParams) {
  if (hasHeader) {
    return false;
  }

  if (!isNgrokUrl(url)) {
    return false;
  }

  if (mode === "dev-only" && !isDevelopment) {
    return false;
  }

  return true;
}
