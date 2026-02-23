import { fileURLToPath, URL } from "node:url";
import { loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

const DEFAULT_VITE_ENV = {
  apiBaseUrl: "",
  devApiBaseUrl: "http://127.0.0.1:8000",
  devProxyOrigin: "http://127.0.0.1:8000"
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const defaultApiBaseUrl =
    mode !== "production"
      ? DEFAULT_VITE_ENV.devApiBaseUrl
      : DEFAULT_VITE_ENV.apiBaseUrl;
  const apiBaseUrl = String(env.VITE_API_BASE_URL ?? defaultApiBaseUrl).trim();
  const isAbsoluteApiBaseUrl = /^https?:\/\//i.test(apiBaseUrl);
  const proxyTarget = isAbsoluteApiBaseUrl
    ? normalizeProxyTarget(apiBaseUrl)
    : "";
  const buildOutDir = String(env.BUILD_OUT_DIR ?? "dist").trim() || "dist";
  const isOutDirInsideWorkspace = !buildOutDir.startsWith("/");
  const useBackendProxyForHmr = parseBoolean(
    env.VITE_DEV_USE_BACKEND_PROXY,
    false
  );
  const devProxyOrigin = String(
    env.VITE_DEV_PROXY_ORIGIN ?? DEFAULT_VITE_ENV.devProxyOrigin
  ).trim();
  let hmrConfig:
    | {
        protocol: "ws" | "wss";
        host: string;
        clientPort: number;
        port: number;
      }
    | undefined;
  if (mode !== "production" && useBackendProxyForHmr) {
    try {
      const proxyUrl = new URL(devProxyOrigin);
      hmrConfig = {
        protocol: proxyUrl.protocol === "https:" ? "wss" : "ws",
        host: proxyUrl.hostname,
        clientPort: Number(proxyUrl.port || (proxyUrl.protocol === "https:" ? 443 : 80)),
        port: Number(proxyUrl.port || (proxyUrl.protocol === "https:" ? 443 : 80))
      };
    } catch (_error) {
      // If env is malformed we keep Vite defaults instead of crashing dev startup.
      hmrConfig = undefined;
    }
  }

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url))
      }
    },
    server: {
      hmr: hmrConfig,
      proxy: isAbsoluteApiBaseUrl
        ? {
            "/API": {
              target: proxyTarget,
              changeOrigin: true,
              secure: false,
              headers: {
                "ngrok-skip-browser-warning": "true",
                accept: "application/json"
              }
            }
          }
        : undefined
    },
    build: {
      outDir: buildOutDir,
      emptyOutDir: isOutDirInsideWorkspace
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
