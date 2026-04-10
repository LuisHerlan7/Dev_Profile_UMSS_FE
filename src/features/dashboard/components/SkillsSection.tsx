import { Plus } from 'lucide-react';
import { DashboardBadge } from '@shared/components/dashboard/DashboardBadge';
import { DashboardCard } from '@shared/components/dashboard/DashboardCard';
import { SectionHeading } from './SectionHeading';

type TechnicalSkill = {
  name: string;
  level: string;
  progress: number;
};

type SkillsSectionProps = {
  technicalSkills: TechnicalSkill[];
  softSkills: string[];
};

export function SkillsSection({ technicalSkills, softSkills }: SkillsSectionProps) {
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
              // pending: conectar formulario real de habilidades técnicas.
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--umss-lavender)] text-[var(--umss-brand)] transition hover:bg-[rgba(80,72,229,0.18)]"
              aria-label="Agregar habilidad"
            >
              <Plus className="h-4 w-4" />
            </button>
          }
        >
          {technicalSkills.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[rgba(80,72,229,0.22)] bg-[rgba(240,240,255,0.45)] p-4 text-sm text-slate-600">
              Aún no registraste habilidades técnicas. Agrega tus tecnologías principales para mejorar tu perfil.
            </div>
          ) : (
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
          )}
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
          {softSkills.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[rgba(80,72,229,0.22)] bg-[rgba(240,240,255,0.45)] p-4 text-sm text-slate-600">
              No tienes habilidades blandas registradas. Agrega al menos una para completar tu perfil.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {softSkills.map((skill) => (
                <DashboardBadge key={skill} tone="brand">
                  {skill}
                </DashboardBadge>
              ))}
            </div>
          )}
        </DashboardCard>

      </div>
    </div>
  );
}
