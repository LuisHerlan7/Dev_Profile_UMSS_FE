import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthSplitLayout } from '@shared/components/auth/AuthSplitLayout';
import { SocialAuthButtons } from '@shared/components/auth/SocialAuthButtons';
import { TextField } from '@shared/components/auth/TextField';
import { Button } from '@shared/components/ui/Button';
import { readStoredAuthSession, registerUser } from '@services/auth';
import { useI18n } from '@shared/i18n/I18nProvider';

function GoogleIcon() {
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">G</span>
  );
}

export function RegisterPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const storedSession = readStoredAuthSession();
    if (storedSession?.user) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password !== passwordConfirmation) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    try {
      setIsSubmitting(true);
      await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(t('auth.registerSuccess'));
      setTimeout(() => navigate('/login'), 800);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Ocurrió un error al registrar.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout>
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{t('auth.registerTitle')}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {t('auth.registerSubtitle')}
      </p>
      <p className="mt-2 text-xs text-slate-500">
        {t('auth.registerExploreHint')}
      </p>

      <SocialAuthButtons mode="register" />

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />
        <div className="text-xs font-semibold text-slate-500">{t('auth.registerDivider')}</div>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <TextField
          label={t('auth.fullName')}
          type="text"
          placeholder="Tu nombre y apellido"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
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
          placeholder="Crea una contraseña segura"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value.replace(/\s/g, ''))}
          minLength={8}
          required
        />
        <TextField
          label={t('auth.confirmPassword')}
          type="password"
          placeholder="Repite tu contraseña"
          autoComplete="new-password"
          value={passwordConfirmation}
          onChange={(event) => setPasswordConfirmation(event.target.value.replace(/\s/g, ''))}
          minLength={8}
          required
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 h-12 w-full bg-gradient-to-r from-[#6C63FF] via-[#4F46E5] to-[#0EA5E9] hover:from-[#5A52FF] hover:via-[#4338CA] hover:to-[#0284C7]"
        >
          {isSubmitting ? t('auth.creatingAccount') : t('auth.createProfile')}
        </Button>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>}

        <p className="text-sm text-slate-600">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" className="font-semibold text-[#6C63FF] hover:text-[#5A52FF]">
            {t('auth.signInHere')}
          </Link>
        </p>

        <div className="pt-2">
          <Link to="/">
          </Link>
        </div>
      </form>
    </AuthSplitLayout>
  );
}

