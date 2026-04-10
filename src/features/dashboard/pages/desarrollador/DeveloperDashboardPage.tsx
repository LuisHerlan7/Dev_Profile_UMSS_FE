import { useEffect, useState } from 'react';
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
import { ProjectsSection } from '@features/dashboard/components/ProjectsSection';
import { SkillsSection } from '@features/dashboard/components/SkillsSection';
import { ExperienceSection } from '@features/dashboard/components/ExperienceSection';
import { SettingsSection } from '@features/dashboard/components/SettingsSection';
import { SidebarVisibilityCard } from '@features/dashboard/components/SidebarVisibilityCard';
import * as mappers from '@features/dashboard/utils/developerDashboardMappers';

type SectionId = 'overview' | 'projects' | 'skills' | 'experience' | 'settings';

type ProjectItem = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  tags: string[];
  label: string;
  accentClassName: string;
  themeClassName: string;
  visible: boolean;
};

const initialProjects: ProjectItem[] = [
  {
    id: 'nexus-erp',
    title: 'Nexus ERP Dashboard',
    subtitle:
      'Plataforma de gestión empresarial de alta densidad con visualización de datos en tiempo real y microservicios.',
    status: 'EN PRODUCCIÓN',
    tags: ['React', 'Node.js', 'PostgreSQL'],
    label: 'React',
    accentClassName: 'from-slate-100 via-slate-200 to-slate-300',
    themeClassName: 'bg-[rgba(56,189,248,0.12)] text-sky-600 border-sky-200',
    visible: true,
  },
  {
    id: 'architect-ui',
    title: 'Architect UI Kit',
    subtitle:
      'Librería de componentes UI de código abierto enfocada en accesibilidad y rendimiento extremo para SaaS.',
    status: 'BETA',
    tags: ['TypeScript', 'Next.js 14', 'Tailwind'],
    label: 'TypeScript',
    accentClassName: 'from-violet-100 via-purple-100 to-fuchsia-100',
    themeClassName: 'bg-[rgba(168,85,247,0.12)] text-violet-600 border-violet-200',
    visible: true,
  },
  {
    id: 'blockaudit',
    title: 'BlockAudit Pro',
    subtitle:
      'Herramienta de análisis estático de smart contracts para detectar vulnerabilidades en redes EVM.',
    status: 'COMPLETADO',
    tags: ['Solidity', 'Ether.js', 'Hardhat'],
    label: 'Solidity',
    accentClassName: 'from-slate-100 via-slate-200 to-slate-300',
    themeClassName: 'bg-[rgba(34,197,94,0.12)] text-emerald-600 border-emerald-200',
    visible: true,
  },
];

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
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPublicProfile, setIsPublicProfile] = useState(true);
  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    const stored = localStorage.getItem('umss_projects');
    if (!stored) return initialProjects;
    try {
      const parsed = JSON.parse(stored) as ProjectItem[];
      return parsed.length > 0 ? parsed : initialProjects;
    } catch {
      return initialProjects;
    }
  });

  // Estados para datos del servidor
  // Estados para datos del servidor con persistencia local (estilo Proyectos)
  const [technicalSkills, setTechnicalSkills] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('umss_skills_tech');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [softSkills, setSoftSkills] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('umss_skills_soft');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [experienceRecords, setExperienceRecords] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('umss_experience');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [settingsProfile, setSettingsProfile] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('umss_settings_profile');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [settingsHighlights, setSettingsHighlights] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('umss_settings_highlights');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const navigate = useNavigate();

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
    // Carga inicial de datos desde el servidor
    loadData();
  }, [location.search]);

  const loadData = async () => {
    try {
      const { fetchDeveloperDashboard } = await import('@features/dashboard/api/developerDashboard');
      const data = await fetchDeveloperDashboard();
      
      const mappedSkills = mappers.mapHabilidades(data.habilidades || []);
      setTechnicalSkills(mappedSkills.technical);
      setSoftSkills(mappedSkills.soft);
      localStorage.setItem('umss_skills_tech', JSON.stringify(mappedSkills.technical));
      localStorage.setItem('umss_skills_soft', JSON.stringify(mappedSkills.soft));
      
      const mappedExp = mappers.mapExperienciaYFormacion(data.experiencias || [], data.formaciones || []);
      setExperienceRecords(mappedExp);
      localStorage.setItem('umss_experience', JSON.stringify(mappedExp));

      const prof = mappers.buildSettingsProfile(data);
      setSettingsProfile(prof);
      localStorage.setItem('umss_settings_profile', JSON.stringify(prof));

      const high = mappers.buildVisibilityHighlights(data);
      setSettingsHighlights(high);
      localStorage.setItem('umss_settings_highlights', JSON.stringify(high));
      
      // Sincronizar Proyectos (identico a habilidades/experiencia)
      if (data.proyectos && data.proyectos.length > 0) {
        const mappedProj = mappers.mapProyectosToProjectItems(data.proyectos);
        setProjects(mappedProj);
        localStorage.setItem('umss_projects', JSON.stringify(mappedProj));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveProjects = (items: ProjectItem[]) => {
    localStorage.setItem('umss_projects', JSON.stringify(items));
  };

  const handleOpenProjectForm = () => {
    setActiveSection('projects');
    navigate('/nuevo-proyecto');
  };

  const handleAddProject = (project: ProjectItem) => {
    setProjects((items) => {
      const next = [project, ...items];
      saveProjects(next);
      return next;
    });
    setActiveSection('projects');
    navigate('/dashboard?section=projects');
  };

  const handleToggleVisibility = (projectId: string) => {
    setProjects((items) => {
      const next = items.map((p) =>
        p.id === projectId ? { ...p, visible: !p.visible } : p
      );
      saveProjects(next);
      return next;
    });
  };

  const handleEditProject = (projectId: string) => {
    navigate(`/editar-proyecto/${projectId}`);
  };

  const handleOpenSettings = () => {
    setActiveSection('settings');
  };


  return (
    <DashboardLayout
      sidebarCollapsed={isSidebarCollapsed}
      sidebar={
        <DashboardSidebar
          brand="Perfil Dev UMSS"
          subtitle="Panel del desarrollador"
          profileName={settingsProfile?.firstName ? `${settingsProfile.firstName} ${settingsProfile.lastName}` : "Alex Rivera"}
          profileRole={settingsProfile?.role || "Desarrollador Full Stack"}
          profileImageUrl={settingsProfile?.avatar}
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
          profileName={settingsProfile?.firstName ? `${settingsProfile.firstName} ${settingsProfile.lastName}` : "Alex Rivera"}
          profileRole={settingsProfile?.role || "Desarrollador Full Stack"}
          profileImageUrl={settingsProfile?.avatar}
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
          onOpenSettings={handleOpenSettings}
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
          serverTechnical={technicalSkills}
          serverSoft={softSkills}
          onDataDirty={() => loadData()}
        />
      ) : null}
      {activeSection === 'experience' ? (
        <ExperienceSection
          initialFromServer={experienceRecords}
          onDataDirty={() => loadData()}
        />
      ) : null}
      {activeSection === 'settings' ? (
        <SettingsSection
          serverProfile={settingsProfile}
          serverHighlights={settingsHighlights}
          onDataDirty={() => loadData()}
        />
      ) : null}
    </DashboardLayout>
  );
}
