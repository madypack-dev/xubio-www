import type { AuthRepository, AuthSession, AuthUser } from "../domain";
import { httpClient } from "@/shared/lib/http/httpClient";

type RawSessionResponse = {
  authenticated?: unknown;
  user?: unknown;
};

type RawLoginResponse = {
  url?: unknown;
  redirectUrl?: unknown;
};

function normalizeBaseUrl(baseUrl: string) {
  return String(baseUrl).trim().replace(/\/+$/g, "");
}

function buildUrl(baseUrl: string, endpoint: string) {
  if (!baseUrl) {
    return endpoint;
  }
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${normalizeBaseUrl(baseUrl)}${normalizedEndpoint}`;
}

function normalizeString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
}

function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  const normalized = normalizeString(value).toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

function toAuthUser(raw: unknown): AuthUser | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const user = raw as Record<string, unknown>;
  const id = normalizeString(user.id ?? user.sub ?? user.userId);
  const email = normalizeString(user.email);
  const name =
    normalizeString(user.name) || [normalizeString(user.given_name), normalizeString(user.family_name)].filter(Boolean).join(" ");
  if (!id || !email || !name) {
    return null;
  }

  const picture = normalizeString(user.picture ?? user.pictureUrl);
  return {
    id,
    email,
    name,
    pictureUrl: picture || null
  };
}

function toAuthSession(raw: RawSessionResponse): AuthSession {
  const authenticated = toBoolean(raw.authenticated);
  const user = toAuthUser(raw.user);
  return {
    authenticated: authenticated && user !== null,
    user: authenticated ? user : null
  };
}

export function createAuthHttpRepository(
  baseUrlOrBaseUrls: string | readonly string[] = ""
): AuthRepository {
  const baseUrlInput = Array.isArray(baseUrlOrBaseUrls)
    ? baseUrlOrBaseUrls[0] ?? ""
    : baseUrlOrBaseUrls;
  const baseUrl = normalizeBaseUrl(baseUrlInput);
  const endpoints = {
    session: buildUrl(baseUrl, "/auth/session"),
    loginGoogle: buildUrl(baseUrl, "/auth/login/google"),
    logout: buildUrl(baseUrl, "/auth/logout")
  } as const;

  return {
    async getSession() {
      try {
        const payload = await httpClient.get<RawSessionResponse>(endpoints.session, {
          parseAs: "json"
        });
        return toAuthSession(payload ?? {});
      } catch (_error) {
        return {
          authenticated: false,
          user: null
        };
      }
    },
    async startGoogleLogin(redirectPath = "/") {
      const payload = await httpClient.post<RawLoginResponse, { redirectPath: string }>(
        endpoints.loginGoogle,
        { redirectPath },
        { parseAs: "json" }
      );

      const loginUrl =
        normalizeString(payload?.url) || normalizeString(payload?.redirectUrl);
      return loginUrl || endpoints.loginGoogle;
    },
    async logout() {
      await httpClient.post(endpoints.logout, {}, { parseAs: "json" });
    }
  };
}
