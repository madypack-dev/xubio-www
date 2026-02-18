import { describe, expect, it } from "vitest";
import { isNgrokUrl, resolveNgrokBypassHeader } from "@/shared/lib/http/ngrokBypassPolicy";

describe("ngrokBypassPolicy", () => {
  it("detects ngrok urls", () => {
    expect(isNgrokUrl("https://demo.ngrok-free.dev/API/1.1/remitoVentaBean")).toBe(true);
    expect(isNgrokUrl("https://demo.ngrok.io/API/1.1/remitoVentaBean")).toBe(true);
    expect(isNgrokUrl("https://xubio.madygraf.com/API/1.1/remitoVentaBean")).toBe(false);
  });

  it("enables bypass header for ngrok urls by default", () => {
    const shouldAttach = resolveNgrokBypassHeader({
      url: "https://demo.ngrok-free.dev/API/1.1/remitoVentaBean",
      hasHeader: false,
      isDevelopment: false
    });

    expect(shouldAttach).toBe(true);
  });

  it("does not duplicate header when already present", () => {
    const shouldAttach = resolveNgrokBypassHeader({
      url: "https://demo.ngrok-free.dev/API/1.1/remitoVentaBean",
      hasHeader: true,
      isDevelopment: true
    });

    expect(shouldAttach).toBe(false);
  });

  it("supports dev-only mode for controlled rollouts", () => {
    const shouldAttachInProd = resolveNgrokBypassHeader({
      url: "https://demo.ngrok-free.dev/API/1.1/remitoVentaBean",
      hasHeader: false,
      isDevelopment: false,
      mode: "dev-only"
    });

    const shouldAttachInDev = resolveNgrokBypassHeader({
      url: "https://demo.ngrok-free.dev/API/1.1/remitoVentaBean",
      hasHeader: false,
      isDevelopment: true,
      mode: "dev-only"
    });

    expect(shouldAttachInProd).toBe(false);
    expect(shouldAttachInDev).toBe(true);
  });
});
