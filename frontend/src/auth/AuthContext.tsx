import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { auth0Client } from "./auth0Client";
import { Logger } from "../utils/logger/Logger";

const ROLES_CLAIM = "https://api.ot-votacion.com/roles";

export interface AuthUser {
  id: string;
  username: string;
  roles: string[];
}

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  getAccessToken: () => Promise<string>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      ),
    );
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    async function init() {
      try {
        Logger.debug("[Auth] Initializing authentication");
        if (
          window.location.search.includes("code=") &&
          window.location.search.includes("state=")
        ) {
          Logger.info("[Auth] Handling redirect callback");
          await auth0Client.handleRedirectCallback();
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        }

        const authenticated = await auth0Client.isAuthenticated();
        setIsAuthenticated(authenticated);

        if (authenticated) {
          Logger.info("[Auth] User is authenticated, fetching profile");
          const [auth0User, token] = await Promise.all([
            auth0Client.getUser(),
            auth0Client.getTokenSilently(),
          ]);
          const claims = parseJwt(token);
          const roles = (claims?.[ROLES_CLAIM] as string[]) ?? [];
          setUser({
            id: auth0User?.sub ?? "",
            username:
              auth0User?.name ?? auth0User?.email ?? auth0User?.nickname ?? "",
            roles,
          });
          Logger.debug("[Auth] Profile loaded successfully");
        } else {
          Logger.debug("[Auth] User is not authenticated");
        }
      } catch (err: any) {
        Logger.error(`[Auth] Initialization failed: ${err.message}`, {
          error: err,
        });
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  async function login() {
    Logger.info("[Auth] Triggering login redirect");
    await auth0Client.loginWithRedirect();
  }

  async function logout() {
    Logger.info("[Auth] Triggering logout");
    setUser(null);
    setIsAuthenticated(false);
    await auth0Client.logout({
      logoutParams: { returnTo: window.location.origin + "/login" },
    });
  }

  async function getAccessToken() {
    return await auth0Client.getTokenSilently();
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        getAccessToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
