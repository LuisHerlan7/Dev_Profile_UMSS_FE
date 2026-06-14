import type { ReactNode } from 'react';
import { Github, Linkedin } from 'lucide-react';
import { IconGoogle } from '@shared/components/auth/IconGoogle';
import { SocialButton } from '@shared/components/auth/SocialButton';

type SocialProvider = 'github' | 'linkedin' | 'google';

function getOAuthRedirectUrl(provider: SocialProvider): string {
  const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.trim().replace(/\/$/, '') ?? '';
  return `${apiBase}/api/auth/${provider}/redirect`;
}

const providers: Array<{
  id: SocialProvider;
  label: string;
  icon: ReactNode;
  loginAria: string;
  registerAria: string;
}> = [
  {
    id: 'github',
    label: 'GitHub',
    icon: <Github className="h-4 w-4" />,
    loginAria: 'Continuar con GitHub',
    registerAria: 'Registrarse con GitHub',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: <Linkedin className="h-4 w-4" />,
    loginAria: 'Continuar con LinkedIn',
    registerAria: 'Registrarse con LinkedIn',
  },
  {
    id: 'google',
    label: 'Google',
    icon: <IconGoogle />,
    loginAria: 'Continuar con Google',
    registerAria: 'Registrarse con Google',
  },
];

type SocialAuthButtonsProps = {
  mode: 'login' | 'register';
};

export function SocialAuthButtons({ mode }: SocialAuthButtonsProps) {
  return (
    <div className="mt-6 flex w-full flex-col gap-3">
      {providers.map((provider) => (
        <SocialButton
          key={provider.id}
          icon={provider.icon}
          aria-label={mode === 'login' ? provider.loginAria : provider.registerAria}
          onClick={() => window.location.assign(getOAuthRedirectUrl(provider.id))}
        >
          {provider.label}
        </SocialButton>
      ))}
    </div>
  );
}
