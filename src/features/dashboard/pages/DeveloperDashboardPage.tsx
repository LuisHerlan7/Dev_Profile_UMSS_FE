import { useState } from 'react';
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
import { ExperienceSection, SettingsSection } from '@features/dashboard/components/MoreSections';
import { SidebarVisibilityCard } from '@features/dashboard/components/SidebarVisibilityCard';

type SectionId = 'overview' | 'projects' | 'skills' | 'experience' | 'settings';

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
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPublicProfile, setIsPublicProfile] = useState(true);

  const navItems = baseNavItems.map((item) => ({
    ...item,
    active: item.id === activeSection,
  }));

  return (
    <DashboardLayout
      sidebarCollapsed={isSidebarCollapsed}
      sidebar={
        <DashboardSidebar
          brand="Perfil Dev UMSS"
          subtitle="Panel del desarrollador"
          profileName="Alex Rivera"
          profileRole="Desarrollador Full Stack"
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
          profileName="Alex Rivera"
          profileRole="Desarrollador Full Stack"
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
          onOpenSkills={() => setActiveSection('skills')}
        />
      ) : null}
      {activeSection === 'projects' ? <ProjectsSection /> : null}
      {activeSection === 'skills' ? <SkillsSection /> : null}
      {activeSection === 'experience' ? <ExperienceSection /> : null}
      {activeSection === 'settings' ? <SettingsSection /> : null}
    </DashboardLayout>
  );
}
