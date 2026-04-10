import { useEffect, useState } from 'react';
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
import { DashboardTopbar } from '@shared/components/dashboard/DashboardTopbar';
import { OverviewSection } from '@features/dashboard/components/OverviewSection';
import { ProjectsSection } from '@features/dashboard/components/ProjectsSection';
import { SkillsSection } from '@features/dashboard/components/SkillsSection';
import { EvidenceSection } from '@features/dashboard/components/EvidenceSection';
import { ExperienceSection, SettingsSection } from '@features/dashboard/components/MoreSections';
import { SidebarVisibilityCard } from '@features/dashboard/components/SidebarVisibilityCard';
import { useAuthSession } from '@shared/hooks/useAuthSession';
import { logoutUser, resolveRoleLabel } from '@services/auth';
import { fetchDeveloperDashboard, type DeveloperDashboardData } from '@services/dashboard';

type SectionId = 'overview' | 'projects' | 'evidence' | 'skills' | 'experience' | 'settings';

const baseNavItems: Array<Omit<DashboardSidebarItem, 'active'> & { id: SectionId }> = [
  // Future route hook: replace `setActiveSection` with `navigate(item.path)`
  // when each dashboard subsection has its own dedicated route.
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
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPublicProfile, setIsPublicProfile] = useState(true);
  const [dashboardData, setDashboardData] = useState<DeveloperDashboardData | null>(null);
  const [dashboardError, setDashboardError] = useState('');
  const { session, isLoading, error } = useAuthSession({
    requiredRole: 'desarrollador',
    redirectTo: '/login',
  });

  const sectionLabels = Object.fromEntries(
    (session?.dashboard?.sections || []).map((section) => [section.id, section.label])
  );

  const navItems = baseNavItems.map((item) => ({
    ...item,
    label: sectionLabels[item.id] || item.label,
    active: item.id === activeSection,
  }));

  useEffect(() => {
    if (!session?.token) {
      return;
    }

    let cancelled = false;

    async function loadDashboard() {
      try {
        const data = await fetchDeveloperDashboard(session.token);
        if (!cancelled) {
          setDashboardData(data);
          setDashboardError('');
        }
      } catch (requestError) {
        if (!cancelled) {
          setDashboardError(requestError instanceof Error ? requestError.message : 'No se pudo cargar el dashboard.');
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [session?.token]);

  const refreshDashboard = async () => {
    if (!session?.token) {
      return;
    }

    try {
      const data = await fetchDeveloperDashboard(session.token);
      setDashboardData(data);
      setDashboardError('');
    } catch (requestError) {
      setDashboardError(requestError instanceof Error ? requestError.message : 'No se pudo cargar el dashboard.');
    }
  };

  if (isLoading && !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--umss-surface)] p-6">
        <div className="w-full max-w-xl rounded-[28px] border border-[var(--umss-border)] bg-white p-6 text-center shadow-[0_18px_40px_-32px_rgba(15,23,42,0.28)]">
          <p className="text-sm font-semibold text-[var(--umss-brand)]">Cargando dashboard</p>
          <p className="mt-2 text-sm text-slate-600">
            Estamos validando tu sesion y preparando tu panel de desarrollador.
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--umss-surface)] p-6">
        <div className="w-full max-w-xl rounded-[28px] border border-red-200 bg-white p-6 text-center shadow-[0_18px_40px_-32px_rgba(15,23,42,0.28)]">
          <p className="text-sm font-semibold text-red-600">No pudimos cargar tu sesion.</p>
          <p className="mt-2 text-sm text-slate-600">{error || 'Vuelve a iniciar sesion para continuar.'}</p>
        </div>
      </div>
    );
  }

  const profileRole = session.dashboard?.profile_role_label || resolveRoleLabel(session.user.role);
  const metrics = dashboardData?.metrics || { projects: 0, skills: 0, profile_views: 0 };
  const recentProjects = dashboardData?.recent_projects || [];
  const projects = dashboardData?.projects || [];
  const evidences = dashboardData?.evidences || [];
  const skillBadges = dashboardData?.skills.technical.map((skill) => skill.name).slice(0, 6) || [];
  const technicalSkills = dashboardData?.skills.technical || [];
  const softSkills = dashboardData?.skills.soft || [];
  const experienceEntries = dashboardData?.experience || [];

  return (
    <DashboardLayout
      sidebarCollapsed={isSidebarCollapsed}
      sidebar={
        <DashboardSidebar
          brand="Perfil Dev UMSS"
          subtitle={session.dashboard?.title || 'Panel del desarrollador'}
          profileName={session.user.name}
          profileRole={profileRole}
          profileBadge={session.dashboard?.profile_badge || 'perfil activo'}
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
          profileName={session.user.name}
          profileRole={profileRole}
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
      {dashboardError ? (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {dashboardError}
        </div>
      ) : null}
      {activeSection === 'overview' ? (
        <OverviewSection
          profileName={session.user.name}
          completion={dashboardData?.profile.completion ?? 25}
          nextStep={dashboardData?.profile.next_step ?? 'Completa tu perfil para destacar mas.'}
          metrics={metrics}
          recentProjects={recentProjects}
          skillBadges={skillBadges}
          onOpenProjects={() => setActiveSection('projects')}
          onOpenSkills={() => setActiveSection('skills')}
          onAddProject={() => setActiveSection('projects')}
        />
      ) : null}
      {activeSection === 'projects' ? (
        <ProjectsSection
          projects={projects}
          onAddProject={() => setActiveSection('projects')}
          onProjectCreated={refreshDashboard}
        />
      ) : null}
      {activeSection === 'evidence' ? (
        <EvidenceSection
          evidences={evidences}
          projects={projects.map((project) => ({ id: project.id, title: project.title }))}
          onEvidenceUploaded={refreshDashboard}
        />
      ) : null}
      {activeSection === 'skills' ? (
        <SkillsSection technicalSkills={technicalSkills} softSkills={softSkills} />
      ) : null}
      {activeSection === 'experience' ? (
        <ExperienceSection entries={experienceEntries} />
      ) : null}
      {activeSection === 'settings' ? <SettingsSection /> : null}
    </DashboardLayout>
  );
}
