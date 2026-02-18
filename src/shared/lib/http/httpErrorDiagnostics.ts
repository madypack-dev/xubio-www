import { HttpClientError, HttpTimeoutError } from "./httpClient";

export type HttpErrorKind =
  | "ngrok_tunnel"
  | "html_instead_of_json"
  | "timeout"
  | "http_4xx"
  | "http_5xx"
  | "network"
  | "unknown";

export type HttpErrorDiagnosis = {
  kind: HttpErrorKind;
  retryable: boolean;
  userMessage: string;
  status?: number;
  url?: string;
  ngrokErrorCode?: string;
};

function hasHtmlSignals(input: string) {
  const normalized = input.toLowerCase();
  return (
    normalized.includes("text/html") ||
    normalized.includes("<html") ||
    normalized.includes("<!doctype html") ||
    normalized.includes("se recibio html")
  );
}

function extractNgrokErrorCode(...inputs: string[]) {
  for (const input of inputs) {
    const match = input.match(/ERR_NGROK_\d+/i);
    if (match?.[0]) {
      return match[0].toUpperCase();
    }
  }
  return null;
}

function withFallbackMessage(message: string, fallbackMessage: string) {
  const normalized = message.trim();
  if (!normalized) {
    return fallbackMessage;
  }
  return normalized;
}

export function diagnoseHttpError(
  error: unknown,
  fallbackMessage = "Error inesperado al consultar el backend."
): HttpErrorDiagnosis {
  if (error instanceof HttpTimeoutError) {
    return {
      kind: "timeout",
      retryable: true,
      userMessage: withFallbackMessage(
        "El backend demoro demasiado en responder. Reintenta en unos segundos.",
        fallbackMessage
      ),
      url: error.url
    };
  }

  if (error instanceof HttpClientError) {
    const ngrokErrorCode = extractNgrokErrorCode(error.message, error.bodyText);

    if (ngrokErrorCode) {
      return {
        kind: "ngrok_tunnel",
        retryable: false,
        userMessage: withFallbackMessage(
          `El backend temporal no esta disponible (${ngrokErrorCode}). Verifica la URL de ngrok y su despliegue.`,
          fallbackMessage
        ),
        status: error.status,
        url: error.url,
        ngrokErrorCode
      };
    }

    const htmlInBody = hasHtmlSignals(error.message) || hasHtmlSignals(error.bodyText);
    if (htmlInBody) {
      return {
        kind: "html_instead_of_json",
        retryable: false,
        userMessage: withFallbackMessage(
          "El backend devolvio HTML en lugar de JSON. Revisa endpoint, proxy o deployment.",
          fallbackMessage
        ),
        status: error.status,
        url: error.url
      };
    }

    if (error.status >= 500) {
      return {
        kind: "http_5xx",
        retryable: true,
        userMessage: withFallbackMessage(
          "El backend devolvio un error interno. Reintenta en unos segundos.",
          fallbackMessage
        ),
        status: error.status,
        url: error.url
      };
    }

    if (error.status >= 400) {
      return {
        kind: "http_4xx",
        retryable: false,
        userMessage: withFallbackMessage(error.message, fallbackMessage),
        status: error.status,
        url: error.url
      };
    }
  }

  if (error instanceof TypeError) {
    return {
      kind: "network",
      retryable: true,
      userMessage: withFallbackMessage(
        "No se pudo conectar con el backend. Revisa red, CORS o disponibilidad del servicio.",
        fallbackMessage
      )
    };
  }

  if (error instanceof Error) {
    return {
      kind: "unknown",
      retryable: false,
      userMessage: withFallbackMessage(error.message, fallbackMessage)
    };
  }

  return {
    kind: "unknown",
    retryable: false,
    userMessage: fallbackMessage
  };
}

export function buildHttpErrorLogContext(
  error: unknown,
  fallbackMessage?: string
): Record<string, unknown> {
  const diagnosis = diagnoseHttpError(error, fallbackMessage);

  return {
    kind: diagnosis.kind,
    retryable: diagnosis.retryable,
    status: diagnosis.status ?? null,
    url: diagnosis.url ?? null,
    ngrokErrorCode: diagnosis.ngrokErrorCode ?? null,
    userMessage: diagnosis.userMessage
  };
}
