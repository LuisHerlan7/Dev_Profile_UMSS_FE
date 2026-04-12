import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Github, Linkedin } from 'lucide-react';
import { AuthSplitLayout } from '@shared/components/auth/AuthSplitLayout';
import { SocialButton } from '@shared/components/auth/SocialButton';
import { TextField } from '@shared/components/auth/TextField';
import { Button } from '@shared/components/ui/Button';
import { getRedirectPathForRole, readStoredAuthSession, registerUser } from '@services/auth';

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || '';
  const githubOauthUrl = `${apiBase || ''}/api/auth/github/redirect`;
  const linkedinOauthUrl = `${apiBase || ''}/api/auth/linkedin/redirect`;

  useEffect(() => {
    const storedSession = readStoredAuthSession();

    if (!storedSession?.user) {
      return;
    }

    navigate(getRedirectPathForRole(storedSession.user.role, storedSession.dashboard), { replace: true });
  }, [navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password !== passwordConfirmation) {
      setError('Las contraseñas no coinciden.');
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
      setSuccess('Cuenta creada correctamente. Ahora puedes iniciar sesion con tu rol asignado.');
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
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Crear cuenta</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Únete a la comunidad de desarrolladores más grande de la UMSS.
      </p>
      <p className="mt-2 text-xs text-slate-500">
        ¿Solo quieres explorar? Puedes visitar la sección Explorar sin crear una cuenta.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <SocialButton
          icon={<Github className="h-4 w-4" />}
          aria-label="Registrarse con GitHub"
          onClick={() => window.location.assign(githubOauthUrl)}
        >
          GitHub
        </SocialButton>
        <SocialButton
          icon={<Linkedin className="h-4 w-4" />}
          aria-label="Registrarse con LinkedIn"
          onClick={() => window.location.assign(linkedinOauthUrl)}
        >
          LinkedIn
        </SocialButton>
      </div>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />
        <div className="text-xs font-semibold text-slate-500">O regístrate con correo</div>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <TextField
          label="Nombre completo"
          type="text"
          placeholder="Tu nombre y apellido"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
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
          placeholder="Crea una contraseña segura"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value.replace(/\s/g, ''))}
          minLength={8}
          required
        />
        <TextField
          label="Confirmar contraseña"
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
          {isSubmitting ? 'Creando cuenta...' : 'Crear mi perfil →'}
        </Button>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>}

        <p className="text-sm text-slate-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-[#6C63FF] hover:text-[#5A52FF]">
            Inicia sesión
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

