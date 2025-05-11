import { useEffect, useState } from "react";

interface AuthCheckResult {
  authenticated: boolean;
  token: string | null;
}

interface UseAuthCheckReturn {
  authenticated: boolean | null;
  token: string | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useAuthCheck(): UseAuthCheckReturn {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/auth/check", {
        credentials: "include", // Ensures cookies are sent
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AuthCheckResult = await response.json();
      setAuthenticated(data.authenticated);
      setToken(data.token);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred")
      );
      setAuthenticated(false);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    authenticated,
    token,
    loading,
    error,
    refresh: checkAuth,
  };
}
