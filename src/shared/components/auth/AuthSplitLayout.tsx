import type { PropsWithChildren, ReactNode } from 'react';
import { cn } from '@shared/utils/cn';
import { ButtonBack } from '@shared/components/ui/ButtonBack';

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type InfoItem = {
  title: string;
  description: string;
  icon?: ReactNode;
};

export function AuthSplitLayout({
  children,
  title = 'Construye tu futuro en la UMSS.',
  description = 'Una red universitaria de desarrolladores donde estudiantes pueden conectar, colaborar en proyectos y descubrir oportunidades tecnológicas.',
  items = [
    {
      title: 'Red verificada',
      description:
        'Conecta con estudiantes y egresados reales mediante autenticación universitaria.',
    },
    {
      title: 'Red verificada',
      description:
        'Conecta con estudiantes y egresados reales mediante autenticación universitaria segura.',
    },
  ],
  className,
}: PropsWithChildren<{
  title?: string;
  description?: string;
  items?: InfoItem[];
  className?: string;
}>) {
  return (
    <div className={cn('bg-[#F9FAFB]', className)}>
      <div className="grid lg:grid-cols-2">
        {/* Left info */}
        <aside className="relative hidden overflow-hidden text-white lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-[#6C63FF] via-[#4F46E5] to-[#0EA5E9]" />
          <div className="absolute inset-0 opacity-35">
            <div className="absolute -top-24 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-white/25 blur-3xl" />
            <div className="absolute -bottom-28 right-0 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
          </div>

          <div className="relative flex h-full flex-col justify-between p-10">
            <div>
              <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide ring-1 ring-white/20">
                UMSS Dev Network
              </div>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight">
                {title}
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
                {description}
              </p>

              <div className="mt-10 grid gap-4">
                {items.map((it, idx) => (
                  <div
                    key={`${it.title}-${idx}`}
                    className="flex items-start gap-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                      <span className="text-white">{it.icon ?? <CheckIcon />}</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{it.title}</div>
                      <div className="mt-1 text-sm leading-relaxed text-white/80">
                        {it.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial */}
            <div className="mt-12">
              <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                <div className="h-12 w-12 rounded-full bg-white/20 ring-2 ring-white/25" />
                <div>
                  <p className="text-sm leading-relaxed text-white/85">
                    “Me ayudó a organizar mis proyectos y compartir mi perfil con empresas sin
                    complicarme.”
                  </p>
                  <p className="mt-2 text-xs font-semibold tracking-wide text-white/80">
                    Estudiante UMSS · Ingeniería
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right form */}
        <section className="flex items-start justify-center p-6 pt-10 sm:p-8 sm:pt-12 lg:py-12">
          <div className="w-full max-w-md">
            <div className="mb-4 flex items-center justify-between">
              <ButtonBack />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)] sm:p-6">
              {children}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

