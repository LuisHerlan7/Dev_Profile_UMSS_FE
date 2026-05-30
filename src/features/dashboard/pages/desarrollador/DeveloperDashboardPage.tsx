import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  BriefcaseBusiness,
  Code2,
  FileText,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  Menu,
  Settings,
} from 'lucide-react';
import {
  DashboardSidebar,
  type DashboardSidebarItem,
} from '@shared/components/dashboard/DashboardSidebar';
import { DashboardLayout } from '@shared/components/dashboard/DashboardLayout';
import { DashboardTopbar, type SearchResultItem } from '@shared/components/dashboard/DashboardTopbar';
import { OverviewSection } from '@features/dashboard/components/OverviewSection';
import { ProjectsSection, type ProjectItem } from '@features/dashboard/components/ProjectsSection';
import { SkillsSection } from '@features/dashboard/components/SkillsSection';
import { ExperienceSection } from '@features/dashboard/components/ExperienceSection';
import { SettingsSection } from '@features/dashboard/components/SettingsSection';
import { SidebarVisibilityCard } from '@features/dashboard/components/SidebarVisibilityCard';
import { EvidenceSection } from '@features/dashboard/components/EvidenceSection';
import { useAuthSession } from '@shared/hooks/useAuthSession';
import { logoutUser, persistAuthSession, readStoredAuthSession, updateUserLanguagePreference } from '@services/auth';
import { fetchDeveloperDashboard } from '@services/dashboard';
import {
  buildOverviewMetrics,
  buildRecentProjects,
  buildSettingsProfile,
  buildTopSkillBadges,
  buildVisibilityHighlights,
  buildVisibilitySettings,
  estimateProfileCompletion,
  mapExperienciaYFormacion,
  mapHabilidades,
  mapProyectosToProjectItems,
  sidebarHeadline,
  welcomeFirstName,
} from '@features/dashboard/utils/developerDashboardMappers';
import { updateProjectVisibility, updateVisibilitySettings } from '@features/dashboard/api/developerDashboard';
import { useI18n } from '@shared/i18n/I18nProvider';
import type { AppLanguage } from '@shared/i18n/storage';

type SectionId = 'overview' | 'projects' | 'evidence' | 'skills' | 'experience' | 'settings';

const PortfolioReportModal = lazy(() =>
  import('@features/dashboard/components/PortfolioReportModal').then((module) => ({
    default: module.PortfolioReportModal,
  }))
);

const baseNavItemDefs: Array<{ id: SectionId; icon: JSX.Element }> = [
  {
    id: 'overview',
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    id: 'projects',
    icon: <FolderKanban className="h-4 w-4" />,
  },
  {
    id: 'evidence',
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: 'skills',
    icon: <Code2 className="h-4 w-4" />,
  },
  {
    id: 'experience',
    icon: <BriefcaseBusiness className="h-4 w-4" />,
  },
  {
    id: 'settings',
    icon: <Settings className="h-4 w-4" />,
  },
];

