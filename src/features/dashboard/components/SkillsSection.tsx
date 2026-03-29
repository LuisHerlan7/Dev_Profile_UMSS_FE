import { Plus } from 'lucide-react';
import { DashboardBadge } from '@shared/components/dashboard/DashboardBadge';
import { DashboardCard } from '@shared/components/dashboard/DashboardCard';
import { ExperienceTimelineCard } from './ExperienceTimelineCard';
import { SectionHeading } from './SectionHeading';

const technicalSkills = [
  { name: 'React.js', level: 'Avanzado', progress: 84 },
  { name: 'TypeScript', level: 'Intermedio', progress: 68 },
  { name: 'Node.js', level: 'Intermedio', progress: 58 },
  { name: 'PostgreSQL', level: 'Principiante', progress: 42 },
] as const;

const softSkills = [
  'Trabajo en equipo',
  'Comunicacion asertiva',
  'Resolucion de problemas',
  'Liderazgo',
];

export function SkillsSection() {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Editor de Perfil"
        title="Habilidades y trayectoria"
        description="Lenguajes, frameworks, herramientas y experiencia resumidos como en el editor del mockup."
      />

      <div className="space-y-4">
        <DashboardCard
          title="Habilidades Tecnicas"
          description="Lenguajes, frameworks y herramientas."
          action={
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--umss-lavender)] text-[var(--umss-brand)] transition hover:bg-[rgba(80,72,229,0.18)]"
              aria-label="Agregar habilidad"
            >
              <Plus className="h-4 w-4" />
            </button>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            {technicalSkills.map((skill) => (
              <div
                key={skill.name}
                className="rounded-[24px] border border-[var(--umss-border)] bg-[var(--umss-surface)] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{skill.name}</p>
                  <span className="text-sm font-semibold text-[var(--umss-brand)]">
                    {skill.level}
                  </span>
                </div>

                <div className="mt-4 h-3 rounded-full bg-white p-1 shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] via-[var(--umss-brand)] to-[var(--umss-accent)]"
                    style={{ width: `${skill.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard
          title="Habilidades Blandas"
          action={
            <div className="flex items-center gap-2">
              <input
                type="text"
                disabled
                value="Agregar habilidad..."
                className="hidden h-10 rounded-2xl border border-[var(--umss-border)] bg-[var(--umss-surface)] px-3 text-sm text-slate-400 md:block"
                readOnly
              />
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--umss-brand)] text-white shadow-sm transition hover:bg-[#4338CA]"
                aria-label="Agregar habilidad blanda"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          }
        >
          <div className="flex flex-wrap gap-2">
            {softSkills.map((skill) => (
              <DashboardBadge key={skill} tone="brand">
                {skill}
              </DashboardBadge>
            ))}
          </div>
        </DashboardCard>

        <ExperienceTimelineCard />
      </div>
    </div>
  );
}
