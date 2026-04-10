import { Building2, GraduationCap } from 'lucide-react';
import { DashboardCard } from '@shared/components/dashboard/DashboardCard';

export type ExperienceEntry = {
  id: string;
  type: 'work' | 'study';
  title: string;
  subtitle: string;
  period: string;
  description: string;
};

type ExperienceTimelineCardProps = {
  entries?: ExperienceEntry[];
  showEmptyState?: boolean;
};

export function ExperienceTimelineCard({
  entries = [],
  showEmptyState = false,
}: ExperienceTimelineCardProps) {
  const showEmpty = showEmptyState && entries.length === 0;

  return (
    <DashboardCard title="Experiencia y Formacion">
      {showEmpty ? (
        <div className="rounded-[24px] border border-dashed border-[rgba(80,72,229,0.22)] bg-[rgba(240,240,255,0.45)] p-4 text-sm text-slate-600">
          Aún no registraste experiencia o formación. Agrega tu historial para completar el panel.
        </div>
      ) : (
        <div className="space-y-5">
          {entries.map((entry, index) => (
            <div key={entry.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                    entry.type === 'work'
                      ? 'bg-[rgba(80,72,229,0.12)] text-[var(--umss-brand)]'
                      : 'bg-[var(--umss-surface)] text-slate-500'
                  }`}
                >
                  {entry.type === 'work' ? (
                    <Building2 className="h-4 w-4" />
                  ) : (
                    <GraduationCap className="h-4 w-4" />
                  )}
                </div>
                {index < entries.length - 1 ? (
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
      )}
    </DashboardCard>
  );
}
