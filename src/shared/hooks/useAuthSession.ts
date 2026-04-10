import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  clearStoredAuthSession,
  fetchDashboardSession,
  getRedirectPathForRole,
  getStoredAuthToken,
  persistAuthSession,
  readStoredAuthSession,
  type AuthSession,
} from '@services/auth';

type UseAuthSessionOptions = {
  requiredRole?: string;
  redirectTo?: string;
};

type UseAuthSessionResult = {
  session: AuthSession | null;
  isLoading: boolean;
  error: string;
};

export function useAuthSession({
  requiredRole,
  redirectTo,
}: UseAuthSessionOptions = {}): UseAuthSessionResult {
  const navigate = useNavigate();
  const [session, setSession] = useState<AuthSession | null>(() => readStoredAuthSession());
  const [isLoading, setIsLoading] = useState(() => Boolean(getStoredAuthToken()));
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getStoredAuthToken();

    if (!token) {
      setSession(null);
      setIsLoading(false);

      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      }

      return;
    }

    let isCancelled = false;

    async function loadSession() {
      try {
        setIsLoading(true);
        const nextSession = await fetchDashboardSession(token);

        if (isCancelled) {
          return;
        }

        persistAuthSession(nextSession);
        setSession(nextSession);
        setError('');

        if (requiredRole && nextSession.user.role !== requiredRole) {
          navigate(getRedirectPathForRole(nextSession.user.role, nextSession.dashboard), { replace: true });
        }
      } catch (requestError) {
        if (isCancelled) {
          return;
        }

        clearStoredAuthSession();
        setSession(null);
        setError(requestError instanceof Error ? requestError.message : 'No se pudo validar la sesion.');

        if (redirectTo) {
          navigate(redirectTo, { replace: true });
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      isCancelled = true;
    };
  }, [navigate, redirectTo, requiredRole]);

  return { session, isLoading, error };
}
