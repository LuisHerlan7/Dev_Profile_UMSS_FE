import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  BriefcaseBusiness,
  Code2,
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
import { DashboardTopbar } from '@shared/components/dashboard/DashboardTopbar';
import { OverviewSection } from '@features/dashboard/components/OverviewSection';
import { ProjectsSection, type ProjectItem } from '@features/dashboard/components/ProjectsSection';
import { SkillsSection } from '@features/dashboard/components/SkillsSection';
import { ExperienceSection } from '@features/dashboard/components/ExperienceSection';
import { SettingsSection } from '@features/dashboard/components/SettingsSection';
import { SidebarVisibilityCard } from '@features/dashboard/components/SidebarVisibilityCard';
import {
  fetchDeveloperDashboard,
  type DeveloperDashboardPayload,
} from '@features/dashboard/api/developerDashboard';
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

type SectionId = 'overview' | 'projects' | 'skills' | 'experience' | 'settings';

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
  const [dashboardData, setDashboardData] = useState<DeveloperDashboardPayload | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);

  const navItems = baseNavItems.map((item) => ({
    ...item,
    active: item.id === activeSection,
  }));

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    if (section === 'projects') {
      setActiveSection('projects');
    }
  }, [location.search]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const payload = await fetchDeveloperDashboard();
      setDashboardData(payload);
      setProjects(mapProyectosToProjectItems(payload.proyectos ?? []));
    } catch (error) {
      console.error('Error al cargar dashboard', error);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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

  const technicalAndSoft = mapHabilidades(dashboardData?.habilidades ?? []);
  const profileName = dashboardData?.auth_user.name ?? 'Desarrollador';
  const profileRole = dashboardData ? sidebarHeadline(dashboardData) : 'Desarrollador';
  const profileAvatar = (dashboardData?.usuario?.fotografiaUrl as string | undefined) ?? null;
  const overviewMetrics = dashboardData ? buildOverviewMetrics(dashboardData) : [];
  const recentProjects = dashboardData ? buildRecentProjects(dashboardData.proyectos ?? []) : [];
  const topSkills = dashboardData ? buildTopSkillBadges(dashboardData.habilidades ?? []) : [];
  const settingsProfile = dashboardData ? buildSettingsProfile(dashboardData) : undefined;
  const visibilityHighlights = dashboardData ? buildVisibilityHighlights(dashboardData) : undefined;
  const completionPercentage = dashboardData ? estimateProfileCompletion(dashboardData) : 0;
  const firstName = dashboardData ? welcomeFirstName(dashboardData) : 'desarrollador';
  const experienceRecords = dashboardData ? mapExperienciaYFormacion(dashboardData.experiencias ?? [], dashboardData.formaciones ?? []) : [];

  return (
    <DashboardLayout
      sidebarCollapsed={isSidebarCollapsed}
      sidebar={
        <DashboardSidebar
          brand="Perfil Dev UMSS"
          subtitle="Panel del desarrollador"
          profileName={profileName}
          profileRole={profileRole}
          profileImageUrl={profileAvatar}
          profileBadge="perfil activo"
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
      {activeSection === 'overview' ? (
        <OverviewSection
          onOpenProjects={() => setActiveSection('projects')}
          onOpenProjectForm={handleOpenProjectForm}
          onOpenSkills={() => setActiveSection('skills')}
          onOpenSettings={() => setActiveSection('settings')}
          metrics={overviewMetrics}
          recentProjects={recentProjects}
          topSkills={topSkills}
          firstName={firstName}
          completionPercentage={completionPercentage}
        />
      ) : null}
      {activeSection === 'projects' ? (
        <ProjectsSection
          projects={projects}
          onOpenProjectForm={handleOpenProjectForm}
          onToggleVisibility={handleToggleVisibility}
          onEditProject={handleEditProject}
        />
      ) : null}
      {activeSection === 'skills' ? (
        <SkillsSection
          serverTechnical={technicalAndSoft.technical.length > 0 ? technicalAndSoft.technical : undefined}
          serverSoft={technicalAndSoft.soft.length > 0 ? technicalAndSoft.soft : undefined}
          onDataDirty={fetchDashboardData}
        />
      ) : null}
      {activeSection === 'experience' ? (
        <ExperienceSection
          initialFromServer={experienceRecords.length > 0 ? experienceRecords : undefined}
          onDataDirty={fetchDashboardData}
        />
      ) : null}
      {activeSection === 'settings' ? (
        <SettingsSection
          serverProfile={settingsProfile?.firstName ? settingsProfile : undefined}
          serverHighlights={visibilityHighlights}
          availableProjects={projects.map(p => p.title)}
          availableSkills={[...technicalAndSoft.technical.map(t => t.name), ...technicalAndSoft.soft.map(s => s.name)]}
          availableExperience={experienceRecords.map(e => e.title)}
          onDataDirty={fetchDashboardData}
          onLocalUpdate={(updates) => {
            if (updates.avatar !== undefined) {
              setDashboardData((prev) => prev ? {
                ...prev,
                usuario: { ...(prev.usuario || {}), fotografiaUrl: updates.avatar }
              } : prev);
            }
          }}
          pendingAvatarFile={pendingAvatarFile}
          setPendingAvatarFile={setPendingAvatarFile}
        />
      ) : null}
    </DashboardLayout>
  );
}
