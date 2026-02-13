import type { Router } from "vue-router";
import { runtimeConfig } from "@/shared/config/runtimeConfig";
import {
  trackPageLoad,
  trackRouteNavigation,
  trackUnhandledError
} from "@/shared/lib/observability/telemetry";

let observabilityInstalled = false;
let routeNavigationStartedAt = 0;

function toRoundedMs(value: number) {
  return Math.round(value * 100) / 100;
}

function readNavigationTimings() {
  const navigationEntry = performance.getEntriesByType(
    "navigation"
  )[0] as PerformanceNavigationTiming | undefined;
  const paintEntries = performance.getEntriesByType("paint");
  const firstContentfulPaint = paintEntries.find(
    (entry) => entry.name === "first-contentful-paint"
  );

  return {
    domInteractiveMs: navigationEntry ? toRoundedMs(navigationEntry.domInteractive) : null,
    domContentLoadedMs: navigationEntry
      ? toRoundedMs(navigationEntry.domContentLoadedEventEnd)
      : null,
    loadEventMs: navigationEntry ? toRoundedMs(navigationEntry.loadEventEnd) : null,
    firstContentfulPaintMs: firstContentfulPaint
      ? toRoundedMs(firstContentfulPaint.startTime)
      : null
  };
}

function handleWindowError(event: ErrorEvent) {
  trackUnhandledError({
    source: "window_error",
    message: event.message || "Error no identificado",
    errorName: event.error instanceof Error ? event.error.name : null,
    stack: event.error instanceof Error ? event.error.stack ?? null : null
  });
}

function handleUnhandledRejection(event: PromiseRejectionEvent) {
  const reason = event.reason;
  if (reason instanceof Error) {
    trackUnhandledError({
      source: "unhandled_rejection",
      message: reason.message,
      errorName: reason.name,
      stack: reason.stack ?? null
    });
    return;
  }

  trackUnhandledError({
    source: "unhandled_rejection",
    message: String(reason ?? "Rechazo sin detalle"),
    errorName: null,
    stack: null
  });
}

function resolveRouteDurationMs() {
  if (routeNavigationStartedAt <= 0) {
    return null;
  }

  const duration = performance.now() - routeNavigationStartedAt;
  routeNavigationStartedAt = 0;
  return toRoundedMs(duration);
}

function installGlobalErrorHandlers() {
  window.addEventListener("error", handleWindowError);
  window.addEventListener("unhandledrejection", handleUnhandledRejection);
}

function installPageLoadObserver() {
  const emitPageLoad = () => {
    trackPageLoad(readNavigationTimings());
  };

  if (document.readyState === "complete") {
    emitPageLoad();
    return;
  }

  window.addEventListener("load", emitPageLoad, { once: true });
}

function installRouterObservers(router: Router) {
  router.beforeEach(() => {
    routeNavigationStartedAt = performance.now();
    return true;
  });

  router.afterEach((to, from, failure) => {
    trackRouteNavigation({
      from: from.fullPath || "/",
      to: to.fullPath || "/",
      durationMs: resolveRouteDurationMs(),
      hasFailure: Boolean(failure)
    });
  });
}

export function installObservability(router: Router) {
  if (observabilityInstalled || !runtimeConfig.observabilityEnabled) {
    return;
  }

  if (typeof window === "undefined" || typeof performance === "undefined") {
    return;
  }

  observabilityInstalled = true;
  installGlobalErrorHandlers();
  installPageLoadObserver();
  installRouterObservers(router);
}
