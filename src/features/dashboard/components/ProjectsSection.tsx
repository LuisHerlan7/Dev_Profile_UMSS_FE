import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@shared/components/ui/Button';
import { DashboardBadge } from '@shared/components/dashboard/DashboardBadge';
import { SectionHeading } from './SectionHeading';
import { Plus, Edit, Filter, Search } from 'lucide-react';

export type ProjectItem = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  tags: string[];
  label: string;
  accentClassName: string;
  themeClassName: string;
  visible: boolean;
  liveUrl?: string | null;
  repoUrl?: string | null;
};

export function ProjectsSection({
  projects,
  onOpenProjectForm,
  onToggleVisibility,
  onEditProject,
  onDataDirty,
}: {
  projects: ProjectItem[];
  onOpenProjectForm: () => void;
  onToggleVisibility: (projectId: string) => void;
  onEditProject: (projectId: string) => void;
  onDataDirty?: () => void;
}) {
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFilterMode, setIsFilterMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilters =
      selectedFilters.length === 0 ||
      selectedFilters.includes(project.status) ||
      selectedFilters.some((filter) => project.tags.includes(filter));

    return matchesSearch && matchesFilters;
  });

  const uniqueStatuses = Array.from(new Set(projects.map((p) => p.status)));
  const uniqueTags = Array.from(new Set(projects.flatMap((p) => p.tags)));

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Gestión de portafolio"
        title="Subir Proyecto"
        description="Comparte tus creaciones más recientes con la comunidad universitaria. Completa los detalles técnicos y visuales para destacar tu trabajo."
        actions={
          <div className="flex gap-3">
            <Button
              onClick={onOpenProjectForm}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#4F46E5] px-6 text-sm font-semibold text-white shadow-lg shadow-[#4F46E5]/20 transition hover:bg-[#4338CA]"
            >
              <Plus className="h-4 w-4" />
              Subir
            </Button>
            <Button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold transition ${
                isEditMode
                  ? 'border-slate-400 bg-slate-100 text-black'
                  : 'border-slate-200 bg-white text-black hover:bg-slate-50'
              }`}
            >
              <Edit className="h-4 w-4 text-black" />
              <span className="text-black">Editar</span>
            </Button>
            <Button
              onClick={() => setIsFilterMode(!isFilterMode)}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold transition ${
                isFilterMode
                  ? 'border-slate-400 bg-slate-100 text-black'
                  : 'border-slate-200 bg-white text-black hover:bg-slate-50'
              }`}
            >
              <Filter className="h-4 w-4 text-black" />
              <span className="text-black">Filtrar</span>
            </Button>
          </div>
        }
      />

      {isFilterMode && (
        <div className="rounded-[24px] border border-[var(--umss-border)] bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar proyectos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-[var(--umss-border)] bg-[var(--umss-surface)] pl-10 pr-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--umss-brand)] focus:ring-2 focus:ring-[rgba(80,72,229,0.12)]"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">Filtros rápidos</p>
              <div className="flex flex-wrap gap-2">
                {uniqueStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => toggleFilter(status)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                      selectedFilters.includes(status)
                        ? 'bg-[var(--umss-brand)] text-white'
                        : 'bg-[var(--umss-surface)] text-slate-700'
                    }`}
                  >
                    {status}
                  </button>
                ))}
                {uniqueTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleFilter(tag)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      selectedFilters.includes(tag)
                        ? 'bg-[var(--umss-brand)] text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredProjects.map((project) => (
          <div key={project.id} className="space-y-3">
            <article
              id={`project-card-${project.id}`}
              className={`group overflow-hidden rounded-[28px] border border-[var(--umss-border)] bg-white shadow-[0_24px_50px_-30px_rgba(15,23,42,0.18)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_-40px_rgba(15,23,42,0.22)] ${
                isEditMode ? 'cursor-pointer' : ''
              }`}
              onClick={isEditMode ? () => onEditProject(project.id) : undefined}
            >
              <div className={`relative h-44 bg-gradient-to-br ${project.accentClassName}`}>
                <div className="absolute inset-x-4 top-4 flex items-center justify-between">
                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${project.themeClassName}`}
                  >
                    {project.status}
                  </span>
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-sm">
                    {project.label}
                  </span>
                </div>
              </div>

              <div className="space-y-4 p-6">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-slate-900">{project.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{project.subtitle}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <DashboardBadge key={tag} className="rounded-full px-3 py-1 text-xs font-semibold">
                      {tag}
                    </DashboardBadge>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={!project.liveUrl}
                    onClick={() => project.liveUrl && window.open(project.liveUrl, '_blank', 'noopener,noreferrer')}
                    className={`inline-flex h-12 items-center justify-center rounded-2xl border border-[var(--umss-border)] bg-gradient-to-r from-slate-50 to-slate-100 px-6 text-sm font-semibold text-slate-700 transition hover:from-slate-100 hover:to-slate-200 hover:border-slate-300 hover:shadow-sm ${
                      !project.liveUrl ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    Ver Proyecto
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/proyecto/${project.id}`)}
                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-transparent bg-gradient-to-r from-[#6C63FF] via-[var(--umss-brand)] to-[#4338CA] px-6 text-sm font-semibold text-white transition hover:from-[#5A52FF] hover:via-[#4338CA] hover:to-[#312E81] hover:shadow-lg cursor-pointer"
                  >
                    Ver Código
                  </button>
                </div>
              </div>
            </article>
            {isEditMode && (
              <div className="flex items-center justify-between rounded-2xl border border-[var(--umss-border)] bg-white px-4 py-3">
                <span className="text-sm font-semibold text-slate-900">Visible</span>
                <button
                  type="button"
                  onClick={() => onToggleVisibility(project.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    project.visible ? 'bg-[var(--umss-brand)]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                      project.visible ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={onOpenProjectForm}
          className="flex min-h-[340px] flex-col items-center justify-center gap-4 overflow-hidden rounded-[28px] border border-dashed border-[rgba(80,72,229,0.22)] bg-[rgba(240,240,255,0.5)] p-8 text-center transition duration-300 hover:border-[var(--umss-brand)] hover:bg-[rgba(240,240,255,0.75)] hover:-translate-y-1"
        >
          <span className="grid h-16 w-16 place-items-center rounded-3xl bg-white text-[var(--umss-brand)] shadow-sm transition group-hover:scale-105">
            <Plus className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xl font-semibold text-slate-900">Agregar Nuevo Proyecto</p>
            <p className="mt-2 max-w-[260px] text-sm leading-6 text-slate-500">
              Comparte tu última creación con la comunidad y aumenta tu portafolio profesional.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}

