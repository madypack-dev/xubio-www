import { runtimeConfig } from "@/shared/config/runtimeConfig";

type TelemetryLevel = "info" | "warn" | "error";

type TelemetryPayload = {
  type: string;
  level: TelemetryLevel;
  timestamp: string;
  context: Record<string, unknown>;
};

const MAX_BUFFER_SIZE = 120;
const telemetryBuffer: TelemetryPayload[] = [];

function nowIsoString() {
  return new Date().toISOString();
}

function pushToBuffer(payload: TelemetryPayload) {
  telemetryBuffer.push(payload);
  if (telemetryBuffer.length > MAX_BUFFER_SIZE) {
    telemetryBuffer.shift();
  }
}

function shouldTrackBySampleRate() {
  const sampleRate = runtimeConfig.observabilitySampleRate;
  if (sampleRate >= 1) {
    return true;
  }
  if (sampleRate <= 0) {
    return false;
  }
  return Math.random() <= sampleRate;
}

function flushToEndpoint(payload: TelemetryPayload) {
  const endpoint = runtimeConfig.observabilityEndpoint;
  if (!endpoint) {
    return;
  }

  const body = JSON.stringify(payload);
  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(endpoint, blob);
      return;
    }
  } catch (_error) {
    return;
  }

  if (typeof fetch === "function") {
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true
    }).catch(() => {});
  }
}

function logToConsole(payload: TelemetryPayload) {
  if (!import.meta.env.DEV) {
    return;
  }

  const message = `[OBS] ${payload.type}`;
  if (payload.level === "error") {
    console.error(message, payload.context);
    return;
  }
  if (payload.level === "warn") {
    console.warn(message, payload.context);
    return;
  }
  console.info(message, payload.context);
}

export function trackTelemetryEvent(
  type: string,
  context: Record<string, unknown>,
  level: TelemetryLevel = "info"
) {
  if (!runtimeConfig.observabilityEnabled || !shouldTrackBySampleRate()) {
    return;
  }

  const payload: TelemetryPayload = {
    type,
    level,
    timestamp: nowIsoString(),
    context
  };

  pushToBuffer(payload);
  logToConsole(payload);
  flushToEndpoint(payload);
}

export function trackHttpRequest(input: {
  method: string;
  url: string;
  durationMs: number;
  status: number | null;
  outcome: "success" | "error" | "timeout";
  errorName?: string;
}) {
  trackTelemetryEvent(
    "http_request",
    {
      method: input.method,
      url: input.url,
      durationMs: input.durationMs,
      status: input.status,
      outcome: input.outcome,
      errorName: input.errorName ?? null
    },
    input.outcome === "success" ? "info" : "warn"
  );
}

export function trackRouteNavigation(input: {
  from: string;
  to: string;
  durationMs: number | null;
  hasFailure: boolean;
}) {
  trackTelemetryEvent(
    "route_navigation",
    {
      from: input.from,
      to: input.to,
      durationMs: input.durationMs,
      hasFailure: input.hasFailure
    },
    input.hasFailure ? "warn" : "info"
  );
}

export function trackPageLoad(input: {
  domInteractiveMs: number | null;
  domContentLoadedMs: number | null;
  loadEventMs: number | null;
  firstContentfulPaintMs: number | null;
}) {
  trackTelemetryEvent("page_load", input, "info");
}

export function trackUnhandledError(input: {
  source: "window_error" | "unhandled_rejection";
  message: string;
  errorName: string | null;
  stack: string | null;
}) {
  trackTelemetryEvent("frontend_error", input, "error");
}

export function getTelemetryBufferSnapshot() {
  return [...telemetryBuffer];
}
