import { Building2, GraduationCap } from 'lucide-react';
import { DashboardCard } from '@shared/components/dashboard/DashboardCard';

const experienceEntries = [
  {
    id: 'google',
    title: 'Google',
    subtitle: 'Senior Frontend Developer',
    period: 'January 2021 - Actualidad',
    description:
      'Liderazgo tecnico del equipo de UI para el proyecto Search Engine. Implementacion de micro-frontends usando React y Webpack 5.',
    tone: 'brand',
    icon: 'work',
  },
  {
    id: 'umss',
    title: 'Universidad Mayor de San Simon',
    subtitle: 'Ingenieria de Sistemas',
    period: '2016 - 2021',
    description:
      'Formacion base en arquitectura de software, estructuras de datos y desarrollo de aplicaciones web.',
    tone: 'neutral',
    icon: 'study',
  },
] as const;

export function ExperienceTimelineCard() {
  return (
    <DashboardCard title="Experiencia y Formacion">
      <div className="space-y-5">
        {experienceEntries.map((entry, index) => (
          <div key={entry.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                  entry.tone === 'brand'
                    ? 'bg-[rgba(80,72,229,0.12)] text-[var(--umss-brand)]'
                    : 'bg-[var(--umss-surface)] text-slate-500'
                }`}
              >
                {entry.icon === 'work' ? (
                  <Building2 className="h-4 w-4" />
                ) : (
                  <GraduationCap className="h-4 w-4" />
                )}
              </div>
              {index < experienceEntries.length - 1 ? (
                <div className="mt-3 h-full min-h-16 w-px bg-[var(--umss-border)]" />
              ) : null}
            </div>

            <div className="flex-1 rounded-[24px] border border-[var(--umss-border)] bg-[var(--umss-surface)] p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{entry.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{entry.subtitle}</p>
                </div>
                <span className="text-sm font-medium text-[var(--umss-brand)]">{entry.period}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{entry.description}</p>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
