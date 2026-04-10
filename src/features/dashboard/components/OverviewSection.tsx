import {
  Eye,
  FolderKanban,
  Grip,
  MoreVertical,
  PencilLine,
  Plus,
  Sparkles,
  Trophy,
  UserRoundCog,
} from 'lucide-react';
import { DashboardBadge } from '@shared/components/dashboard/DashboardBadge';
import { DashboardCard } from '@shared/components/dashboard/DashboardCard';
import { DashboardMetricCard } from '@shared/components/dashboard/DashboardMetricCard';
import { Button } from '@shared/components/ui/Button';

type OverviewMetric = {
  label: string;
  value: string;
  icon: JSX.Element;
  trend: string;
  trendTone: 'success' | 'warning';
};

type RecentProject = {
  id: string;
  name: string;
  stack: string;
  updated_at: string;
};

type OverviewSectionProps = {
  profileName: string;
  completion: number;
  nextStep: string;
  metrics: {
    projects: number;
    skills: number;
    profile_views: number;
  };
  recentProjects: RecentProject[];
  skillBadges: string[];
  onOpenProjects: () => void;
  onOpenSkills: () => void;
  onAddProject: () => void;
};

export function OverviewSection({
  onOpenProjects,
  onOpenSkills,
  onAddProject,
  profileName,
  completion,
  nextStep,
  metrics,
  recentProjects,
  skillBadges,
}: OverviewSectionProps) {
  const metricCards: OverviewMetric[] = [
    {
      label: 'Total de Proyectos',
      value: `${metrics.projects}`,
      icon: <FolderKanban className="h-5 w-5" />,
      trend: metrics.projects > 0 ? '+activo' : 'Sin datos',
      trendTone: metrics.projects > 0 ? 'success' : 'warning',
    },
    {
      label: 'Habilidades Dominadas',
      value: `${metrics.skills}`,
      icon: <Sparkles className="h-5 w-5" />,
      trend: metrics.skills > 0 ? '+activo' : 'Sin datos',
      trendTone: metrics.skills > 0 ? 'success' : 'warning',
    },
    {
      label: 'Visitas al Perfil',
      value: `${metrics.profile_views}`,
      icon: <Eye className="h-5 w-5" />,
      trend: metrics.profile_views > 0 ? '+activo' : 'Pendiente',
      trendTone: metrics.profile_views > 0 ? 'success' : 'warning',
    },
  ];

  return (
    <div className="space-y-6">
      <DashboardCard
        className="relative overflow-hidden"
        contentClassName="space-y-6 p-5 sm:p-6"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#6C63FF] via-[var(--umss-brand)] to-[var(--umss-accent)]" />

        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-[var(--umss-brand)]">
              Dashboard del desarrollador
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              Bienvenido de nuevo, {profileName}!
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              Gestiona tu portafolio profesional y realiza un seguimiento del crecimiento
              de tu perfil dentro de UMSS Dev Network.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" className="h-11 rounded-2xl px-4 text-sm">
              <PencilLine className="h-4 w-4" />
              Editar bio
            </Button>

            <Button
              className="h-11 rounded-2xl bg-gradient-to-r from-[#6C63FF] via-[var(--umss-brand)] to-[var(--umss-accent)] px-4 text-sm hover:from-[#5A52FF] hover:via-[#4338CA] hover:to-[#2563EB]"
              onClick={onAddProject}
            >
              <Plus className="h-4 w-4" />
              Anadir proyecto
            </Button>
          </div>
        </div>

        <div className="rounded-[24px] border border-[var(--umss-border)] bg-[var(--umss-surface)] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[var(--umss-brand)] shadow-sm">
                <UserRoundCog className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Perfil completado</p>
                <p className="text-sm text-slate-500">
                  Completa tu perfil para llegar a mas reclutadores.
                </p>
              </div>
            </div>
            <span className="text-sm font-semibold text-[var(--umss-brand)]">
              {completion}%
            </span>
          </div>

          <div className="mt-4 h-3 rounded-full bg-white p-1 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] via-[var(--umss-brand)] to-[var(--umss-accent)]"
              style={{ width: `${completion}%` }}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">{nextStep}</p>
            <button
              type="button"
              className="text-sm font-semibold text-[var(--umss-brand)] transition hover:text-[#4338CA]"
            >
              Completar ahora
            </button>
          </div>
        </div>
      </DashboardCard>

      <section className="grid gap-4 xl:grid-cols-3">
        {metricCards.map((metric) => (
          <DashboardMetricCard
            key={metric.label}
            icon={metric.icon}
            label={metric.label}
            value={metric.value}
            trend={metric.trend}
            trendTone={metric.trendTone}
          />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
        <DashboardCard
          title="Proyectos Recientes"
          description="Resumen rapido de tus proyectos mas activos."
          action={
            <button
              type="button"
              onClick={onOpenProjects}
              className="text-sm font-semibold text-[var(--umss-brand)] transition hover:text-[#4338CA]"
            >
              Ver todo
            </button>
          }
        >
          <div className="space-y-3">
            {recentProjects.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[rgba(80,72,229,0.22)] bg-[rgba(240,240,255,0.45)] p-4">
                <p className="text-sm font-semibold text-slate-900">Aún no tienes proyectos.</p>
                <p className="mt-2 text-sm text-slate-500">
                  Agrega tu primer proyecto para que aparezca en este resumen.
                </p>
                <button
                  type="button"
                  onClick={onOpenProjects}
                  className="mt-3 text-sm font-semibold text-[var(--umss-brand)]"
                >
                  Ir a Proyectos
                </button>
              </div>
            ) : (
              recentProjects.map((project) => (
                <article
                  key={project.id}
                  className="flex items-center justify-between gap-4 rounded-3xl border border-[var(--umss-border)] bg-[var(--umss-surface)] p-4 transition hover:border-[rgba(80,72,229,0.2)] hover:bg-white"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[rgba(80,72,229,0.12)] text-[var(--umss-brand)]">
                      <Grip className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {project.name}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>{project.stack}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span>{project.updated_at}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-slate-400 transition hover:bg-white hover:text-slate-700"
                    aria-label={`Acciones para ${project.name}`}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </article>
              ))
            )}
          </div>
        </DashboardCard>

        <div className="space-y-4">
          <DashboardCard
            title="Habilidades Principales"
            description="Tecnologias destacadas de tu stack."
            action={
              <button
                type="button"
                onClick={onOpenSkills}
                className="text-sm font-semibold text-[var(--umss-brand)] transition hover:text-[#4338CA]"
              >
                Gestionar
              </button>
            }
          >
            <div className="flex flex-wrap gap-2">
              {skillBadges.length === 0 ? (
                <DashboardBadge tone="neutral">Sin habilidades cargadas</DashboardBadge>
              ) : (
                skillBadges.map((skill, index) => (
                  <DashboardBadge key={skill} tone={index < 2 ? 'brand' : 'neutral'}>
                    {skill}
                  </DashboardBadge>
                ))
              )}
            </div>
          </DashboardCard>

          <DashboardCard title="Ultimo logro" description="Actividad destacada de este mes.">
            <div className="flex items-start gap-4 rounded-3xl border border-[var(--umss-border)] bg-[var(--umss-surface)] p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(245,158,11,0.12)] text-[var(--umss-warning)]">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Colaborador Open Source</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  Fusionaste 5 PRs en librerias importantes este mes.
                </p>
              </div>
            </div>
          </DashboardCard>
        </div>
      </section>
    </div>
  );
}
