import { Link } from 'react-router-dom';
import { Github, Linkedin } from 'lucide-react';
import { AuthSplitLayout } from '@shared/components/auth/AuthSplitLayout';
import { SocialButton } from '@shared/components/auth/SocialButton';
import { TextField } from '@shared/components/auth/TextField';
import { Button } from '@shared/components/ui/Button';

export function RegisterPage() {
  return (
    <AuthSplitLayout>
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Crear cuenta</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Únete a la comunidad de desarrolladores más grande de la UMSS.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <SocialButton icon={<Github className="h-4 w-4" />} aria-label="Registrarse con GitHub">
          GitHub
        </SocialButton>
        <SocialButton
          icon={<Linkedin className="h-4 w-4" />}
          aria-label="Registrarse con LinkedIn"
        >
          LinkedIn
        </SocialButton>
      </div>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />
        <div className="text-xs font-semibold text-slate-500">O regístrate con correo</div>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form className="grid gap-4">
        <TextField label="Nombre completo" type="text" placeholder="Tu nombre y apellido" />
        <TextField
          label="Correo institucional"
          type="email"
          placeholder="nombre.apellido@umss.edu"
          autoComplete="email"
          inputMode="email"
        />
        <TextField label="ID de estudiante" type="text" placeholder="Ej. 123456" />
        <TextField
          label="Contraseña"
          type="password"
          placeholder="Crea una contraseña segura"
          autoComplete="new-password"
        />

        <Button
          className="mt-1 h-12 w-full bg-gradient-to-r from-[#6C63FF] via-[#4F46E5] to-[#0EA5E9] hover:from-[#5A52FF] hover:via-[#4338CA] hover:to-[#0284C7]"
        >
          Crear mi perfil →
        </Button>

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

