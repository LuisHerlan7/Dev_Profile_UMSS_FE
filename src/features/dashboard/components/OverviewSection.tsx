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

const metrics = [
  {
    label: 'Total de Proyectos',
    value: '12',
    icon: <FolderKanban className="h-5 w-5" />,
    trend: '+20%',
    trendTone: 'success' as const,
  },
  {
    label: 'Habilidades Dominadas',
    value: '24',
    icon: <Sparkles className="h-5 w-5" />,
    trend: '+5%',
    trendTone: 'success' as const,
  },
  {
    label: 'Visitas al Perfil',
    value: '1.240',
    icon: <Eye className="h-5 w-5" />,
    trend: '-2%',
    trendTone: 'warning' as const,
  },
];

const recentProjects = [
  {
    id: 'api-commerce',
    name: 'Backend API E-commerce',
    stack: 'Node.js',
    updatedAt: 'Actualizado hace 2 dias',
    accentClassName: 'bg-[rgba(80,72,229,0.12)] text-[var(--umss-brand)]',
  },
  {
    id: 'portfolio-v3',
    name: 'Sitio Web Portafolio v3',
    stack: 'React',
    updatedAt: 'Actualizado hace 5 dias',
    accentClassName: 'bg-[rgba(16,185,129,0.12)] text-[var(--umss-success)]',
  },
] as const;

const skillBadges = ['TypeScript', 'React.js', 'GraphQL', 'Docker', 'AWS', 'PostgreSQL'];

export function OverviewSection({
  onOpenProjects,
  onOpenSkills,
}: {
  onOpenProjects: () => void;
  onOpenSkills: () => void;
}) {
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
              Bienvenido de nuevo, Alex!
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

            <Button className="h-11 rounded-2xl bg-gradient-to-r from-[#6C63FF] via-[var(--umss-brand)] to-[var(--umss-accent)] px-4 text-sm hover:from-[#5A52FF] hover:via-[#4338CA] hover:to-[#2563EB]">
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
            <span className="text-sm font-semibold text-[var(--umss-brand)]">75%</span>
          </div>

          <div className="mt-4 h-3 rounded-full bg-white p-1 shadow-inner">
            <div className="h-full w-[75%] rounded-full bg-gradient-to-r from-[#6C63FF] via-[var(--umss-brand)] to-[var(--umss-accent)]" />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">Anade una bio para llegar al 100%.</p>
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
        {metrics.map((metric) => (
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
            {recentProjects.map((project) => (
              <article
                key={project.id}
                className="flex items-center justify-between gap-4 rounded-3xl border border-[var(--umss-border)] bg-[var(--umss-surface)] p-4 transition hover:border-[rgba(80,72,229,0.2)] hover:bg-white"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${project.accentClassName}`}
                  >
                    <Grip className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {project.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{project.stack}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span>{project.updatedAt}</span>
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
            ))}
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
              {skillBadges.map((skill, index) => (
                <DashboardBadge key={skill} tone={index < 2 ? 'brand' : 'neutral'}>
                  {skill}
                </DashboardBadge>
              ))}
              <DashboardBadge tone="brand">+4 mas</DashboardBadge>
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
