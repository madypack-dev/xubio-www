export type AuthUser = {
  id: string;
  email: string;
  name: string;
  pictureUrl: string | null;
};

export type AuthSession = {
  authenticated: boolean;
  user: AuthUser | null;
};

export interface AuthRepository {
  getSession(): Promise<AuthSession>;
  startGoogleLogin(redirectPath?: string): Promise<string>;
  logout(): Promise<void>;
}
