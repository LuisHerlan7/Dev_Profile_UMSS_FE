import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  BriefcaseBusiness,
  Code2,
  FileText,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
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
import { logoutUser } from '@services/auth';
import { fetchDeveloperDashboard } from '@services/dashboard';
import {
  buildOverviewMetrics,
  buildRecentProjects,
  buildSettingsProfile,
  buildTopSkillBadges,
  buildVisibilityHighlights,
  estimateProfileCompletion,
  mapExperienciaYFormacion,
  mapHabilidades,
  mapProyectosToProjectItems,
  sidebarHeadline,
  welcomeFirstName,
} from '@features/dashboard/utils/developerDashboardMappers';

type SectionId = 'overview' | 'projects' | 'evidence' | 'skills' | 'experience' | 'settings';

const baseNavItems: Array<Omit<DashboardSidebarItem, 'active'> & { id: SectionId }> = [
  {
    id: 'overview',
    label: 'Informacion General',
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    id: 'projects',
    label: 'Proyectos',
    icon: <FolderKanban className="h-4 w-4" />,
  },
  {
    id: 'evidence',
    label: 'Evidencias',
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: 'skills',
    label: 'Habilidades',
    icon: <Code2 className="h-4 w-4" />,
  },
  {
    id: 'experience',
    label: 'Experiencia',
    icon: <BriefcaseBusiness className="h-4 w-4" />,
  },
  {
    id: 'settings',
    label: 'Configuracion',
    icon: <Settings className="h-4 w-4" />,
  },
];

export function DeveloperDashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPublicProfile, setIsPublicProfile] = useState(true);
  
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
          setProjects(mapProyectosToProjectItems(rawProyects));
      }
    } catch (requestError) {
      console.error('Error al cargar dashboard', requestError);
      setDashboardError(requestError instanceof Error ? requestError.message : 'No se pudo cargar el dashboard.');
    }
  }, [session?.token]);

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

  const handleToggleVisibility = (projectId: string) => {
    setProjects((items) =>
      items.map((project) =>
        project.id === projectId ? { ...project, visible: !project.visible } : project
      )
    );
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
  const completionPercentage = dashboardData ? estimateProfileCompletion(dashboardData) : 0;
  const firstName = dashboardData ? welcomeFirstName(dashboardData) : (session?.user?.name?.split(' ')[0] || 'desarrollador');
  const experienceRecords = dashboardData ? mapExperienciaYFormacion(dashboardData.experiencias || dashboardData.experience || [], dashboardData.formaciones || []) : [];

  // Mantener el índice de búsqueda global (Feature local)
  const searchIndex: SearchResultItem[] = [
    ...projects.map((p) => ({
      id: `project-${p.id}`,
      label: p.title,
      sublabel: p.subtitle || p.tags.join(', '),
      section: 'projects' as const,
      sectionLabel: 'Proyectos',
      elementId: `project-card-${p.id}`,
    })),
    ...technicalAndSoft.technical.map((s) => ({
      id: `skill-tech-${s.id}`,
      label: s.name,
      sublabel: s.level,
      section: 'skills' as const,
      sectionLabel: 'Habilidades',
      elementId: `skill-${s.id}`,
    })),
    ...experienceRecords.map((e) => ({
      id: `exp-${e.id}`,
      label: e.title,
      sublabel: e.recordType,
      section: 'experience' as const,
      sectionLabel: 'Experiencia',
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

  const sectionLabels = Object.fromEntries(
    (session?.dashboard?.sections || []).map((section: any) => [section.id, section.label])
  );

  const navItems = baseNavItems.map((item) => ({
    ...item,
    label: sectionLabels[item.id] || item.label,
    active: item.id === activeSection,
  }));

  if (isSessionLoading && !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--umss-surface)] p-6">
        <div className="w-full max-w-xl rounded-[28px] border border-[var(--umss-border)] bg-white p-6 text-center shadow-[0_18px_40_rgba(15,23,42,0.28)]">
          <p className="text-sm font-semibold text-[var(--umss-brand)]">Cargando dashboard</p>
          <p className="mt-2 text-sm text-slate-600">Preparando tu panel de desarrollador...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <DashboardLayout
      sidebarCollapsed={isSidebarCollapsed}
      sidebar={
        <DashboardSidebar
          brand="Perfil Dev UMSS"
          subtitle={session.dashboard?.title || "Panel del desarrollador"}
          profileName={profileName}
          profileRole={profileRole}
          profileImageUrl={profileAvatar}
          profileBadge={session.dashboard?.profile_badge || "perfil activo"}
          navItems={navItems}
          collapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((value) => !value)}
          onItemSelect={(id) => setActiveSection(id as SectionId)}
          footer={
            <SidebarVisibilityCard
              collapsed={isSidebarCollapsed}
              enabled={isPublicProfile}
              onToggle={() => setIsPublicProfile((value) => !value)}
            />
          }
        />
      }
      topbar={
        <DashboardTopbar
          searchPlaceholder="Buscar proyectos, habilidades..."
          profileName={profileName}
          profileRole={profileRole}
          profileImageUrl={profileAvatar}
          searchIndex={searchIndex}
          onNavigate={handleGlobalNavigate}
          onLogout={async () => {
            await logoutUser();
            window.location.assign('/login');
          }}
          actions={
            <>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--umss-border)] bg-white text-slate-500 transition hover:text-[var(--umss-brand)]"
                aria-label="Notificaciones"
              >
                <Bell className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--umss-border)] bg-white text-slate-500 transition hover:text-[var(--umss-brand)]"
                aria-label="Ayuda"
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
      
      {activeSection === 'overview' && (
        <OverviewSection
          firstName={firstName}
          completionPercentage={dashboardData?.profile?.completion ?? completionPercentage}
          nextStep={dashboardData?.profile?.next_step ?? 'Completa tu perfil para destacar mas.'}
          metrics={overviewMetrics}
          recentProjects={recentProjects}
          topSkills={topSkills}
          onOpenProjects={() => setActiveSection('projects')}
          onOpenProjectForm={handleOpenProjectForm}
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
          onProjectCreated={refreshDashboard}
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
    </DashboardLayout>
  );
}
