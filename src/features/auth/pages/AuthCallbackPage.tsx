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
import { useI18n } from '@shared/i18n/I18nProvider';

export function AuthCallbackPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token')?.trim();

    if (!token) {
      setError('No se recibió un token válido desde el proveedor social.');
      return;
    }

    const authToken = token;
    let isCancelled = false;

    async function completeSession() {
      try {
        window.localStorage.setItem('auth_token', authToken);
        const session = await fetchDashboardSession(authToken);

        if (isCancelled) {
          return;
        }

        persistAuthSession(session);
        navigate('/dashboard', { replace: true });
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
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{t('auth.callbackTitle')}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {t('auth.callbackSubtitle')}
      </p>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <Link to="/login" className="mt-4 inline-flex">
            <Button variant="secondary">{t('auth.callbackBack')}</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          {t('auth.callbackLoading')}
        </div>
      )}
    </AuthSplitLayout>
  );
}
