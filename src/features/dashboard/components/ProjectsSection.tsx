import type { ReactNode } from 'react';
import { ArrowUpRight, Link2, PencilLine, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { DashboardBadge } from '@shared/components/dashboard/DashboardBadge';
import { DashboardCard } from '@shared/components/dashboard/DashboardCard';
import { Button } from '@shared/components/ui/Button';
import { SectionHeading } from './SectionHeading';

const managedProjects = [
  {
    id: 'neuralnexus',
    title: 'NeuralNexus Dashboard',
    category: 'WEB',
    summary:
      'Sistema de monitoreo en tiempo real para redes neuronales distribuidas con alertas de mantenimiento.',
    role: 'Arquitecto Frontend Principal',
    tags: ['React', 'TypeScript', 'D3.js', 'AWS'],
    imageClassName: 'from-sky-100 via-slate-100 to-slate-300',
  },
  {
    id: 'campusconnect',
    title: 'CampusConnect App',
    category: 'MOVIL',
    summary:
      'Plataforma de comunicacion centralizada para estudiantes de la UMSS con chat en tiempo real.',
    role: 'Desarrollador Full-Stack',
    tags: ['Flutter', 'Firebase', 'Node.js'],
    imageClassName: 'from-orange-100 via-rose-50 to-stone-200',
  },
  {
    id: 'visualizer',
    title: 'AlgoVisualizer Pro',
    category: 'DATA',
    summary:
      'Suite interactiva para visualizar estructuras de datos y algoritmos con escenas paso a paso.',
    role: 'Diseño y Experiencia',
    tags: ['Next.js', 'Tailwind', 'Framer'],
    imageClassName: 'from-violet-100 via-white to-indigo-100',
  },
] as const;

export function ProjectsSection() {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Gestion de proyectos"
        title="Gestion de Proyectos"
        description="Crea, gestiona y organiza tu portafolio de ingenieria de software. Muestra tu mejor trabajo a la comunidad UMSS."
        actions={
          <Button className="h-11 rounded-2xl bg-gradient-to-r from-[#6C63FF] via-[var(--umss-brand)] to-[var(--umss-accent)] px-4 text-sm hover:from-[#5A52FF] hover:via-[#4338CA] hover:to-[#2563EB]">
            <Plus className="h-4 w-4" />
            Agregar nuevo proyecto
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
        <div className="space-y-4">
          <DashboardCard title="Filtros" description="Categorias del portafolio.">
            <div className="space-y-2">
              <SidebarFilterButton active>Todos los Proyectos</SidebarFilterButton>
              <SidebarFilterButton>Apps Web</SidebarFilterButton>
              <SidebarFilterButton>Movil</SidebarFilterButton>
              <SidebarFilterButton>IA / ML</SidebarFilterButton>
            </div>
          </DashboardCard>

          <div className="rounded-[28px] border border-[rgba(80,72,229,0.12)] bg-[rgba(240,240,255,0.9)] p-4 shadow-[0_18px_40px_-34px_rgba(80,72,229,0.35)]">
            <p className="text-sm font-semibold text-[var(--umss-brand)]">Fortalezas del Portafolio</p>
            <div className="mt-3 h-1.5 w-20 rounded-full bg-[var(--umss-brand)]" />
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Agrega una URL de demo y 2 etiquetas tecnologicas mas para alcanzar el 100%
              de completitud del perfil.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="relative block flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Buscar por nombre, rol o stack tecnologico..."
                className="h-11 w-full rounded-2xl border border-[var(--umss-border)] bg-white pr-4 pl-11 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[rgba(80,72,229,0.3)] focus:ring-2 focus:ring-[rgba(80,72,229,0.15)]"
              />
            </label>

            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--umss-border)] bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Ordenar
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {managedProjects.map((project) => (
              <article
                key={project.id}
                className="overflow-hidden rounded-[28px] border border-[var(--umss-border)] bg-white shadow-[0_18px_40px_-34px_rgba(15,23,42,0.22)]"
              >
                <div className={`relative h-44 bg-gradient-to-br ${project.imageClassName}`}>
                  <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between">
                    <DashboardBadge tone="brand">{project.category}</DashboardBadge>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Link2 className="h-4 w-4" />
                      <PencilLine className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {project.summary}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[var(--umss-surface)] px-3 py-2 text-sm text-slate-600">
                    {project.role}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <DashboardBadge key={tag}>{tag}</DashboardBadge>
                    ))}
                  </div>
                </div>
              </article>
            ))}

            <button
              type="button"
              className="flex min-h-[320px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[rgba(80,72,229,0.22)] bg-[rgba(240,240,255,0.45)] p-6 text-center transition hover:border-[var(--umss-brand)] hover:bg-[rgba(240,240,255,0.7)]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-[var(--umss-brand)] shadow-sm">
                <Plus className="h-6 w-6" />
              </div>
              <p className="mt-5 text-lg font-semibold text-slate-900">Lanzar un nuevo proyecto</p>
              <p className="mt-2 max-w-[240px] text-sm leading-relaxed text-slate-500">
                Listo para compartir algo nuevo? Comienza a documentar tu ultima creacion.
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarFilterButton({
  children,
  active = false,
}: {
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm transition ${
        active
          ? 'bg-[var(--umss-lavender)] font-semibold text-[var(--umss-brand)]'
          : 'bg-white text-slate-600 hover:bg-[var(--umss-surface)]'
      }`}
    >
      <span>{children}</span>
      <ArrowUpRight className="h-4 w-4" />
    </button>
  );
}
