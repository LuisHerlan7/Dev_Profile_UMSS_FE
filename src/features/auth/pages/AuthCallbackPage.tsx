import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthSplitLayout } from '@shared/components/auth/AuthSplitLayout';
import { Button } from '@shared/components/ui/Button';
import {
  clearStoredAuthSession,
  fetchDashboardSession,
  getRedirectPathForRole,
  persistAuthSession,
} from '@services/auth';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token')?.trim();

    if (!token) {
      setError('No se recibio un token valido desde el proveedor social.');
      return;
    }

    let isCancelled = false;

    async function completeSession() {
      try {
        window.localStorage.setItem('auth_token', token);
        const session = await fetchDashboardSession(token);

        if (isCancelled) {
          return;
        }

        persistAuthSession(session);
        navigate(getRedirectPathForRole(session.user.role, session.dashboard), { replace: true });
      } catch (requestError) {
        clearStoredAuthSession();

        if (isCancelled) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'No se pudo completar la autenticacion social.'
        );
      }
    }

    completeSession();

    return () => {
      isCancelled = true;
    };
  }, [navigate, searchParams]);

  return (
    <AuthSplitLayout>
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Validando tu acceso</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Estamos conectando tu cuenta social con tu dashboard de UMSS Dev Network.
      </p>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <Link to="/login" className="mt-4 inline-flex">
            <Button variant="secondary">Volver a iniciar sesion</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          Estamos obteniendo tu perfil, rol y datos iniciales del dashboard.
        </div>
      )}
    </AuthSplitLayout>
  );
}
