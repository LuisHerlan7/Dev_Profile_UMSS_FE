import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Github, Linkedin, LockKeyhole, Mail } from 'lucide-react';
import { AuthSplitLayout } from '@shared/components/auth/AuthSplitLayout';
import { SocialButton } from '@shared/components/auth/SocialButton';
import { TextField } from '@shared/components/auth/TextField';
import { Button } from '@shared/components/ui/Button';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || '';
  const loginEndpoint = `${apiBase || ''}/api/auth/login`;
  const githubOauthUrl = `${apiBase || ''}/api/auth/github/redirect`;
  const linkedinOauthUrl = `${apiBase || ''}/api/auth/linkedin/redirect`;

  const getRedirectByRole = (role?: string) => {
    if (role === 'desarrollador') return '/desarrollador';
    if (role === 'admin') return '/admin';
    return '/visitante';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');
    try {
      setIsSubmitting(true);
      const response = await fetch(loginEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const firstValidationError = data?.errors
          ? Object.values(data.errors)[0]
          : null;
        const validationMessage = Array.isArray(firstValidationError) ? firstValidationError[0] : null;
        throw new Error(validationMessage || data?.message || 'Correo o contrasena incorrectos');
      }

      if (data?.token) {
        localStorage.setItem('auth_token', data.token);
      }

      navigate(getRedirectByRole(data?.user?.role));
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'No se pudo iniciar sesion.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout>
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Iniciar sesión</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Bienvenido de vuelta. Accede a UMSS Dev Network para continuar construyendo tu perfil.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
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
      </div>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />
        <div className="text-xs font-semibold text-slate-500">O ingresa con correo</div>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <TextField
          label="Correo institucional"
          type="email"
          placeholder="nombre.apellido@umss.edu"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <TextField
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 h-12 w-full bg-gradient-to-r from-[#6C63FF] via-[#4F46E5] to-[#0EA5E9] hover:from-[#5A52FF] hover:via-[#4338CA] hover:to-[#0284C7]"
        >
          <span>{isSubmitting ? 'Ingresando...' : 'Iniciar sesion ->'}</span>
          <span className="sr-only">en UMSS Dev Network</span>
        </Button>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="mt-1 flex items-center justify-between text-sm">
          <Link to="/register" className="font-semibold text-[#6C63FF] hover:text-[#5A52FF]">
            Crear cuenta
          </Link>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <div className="flex items-start gap-2">
            <Mail className="mt-0.5 h-4 w-4 text-slate-600" />
            <p className="leading-relaxed">
              Usa tu correo institucional para una red verificada dentro de la UMSS.
            </p>
          </div>
          <div className="mt-2 flex items-start gap-2">
            <LockKeyhole className="mt-0.5 h-4 w-4 text-slate-600" />
            <p className="leading-relaxed">
              Tus credenciales se validan contra la base de datos del backend.
            </p>
          </div>
        </div>
      </form>
    </AuthSplitLayout>
  );
}

