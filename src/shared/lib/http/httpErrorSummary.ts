import { HttpClientError, HttpNetworkError, HttpTimeoutError } from "./httpClient";

type ApiErrorSummary = {
  name: string;
  message: string;
  status?: number;
  url?: string;
};

export function summarizeApiError(error: unknown): ApiErrorSummary {
  if (error instanceof HttpClientError) {
    return {
      name: error.name,
      message: error.message,
      status: error.status,
      url: error.url
    };
  }

  if (error instanceof HttpTimeoutError) {
    return {
      name: error.name,
      message: error.message,
      url: error.url
    };
  }

  if (error instanceof HttpNetworkError) {
    return {
      name: error.name,
      message: error.message,
      url: error.url
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message
    };
  }

  return {
    name: "UnknownError",
    message: "Error no tipado"
  };
}

export function logApiError(
  scope: string,
  error: unknown,
  level: "warn" | "error" = "error"
) {
  const summary = summarizeApiError(error);
  const message = `[MVP] ${scope}`;

  if (level === "warn") {
    console.warn(message, summary);
    return;
  }

  console.error(message, summary);
}
