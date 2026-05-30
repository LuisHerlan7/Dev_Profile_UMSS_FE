import {
  BriefcaseBusiness,
  Eye,
  Download,
  FolderKanban,
  Grip,
  MoreVertical,
  PencilLine,
  Plus,
  Sparkles,
  UserRoundCog,
  Trophy,
} from 'lucide-react';
import { DashboardBadge } from '@shared/components/dashboard/DashboardBadge';
import { DashboardCard } from '@shared/components/dashboard/DashboardCard';
import { DashboardMetricCard } from '@shared/components/dashboard/DashboardMetricCard';
import { Button } from '@shared/components/ui/Button';
import { useI18n } from '@shared/i18n/I18nProvider';
import type { OverviewMetric, OverviewRecentProject } from '@features/dashboard/utils/developerDashboardMappers';

export function OverviewSection({
  onOpenProjects,
  onOpenProjectForm,
  onOpenReport,
  onOpenSkills,
  onOpenSettings,
  onDismissCompletion,
  metrics = [],
  recentProjects = [],
  topSkills = [],
  firstName = 'desarrollador',
  completionPercentage = 0,
  nextStep = 'Completa tu perfil para destacar más.',
  contactEmail = '',
  contactPhone = '',
  titleHierarchy = [],
  roleHierarchy = [],
  showCompletionCard = true,
}: {
  onOpenProjects: () => void;
  onOpenProjectForm: () => void;
  onOpenReport: () => void;
  onOpenSkills: () => void;
  onOpenSettings: () => void;
  onDismissCompletion?: () => void;
  metrics?: OverviewMetric[];
  recentProjects?: OverviewRecentProject[];
  topSkills?: string[];
  firstName?: string;
  completionPercentage?: number;
  nextStep?: string;
  contactEmail?: string;
  contactPhone?: string;
  titleHierarchy?: string[];
  roleHierarchy?: string[];
  showCompletionCard?: boolean;
}) {
  const { t } = useI18n();

  const renderIcon = (iconId: string) => {
    switch (iconId) {
      case 'folder': return <FolderKanban className="h-5 w-5" />;
      case 'sparkles': return <Sparkles className="h-5 w-5" />;
      case 'briefcase': return <BriefcaseBusiness className="h-5 w-5" />;
      default: return <Eye className="h-5 w-5" />;
    }
  };

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
              {t('dashboard.overview.eyebrow')}
            </p>
            <h1 className="mt-2 break-words text-2xl font-semibold tracking-tight text-slate-900 capitalize sm:text-3xl">
              {t('dashboard.overview.title', { name: firstName })}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              {t('dashboard.overview.subtitle')}
            </p>
          </div>

          <div className="grid w-full gap-3 sm:flex sm:flex-wrap xl:w-auto">
            <Button
              onClick={onOpenReport}
              variant="secondary"
              className="h-11 w-full justify-center rounded-2xl px-4 text-sm sm:w-auto"
            >
              <Download className="h-4 w-4" />
              {t('dashboard.overview.exportCv')}
            </Button>
            <Button 
              onClick={onOpenSettings}
              variant="secondary" 
              className="h-11 w-full justify-center rounded-2xl px-4 text-sm sm:w-auto"
            >
              <PencilLine className="h-4 w-4" />
              {t('dashboard.overview.editBio')}
            </Button>

            <Button
              onClick={onOpenProjectForm}
              className="h-11 w-full justify-center rounded-2xl bg-gradient-to-r from-[#6C63FF] via-[var(--umss-brand)] to-[#2563EB] px-4 text-sm sm:w-auto hover:from-[#5A52FF] hover:via-[#4338CA] hover:to-[#2563EB]"
            >
              <Plus className="h-4 w-4" />
              {t('dashboard.overview.addProject')}
            </Button>
          </div>
        </div>

        {showCompletionCard ? <div className="rounded-[24px] border border-[var(--umss-border)] bg-[var(--umss-surface)] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[var(--umss-brand)] shadow-sm">
                <UserRoundCog className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{t('dashboard.overview.profileCompleted')}</p>
                <p className="text-sm text-slate-600 font-medium">
                  {nextStep}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[var(--umss-brand)]">{completionPercentage}%</span>
              <button
                type="button"
                onClick={onDismissCompletion}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-700"
                aria-label="Ocultar progreso de perfil"
              >
                ×
              </button>
            </div>
          </div>

          <div className="mt-4 h-3 rounded-full bg-white p-1 shadow-inner">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] via-[var(--umss-brand)] to-[var(--umss-accent)] transition-all duration-1000" 
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {completionPercentage < 100
                ? t('dashboard.overview.completeHint')
                : t('dashboard.overview.completeDone')}
            </p>
            {completionPercentage < 100 && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="text-sm font-semibold text-[var(--umss-brand)] transition hover:text-[#4338CA]"
              >
                {t('dashboard.overview.completeNow')}
              </button>
            )}
          </div>
        </div> : null}
      </DashboardCard>

      <section className="grid gap-4 xl:grid-cols-3">
        {Array.isArray(metrics) && metrics.map((metric) => (
          <DashboardMetricCard
            key={metric.label}
            icon={renderIcon(metric.iconId)}
            label={metric.label}
            value={metric.value}
            trend={metric.trend}
            trendTone={metric.trendTone}
          />
        ))}
        {metrics.length === 0 && (
           <>
            <DashboardMetricCard label="Proyectos" value="0" icon={<FolderKanban className="h-5 w-5" />} trend="Cargando..." trendTone="info" />
            <DashboardMetricCard label="Habilidades" value="0" icon={<Sparkles className="h-5 w-5" />} trend="Cargando..." trendTone="info" />
            <DashboardMetricCard label="Visitas" value="—" icon={<Eye className="h-5 w-5" />} trend="Próximamente" trendTone="info" />
           </>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
        <DashboardCard
          title={t('dashboard.overview.recentProjects')}
          description={t('dashboard.overview.recentProjectsSubtitle')}
          action={
            <button
              type="button"
              onClick={onOpenProjects}
              className="text-sm font-semibold text-[var(--umss-brand)] transition hover:text-[#4338CA]"
            >
              {t('common.viewAll')}
            </button>
          }
        >
          <div className="space-y-3">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
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
              ))
            ) : (
              <div className="py-8 text-center text-slate-500">
              <FolderKanban className="mx-auto h-8 w-8 opacity-20" />
                <p className="mt-2 text-sm">{t('dashboard.overview.noRecentProjects')}</p>
              </div>
            )}
          </div>
        </DashboardCard>

        <div className="space-y-4">
          <DashboardCard title={t('dashboard.overview.contactInfo')} description={t('dashboard.overview.contactInfoSubtitle')}>
            <div className="space-y-3">
              <div className="rounded-3xl border border-[var(--umss-border)] bg-[var(--umss-surface)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t('common.email')}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {contactEmail || t('dashboard.overview.notConfiguredYet')}
                </p>
              </div>
              <div className="rounded-3xl border border-[var(--umss-border)] bg-[var(--umss-surface)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t('common.phone')}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {contactPhone || t('dashboard.overview.notConfiguredYet')}
                </p>
              </div>
              {(titleHierarchy.length > 0 || roleHierarchy.length > 0) ? (
                <div className="rounded-3xl border border-[var(--umss-border)] bg-[var(--umss-surface)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t('dashboard.overview.trajectorySummary')}</p>
                  {titleHierarchy.length > 0 ? (
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-slate-900">{t('dashboard.overview.titles')}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {titleHierarchy.map((item) => (
                          <DashboardBadge key={item} tone="neutral">{item}</DashboardBadge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {roleHierarchy.length > 0 ? (
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-slate-900">{t('dashboard.overview.roles')}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {roleHierarchy.map((item) => (
                          <DashboardBadge key={item} tone="brand">{item}</DashboardBadge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </DashboardCard>

          <DashboardCard
            title={t('dashboard.overview.topSkills')}
            description={t('dashboard.overview.topSkillsSubtitle')}
            action={
              <button
                type="button"
              onClick={onOpenSkills}
              className="text-sm font-semibold text-[var(--umss-brand)] transition hover:text-[#4338CA]"
            >
              {t('dashboard.overview.manage')}
            </button>
          }
          >
            <div className="flex flex-wrap gap-2">
              {topSkills.length > 0 ? (
                topSkills.map((skill, index) => (
                  <DashboardBadge key={skill} tone={index < 3 ? 'brand' : 'neutral'}>
                    {skill}
                  </DashboardBadge>
                ))
              ) : (
                <p className="text-sm text-slate-400">{t('common.noData')}</p>
              )}
            </div>
          </DashboardCard>

          <DashboardCard title={t('dashboard.overview.lastAchievement')} description={t('dashboard.overview.lastAchievementSubtitle')}>
            <div className="flex items-start gap-4 rounded-3xl border border-[var(--umss-border)] bg-[var(--umss-surface)] p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(245,158,11,0.12)] text-[var(--umss-warning)]">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{t('dashboard.overview.achievementTitle')}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  {t('dashboard.overview.achievementText')}
                </p>
              </div>
            </div>
          </DashboardCard>
        </div>
      </section>
    </div>
  );
}
