import { fileURLToPath, URL } from "node:url";
import { loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

const DEFAULT_VITE_ENV = {
  apiBaseUrl: ""
} as const;

function normalizeProxyTarget(input: string) {
  try {
    const url = new URL(input);
    if (url.hostname === "localhost") {
      url.hostname = "127.0.0.1";
    }
    return url.toString().replace(/\/$/, "");
  } catch (_error) {
    return input;
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBaseUrl = String(env.VITE_API_BASE_URL ?? DEFAULT_VITE_ENV.apiBaseUrl).trim();
  const isAbsoluteApiBaseUrl = /^https?:\/\//i.test(apiBaseUrl);
  const proxyTarget = isAbsoluteApiBaseUrl
    ? normalizeProxyTarget(apiBaseUrl)
    : "";

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url))
      }
    },
    server: {
      proxy: isAbsoluteApiBaseUrl
        ? {
            "/API": {
              target: proxyTarget,
              changeOrigin: true,
              secure: false
            }
          }
        : undefined
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/test/setup.ts",
      include: ["src/**/*.{test,spec}.ts"],
      exclude: ["e2e/**"],
      coverage: {
        provider: "v8",
        reporter: ["text", "html"]
      }
    }
  };
});