export function DeveloperDashboardPage() {
  const { t, setLanguage } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isPublicProfile, setIsPublicProfile] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeQuickPanel, setActiveQuickPanel] = useState<'notifications' | 'settings' | null>(null);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('developer_read_notifications') || '[]');
    } catch {
      return [];
    }
  });
  const [hideCompletionCard, setHideCompletionCard] = useState(() => localStorage.getItem('hide_profile_completion') === 'true');
  
  // Usar el nuevo sistema de sesión de dev para estabilidad en redirecciones
  const { session, isLoading: isSessionLoading } = useAuthSession({
    requiredRole: 'desarrollador',
    redirectTo: '/login',
  });

  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [dashboardError, setDashboardError] = useState('');
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!session?.token) return;
    try {
      // Usar el nuevo servicio de fetch con el token de sesión
      const data = await fetchDeveloperDashboard(session.token);
      setDashboardData(data);
      setDashboardError('');
      // Mapear proyectos usando la lógica local existente
      if (data.proyectos || data.projects) {
          const rawProyects = data.proyectos || data.projects;
          setProjects(mapProyectosToProjectItems(rawProyects as any));
      }
    } catch (requestError) {
      console.error('Error al cargar dashboard', requestError);
      setDashboardError(requestError instanceof Error ? requestError.message : t('dashboard.errors.dashboardLoad'));
    }
  }, [session?.token, t]);

  useEffect(() => {
    if (session?.token) {
      fetchDashboardData();
    }
  }, [session?.token, fetchDashboardData]);

  // Manejar sección desde la URL (Feature local)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    if (section && ['overview', 'projects', 'evidence', 'skills', 'experience', 'settings'].includes(section)) {
      setActiveSection(section as SectionId);
    }
  }, [location.search]);

  const refreshDashboard = async () => {
    await fetchDashboardData();
  };

  const handleOpenProjectForm = () => {
    setActiveSection('projects');
    navigate('/nuevo-proyecto');
  };

  const handleLanguageChange = async (language: AppLanguage) => {
    setLanguage(language);

    const storedSession = readStoredAuthSession();
    if (storedSession?.user) {
      persistAuthSession({
        ...storedSession,
        user: {
          ...storedSession.user,
          preferred_language: language,
        },
      });
    }

    try {
      await updateUserLanguagePreference(language);
      await fetchDashboardData();
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : 'No se pudo guardar la preferencia de idioma.');
    }
  };

  const handleToggleVisibility = async (projectId: string) => {
    const targetProject = projects.find((project) => project.id === projectId);
    if (!targetProject) return;

    const nextVisibility = !targetProject.visible;

    setProjects((items) =>
      items.map((project) =>
        project.id === projectId ? { ...project, visible: nextVisibility } : project
      )
    );

    try {
      await updateProjectVisibility(projectId, nextVisibility);
      await fetchDashboardData();
    } catch (error) {
      setProjects((items) =>
        items.map((project) =>
          project.id === projectId ? { ...project, visible: targetProject.visible } : project
        )
      );
      setDashboardError(
        error instanceof Error ? error.message : t('dashboard.errors.projectVisibility')
      );
    }
  };

  const handleEditProject = (projectId: string) => {
    navigate(`/editar-proyecto/${projectId}`);
  };

  // Mapeos locales existentes para mantener la UI funcional
  const technicalAndSoft = mapHabilidades(dashboardData?.habilidades ?? dashboardData?.skills?.technical ?? []);
  const profileName = session?.user?.name ?? dashboardData?.auth_user?.name ?? 'Desarrollador';
  const profileRole = dashboardData ? sidebarHeadline(dashboardData) : 'Desarrollador';
  const profileAvatar = (dashboardData?.usuario?.fotografiaUrl as string | undefined) ?? null;
  const overviewMetrics = dashboardData ? buildOverviewMetrics(dashboardData) : [];
  const recentProjects = dashboardData ? buildRecentProjects(dashboardData.proyectos || dashboardData.recent_projects || []) : [];
  const topSkills = dashboardData ? buildTopSkillBadges(dashboardData.habilidades || dashboardData.skills?.technical || []) : [];
  const settingsProfile = dashboardData ? buildSettingsProfile(dashboardData) : undefined;
  const visibilityHighlights = dashboardData ? buildVisibilityHighlights(dashboardData) : undefined;
  const visibilitySettings = dashboardData ? buildVisibilitySettings(dashboardData) : undefined;
  const completionPercentage = dashboardData ? estimateProfileCompletion(dashboardData) : 0;
  const firstName = dashboardData ? welcomeFirstName(dashboardData) : (session?.user?.name?.split(' ')[0] || 'desarrollador');
  const experienceRecords = dashboardData ? mapExperienciaYFormacion(dashboardData.experiencias || dashboardData.experience || [], dashboardData.formaciones || []) : [];
  const baseNavItems = useMemo<Array<Omit<DashboardSidebarItem, 'active'> & { id: SectionId }>>(
    () => [
      { ...baseNavItemDefs[0], label: t('dashboard.sections.overview') },
      { ...baseNavItemDefs[1], label: t('dashboard.sections.projects') },
      { ...baseNavItemDefs[2], label: t('dashboard.sections.evidence') },
      { ...baseNavItemDefs[3], label: t('dashboard.sections.skills') },
      { ...baseNavItemDefs[4], label: t('dashboard.sections.experience') },
      { ...baseNavItemDefs[5], label: t('dashboard.sections.settings') },
    ],
    [t]
  );

  useEffect(() => {
    if (visibilitySettings) {
      setIsPublicProfile(visibilitySettings.mode !== 'privado');
    }
  }, [visibilitySettings]);

  // Mantener el índice de búsqueda global (Feature local)
  const searchIndex: SearchResultItem[] = [
    ...projects.map((p) => ({
      id: `project-${p.id}`,
      label: p.title,
      sublabel: p.subtitle || p.tags.join(', '),
      section: 'projects' as const,
      sectionLabel: t('dashboard.sections.projects'),
      elementId: `project-card-${p.id}`,
    })),
    ...technicalAndSoft.technical.map((s) => ({
      id: `skill-tech-${s.id}`,
      label: s.name,
      sublabel: s.level,
      section: 'skills' as const,
      sectionLabel: t('dashboard.sections.skills'),
      elementId: `skill-${s.id}`,
    })),
    ...experienceRecords.map((e) => ({
      id: `exp-${e.id}`,
      label: e.title,
      sublabel: e.recordType,
      section: 'experience' as const,
      sectionLabel: t('dashboard.sections.experience'),
      elementId: `experience-${e.id}`,
    })),
  ];

  const handleGlobalNavigate = (section: string, elementId?: string) => {
    setActiveSection(section as SectionId);
    if (elementId) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          const el = document.getElementById(elementId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-2', 'ring-[var(--umss-brand)]', 'ring-offset-2');
            setTimeout(() => el.classList.remove('ring-2', 'ring-[var(--umss-brand)]', 'ring-offset-2'), 1800);
          }
        }, 120);
      });
    }
  };

  const sectionLabels = {
    overview: t('dashboard.sections.overview'),
    projects: t('dashboard.sections.projects'),
    evidence: t('dashboard.sections.evidence'),
    skills: t('dashboard.sections.skills'),
    experience: t('dashboard.sections.experience'),
    settings: t('dashboard.sections.settings'),
  };
  const evidenceNotifications = (dashboardData?.evidences ?? [])
    .filter((item: any) => ['verificado', 'rechazado'].includes(String(item.estado || item.status || '').toLowerCase()))
    .slice(0, 5);
  const unreadEvidenceNotifications = evidenceNotifications.filter((item: any) => !readNotificationIds.includes(String(item.id ?? item.titulo ?? item.title)));

  const navItems = baseNavItems.map((item) => ({
    ...item,
    label: sectionLabels[item.id] || item.label,
    active: item.id === activeSection,
  }));

  if (isSessionLoading && !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--umss-surface)] p-6">
        <div className="w-full max-w-xl rounded-[28px] border border-[var(--umss-border)] bg-white p-6 text-center shadow-[0_18px_40_rgba(15,23,42,0.28)]">
          <p className="text-sm font-semibold text-[var(--umss-brand)]">{t('dashboard.loadingTitle')}</p>
          <p className="mt-2 text-sm text-slate-600">{t('dashboard.loadingSubtitle')}</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <DashboardLayout
      sidebarCollapsed={isSidebarCollapsed}
      mobileSidebarOpen={isMobileSidebarOpen}
      onCloseMobileSidebar={() => setIsMobileSidebarOpen(false)}
      sidebar={
        <DashboardSidebar
          brand={t('dashboard.brand')}
          subtitle={t('dashboard.subtitle')}
          profileName={profileName}
          profileRole={profileRole}
          profileImageUrl={profileAvatar}
          profileBadge={t('dashboard.badge')}
          navItems={navItems}
          collapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((value) => !value)}
          onItemSelect={(id) => {
            setActiveSection(id as SectionId);
            setIsMobileSidebarOpen(false);
          }}
          footer={
          <SidebarVisibilityCard
              collapsed={isSidebarCollapsed}
              enabled={isPublicProfile}
              mode={visibilitySettings?.mode ?? 'publico'}
              onToggle={async () => {
                const nextPublicState = !isPublicProfile;
                setIsPublicProfile(nextPublicState);
                try {
                  await updateVisibilitySettings({
                    mode: nextPublicState ? 'publico' : 'privado',
                    showGeneral: nextPublicState,
                    showProjects: nextPublicState,
                    showSkills: nextPublicState,
                    showExperience: nextPublicState,
                    showFormation: nextPublicState,
                    showSocialLinks: nextPublicState,
                    showContact: nextPublicState,
                    showEmail: nextPublicState,
                    showPhone: nextPublicState,
                  });
                  await fetchDashboardData();
                } catch (error) {
                  setIsPublicProfile(!nextPublicState);
                  setDashboardError(
                    error instanceof Error ? error.message : t('dashboard.errors.profileVisibility')
                  );
                }
              }}
            />
          }
        />
      }
      topbar={
        <DashboardTopbar
          searchPlaceholder={t('dashboard.searchPlaceholder')}
          profileName={profileName}
          profileRole={profileRole}
          profileImageUrl={profileAvatar}
          searchIndex={searchIndex}
          onNavigate={handleGlobalNavigate}
          onLanguageChange={handleLanguageChange}
          onLogout={async () => {
            await logoutUser();
            window.location.assign('/login');
          }}
          actions={
            <>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--umss-border)] bg-white text-slate-500 transition hover:text-[var(--umss-brand)] lg:hidden"
                aria-label={t('common.expandSidebar')}
              >
                <Menu className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveQuickPanel((value) => value === 'notifications' ? null : 'notifications')}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--umss-border)] bg-white text-slate-500 transition hover:text-[var(--umss-brand)]"
                aria-label={t('dashboard.notifications')}
              >
                <Bell className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveQuickPanel((value) => value === 'settings' ? null : 'settings')}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--umss-border)] bg-white text-slate-500 transition hover:text-[var(--umss-brand)]"
                aria-label={t('dashboard.help')}
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            </>
          }
        />
      }
    >
      {dashboardError && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {dashboardError}
        </div>
      )}
      {activeQuickPanel ? (
        <div className="fixed top-24 right-4 z-[80] w-[min(92vw,360px)] rounded-3xl border border-[var(--umss-border)] bg-white p-4 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.45)]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              {activeQuickPanel === 'notifications' ? 'Notificaciones' : 'Ayuda rápida'}
            </h2>
            <button type="button" onClick={() => setActiveQuickPanel(null)} className="rounded-full px-2 py-1 text-slate-400 hover:bg-slate-100">×</button>
          </div>
          {activeQuickPanel === 'notifications' ? (
            <div className="mt-3 space-y-2">
              {evidenceNotifications.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    const ids = evidenceNotifications.map((item: any) => String(item.id ?? item.titulo ?? item.title));
                    localStorage.setItem('developer_read_notifications', JSON.stringify(ids));
                    setReadNotificationIds(ids);
                  }}
                  className="w-full rounded-2xl border border-[var(--umss-border)] px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[var(--umss-surface)]"
                >
                  Marcar todo como leído
                </button>
              ) : null}
              {unreadEvidenceNotifications.length > 0 ? unreadEvidenceNotifications.map((item: any) => {
                const status = String(item.estado || item.status || '').toLowerCase();
                return (
                  <div key={item.id ?? item.titulo ?? item.title} className="rounded-2xl border border-[var(--umss-border)] bg-[var(--umss-surface)] p-3 text-sm">
                    <p className="font-semibold text-slate-900">{item.titulo || item.title || 'Contenido evaluado'}</p>
                    <p className={status === 'verificado' ? 'text-emerald-600' : 'text-rose-600'}>
                      Un administrador {status === 'verificado' ? 'aceptó' : 'rechazó'} este contenido.
                    </p>
                  </div>
                );
              }) : (
                <p className="rounded-2xl bg-[var(--umss-surface)] p-3 text-sm text-slate-500">
                  {evidenceNotifications.length > 0 ? 'Todas las notificaciones están leídas.' : 'No hay decisiones administrativas recientes.'}
                </p>
              )}
            </div>
          ) : (
            <div className="mt-3 grid gap-2">
              <p className="rounded-2xl bg-[var(--umss-surface)] p-3 text-sm text-slate-600">
                Accesos rápidos para resolver tareas frecuentes del panel.
              </p>
              <button type="button" onClick={() => { setActiveSection('evidence'); setActiveQuickPanel(null); }} className="rounded-2xl border border-[var(--umss-border)] px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-[var(--umss-surface)]">Revisar evidencias y estados</button>
              <button type="button" onClick={() => { setActiveSection('settings'); setActiveQuickPanel(null); }} className="rounded-2xl border border-[var(--umss-border)] px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-[var(--umss-surface)]">Configurar perfil y visibilidad</button>
              <button type="button" onClick={() => { setIsReportModalOpen(true); setActiveQuickPanel(null); }} className="rounded-2xl border border-[var(--umss-border)] px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-[var(--umss-surface)]">Exportar CV y personalizar contenido</button>
              <button type="button" onClick={refreshDashboard} className="rounded-2xl border border-[var(--umss-border)] px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-[var(--umss-surface)]">Sincronizar datos</button>
            </div>
          )}
        </div>
      ) : null}
      
      {activeSection === 'overview' && (
        <OverviewSection
          firstName={firstName}
          completionPercentage={dashboardData?.profile?.completion ?? completionPercentage}
          nextStep={dashboardData?.profile?.next_step ?? t('dashboard.overview.completeHint')}
          metrics={overviewMetrics}
          recentProjects={recentProjects}
          topSkills={topSkills}
          contactEmail={settingsProfile?.contactEmail ?? ''}
          contactPhone={settingsProfile?.phone ?? ''}
          titleHierarchy={settingsProfile?.titleHierarchy ?? []}
          roleHierarchy={settingsProfile?.roleHierarchy ?? []}
          showCompletionCard={!hideCompletionCard}
          onDismissCompletion={() => {
            localStorage.setItem('hide_profile_completion', 'true');
            setHideCompletionCard(true);
          }}
          onOpenProjects={() => setActiveSection('projects')}
          onOpenProjectForm={handleOpenProjectForm}
          onOpenReport={() => setIsReportModalOpen(true)}
          onOpenSkills={() => setActiveSection('skills')}
          onOpenSettings={() => setActiveSection('settings')}
        />
      )}

      {activeSection === 'projects' && (
        <ProjectsSection
          projects={projects}
          onOpenProjectForm={handleOpenProjectForm}
          onToggleVisibility={handleToggleVisibility}
          onEditProject={handleEditProject}
        />
      )}

      {activeSection === 'evidence' && (
        <EvidenceSection
          evidences={dashboardData?.evidences ?? []}
          projects={projects.map((project) => ({ id: project.id, title: project.title }))}
          onEvidenceUploaded={refreshDashboard}
        />
      )}

      {activeSection === 'skills' && (
        <SkillsSection
          serverTechnical={technicalAndSoft.technical.length > 0 ? technicalAndSoft.technical : undefined}
          serverSoft={technicalAndSoft.soft.length > 0 ? technicalAndSoft.soft : undefined}
          availableProjects={projects.map((project) => ({ id: project.id, label: project.title, tags: project.tags }))}
          availableExperience={experienceRecords
            .filter((record) => record.recordType === 'Experiencia')
            .map((record) => ({ id: record.id.replace('db-exp-', ''), label: record.title, description: record.description }))}
          availableFormations={experienceRecords
            .filter((record) => record.recordType === 'Certificación')
            .map((record) => ({ id: record.id.replace('db-form-', ''), label: record.title, description: record.description }))}
          onDataDirty={fetchDashboardData}
        />
      )}

      {activeSection === 'experience' && (
        <ExperienceSection
          initialFromServer={experienceRecords.length > 0 ? experienceRecords : undefined}
          onDataDirty={fetchDashboardData}
        />
      )}

      {activeSection === 'settings' && (
        <SettingsSection
          serverProfile={settingsProfile?.firstName ? settingsProfile : undefined}
          serverHighlights={visibilityHighlights}
          serverVisibility={visibilitySettings}
          availableProjects={projects.map(p => p.title)}
          availableSkills={[...technicalAndSoft.technical.map(t => t.name), ...technicalAndSoft.soft.map(s => s.name)]}
          availableExperience={experienceRecords.map(e => e.title)}
          onDataDirty={fetchDashboardData}
          onLocalUpdate={(updates) => {
            if (updates.avatar !== undefined) {
              setDashboardData((prev: any) => prev ? {
                ...prev,
                usuario: { ...(prev.usuario || {}), fotografiaUrl: updates.avatar }
              } : prev);
            }
          }}
          pendingAvatarFile={pendingAvatarFile}
          setPendingAvatarFile={setPendingAvatarFile}
        />
      )}

      <Suspense fallback={null}>
        <PortfolioReportModal
          open={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          dashboardData={dashboardData}
        />
      </Suspense>
    </DashboardLayout>
  );
}
