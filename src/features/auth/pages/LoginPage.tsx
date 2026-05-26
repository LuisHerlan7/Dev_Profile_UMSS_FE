import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Github, Linkedin, LockKeyhole, Mail } from 'lucide-react';
import { AuthSplitLayout } from '@shared/components/auth/AuthSplitLayout';
import { SocialButton } from '@shared/components/auth/SocialButton';
import { TextField } from '@shared/components/auth/TextField';
import { Button } from '@shared/components/ui/Button';
import {
  getRedirectPathForRole,
  loginUser,
  persistAuthSession,
  readStoredAuthSession,
} from '@services/auth';
import { useI18n } from '@shared/i18n/I18nProvider';

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

export function LoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || '';
  const githubOauthUrl = `${apiBase || ''}/api/auth/github/redirect`;
  const linkedinOauthUrl = `${apiBase || ''}/api/auth/linkedin/redirect`;
  const googleOauthUrl = `${apiBase || ''}/api/auth/google/redirect`;

  useEffect(() => {
    const errorParam = searchParams.get('error')?.trim();
    if (errorParam) {
      setError(errorParam);
      return;
    }

    const storedSession = readStoredAuthSession();
    if (storedSession?.user) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');
    try {
      setIsSubmitting(true);
      const data = await loginUser({
        email: email.trim(),
        password,
      });
      persistAuthSession(data);
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'No se pudo iniciar sesión.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout>
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{t('auth.loginTitle')}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {t('auth.loginSubtitle')}
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <SocialButton
          icon={<Github className="h-4 w-4" />}
          aria-label="Continuar con GitHub"
          onClick={() => window.location.assign(githubOauthUrl)}
        >
          GitHub
        </SocialButton>
        <SocialButton
          icon={<Linkedin className="h-4 w-4" />}
          aria-label="Continuar con LinkedIn"
          onClick={() => window.location.assign(linkedinOauthUrl)}
        >
          LinkedIn
        </SocialButton>
        <SocialButton
          icon={<GoogleIcon />}
          aria-label="Continuar con Google"
          onClick={() => window.location.assign(googleOauthUrl)}
        >
          Google
        </SocialButton>
      </div>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />
        <div className="text-xs font-semibold text-slate-500">{t('auth.loginDivider')}</div>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <TextField
          label={t('auth.institutionalEmail')}
          type="email"
          placeholder="nombre.apellido@umss.edu"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <TextField
          label={t('auth.password')}
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value.replace(/\s/g, ''))}
          required
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 h-12 w-full bg-gradient-to-r from-[#6C63FF] via-[#4F46E5] to-[#0EA5E9] hover:from-[#5A52FF] hover:via-[#4338CA] hover:to-[#0284C7]"
        >
          <span>{isSubmitting ? t('auth.loggingIn') : t('auth.loginAction')}</span>
          <span className="sr-only">en UMSS Dev Network</span>
        </Button>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="mt-1 flex items-center justify-between text-sm">
          <Link to="/register" className="font-semibold text-[#6C63FF] hover:text-[#5A52FF]">
            {t('auth.createAccount')}
          </Link>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <div className="flex items-start gap-2">
            <Mail className="mt-0.5 h-4 w-4 text-slate-600" />
            <p className="leading-relaxed">
              {t('auth.verifiedNetwork')}
            </p>
          </div>
          <div className="mt-2 flex items-start gap-2">
            <LockKeyhole className="mt-0.5 h-4 w-4 text-slate-600" />
            <p className="leading-relaxed">
              {t('auth.backendValidation')}
            </p>
          </div>
        </div>
      </form>
    </AuthSplitLayout>
  );
}

