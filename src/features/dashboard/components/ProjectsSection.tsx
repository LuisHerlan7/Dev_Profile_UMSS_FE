import { useMemo, useState, type ReactNode } from 'react';
import {
  ArrowUpRight,
  Link2,
  PencilLine,
  Plus,
  Search,
  SlidersHorizontal,
  UploadCloud,
} from 'lucide-react';
import { DashboardBadge } from '@shared/components/dashboard/DashboardBadge';
import { DashboardCard } from '@shared/components/dashboard/DashboardCard';
import { Button } from '@shared/components/ui/Button';
import { createProject } from '@services/projects';
import { SectionHeading } from './SectionHeading';

type ManagedProject = {
  id: string;
  title: string;
  category: string;
  summary: string;
  role: string;
  tags: string[];
  status: string;
  evidence_summary: {
    total: number;
    pending: number;
    verified: number;
    rejected: number;
  };
};

type ProjectsSectionProps = {
  projects: ManagedProject[];
  onAddProject: () => void;
  onProjectCreated?: () => void;
};

export function ProjectsSection({ projects, onAddProject, onProjectCreated }: ProjectsSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    role: '',
    repoUrl: '',
    liveUrl: '',
    visibility: 'publico',
    technologies: '',
  });
  const [files, setFiles] = useState<File[]>([]);

  const techList = useMemo(
    () =>
      formState.technologies
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    [formState.technologies]
  );

  const handleSubmit = async () => {
    setFormError('');
    setFormSuccess('');

    if (!formState.name.trim() || !formState.description.trim()) {
      setFormError('Completa el nombre y la descripcion del proyecto.');
      return;
    }

    if (files.length === 0) {
      setFormError('Adjunta al menos una evidencia (imagen, video o PDF).');
      return;
    }

    try {
      setIsSubmitting(true);
      await createProject({
        name: formState.name.trim(),
        description: formState.description.trim(),
        role: formState.role.trim() || undefined,
        repo_url: formState.repoUrl.trim() || undefined,
        live_url: formState.liveUrl.trim() || undefined,
        visibility: formState.visibility === 'privado' ? 'privado' : 'publico',
        technologies: techList,
        evidences: files,
      });
      setFormSuccess('Proyecto enviado. Quedara en revisión hasta validar evidencias.');
      setFormState({
        name: '',
        description: '',
        role: '',
        repoUrl: '',
        liveUrl: '',
        visibility: 'publico',
        technologies: '',
      });
      setFiles([]);
      onProjectCreated?.();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo crear el proyecto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Gestion de proyectos"
        title="Gestion de Proyectos"
        description="Crea, gestiona y organiza tu portafolio de ingenieria de software. Muestra tu mejor trabajo a la comunidad UMSS."
        actions={
          <Button
            className="h-11 rounded-2xl bg-gradient-to-r from-[#6C63FF] via-[var(--umss-brand)] to-[var(--umss-accent)] px-4 text-sm hover:from-[#5A52FF] hover:via-[#4338CA] hover:to-[#2563EB]"
            onClick={onAddProject}
          >
            <Plus className="h-4 w-4" />
            Agregar nuevo proyecto
          </Button>
        }
      />

      <DashboardCard
        title="Subir Proyecto"
        description="Completa los detalles y adjunta evidencias (imagenes, videos o documentos PDF)."
      >
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-slate-600">
                Nombre del proyecto
                <input
                  value={formState.name}
                  onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Ej: Sistema de Gestion Academica"
                  className="mt-2 h-11 w-full rounded-2xl border border-[var(--umss-border)] bg-white px-4 text-sm text-slate-900 outline-none focus:border-[rgba(80,72,229,0.35)] focus:ring-2 focus:ring-[rgba(80,72,229,0.15)]"
                />
              </label>
              <label className="text-sm text-slate-600">
                Rol en el proyecto
                <input
                  value={formState.role}
                  onChange={(event) => setFormState((prev) => ({ ...prev, role: event.target.value }))}
                  placeholder="Fullstack Developer"
                  className="mt-2 h-11 w-full rounded-2xl border border-[var(--umss-border)] bg-white px-4 text-sm text-slate-900 outline-none focus:border-[rgba(80,72,229,0.35)] focus:ring-2 focus:ring-[rgba(80,72,229,0.15)]"
                />
              </label>
            </div>

            <label className="text-sm text-slate-600">
              Descripcion
              <textarea
                value={formState.description}
                onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Describe el objetivo, funcionalidades y aporte en el proyecto."
                rows={4}
                className="mt-2 w-full rounded-2xl border border-[var(--umss-border)] bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[rgba(80,72,229,0.35)] focus:ring-2 focus:ring-[rgba(80,72,229,0.15)]"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-slate-600">
                URL del repositorio
                <input
                  value={formState.repoUrl}
                  onChange={(event) => setFormState((prev) => ({ ...prev, repoUrl: event.target.value }))}
                  placeholder="https://github.com/usuario/proyecto"
                  className="mt-2 h-11 w-full rounded-2xl border border-[var(--umss-border)] bg-white px-4 text-sm text-slate-900 outline-none focus:border-[rgba(80,72,229,0.35)] focus:ring-2 focus:ring-[rgba(80,72,229,0.15)]"
                />
              </label>
              <label className="text-sm text-slate-600">
                URL demo (opcional)
                <input
                  value={formState.liveUrl}
                  onChange={(event) => setFormState((prev) => ({ ...prev, liveUrl: event.target.value }))}
                  placeholder="https://mi-proyecto.com"
                  className="mt-2 h-11 w-full rounded-2xl border border-[var(--umss-border)] bg-white px-4 text-sm text-slate-900 outline-none focus:border-[rgba(80,72,229,0.35)] focus:ring-2 focus:ring-[rgba(80,72,229,0.15)]"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-slate-600">
                Tecnologias principales
                <input
                  value={formState.technologies}
                  onChange={(event) => setFormState((prev) => ({ ...prev, technologies: event.target.value }))}
                  placeholder="React, Laravel, PostgreSQL"
                  className="mt-2 h-11 w-full rounded-2xl border border-[var(--umss-border)] bg-white px-4 text-sm text-slate-900 outline-none focus:border-[rgba(80,72,229,0.35)] focus:ring-2 focus:ring-[rgba(80,72,229,0.15)]"
                />
              </label>
              <label className="text-sm text-slate-600">
                Privacidad
                <select
                  value={formState.visibility}
                  onChange={(event) => setFormState((prev) => ({ ...prev, visibility: event.target.value }))}
                  className="mt-2 h-11 w-full rounded-2xl border border-[var(--umss-border)] bg-white px-4 text-sm text-slate-900 outline-none focus:border-[rgba(80,72,229,0.35)] focus:ring-2 focus:ring-[rgba(80,72,229,0.15)]"
                >
                  <option value="publico">Publico</option>
                  <option value="privado">Privado</option>
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-dashed border-[rgba(80,72,229,0.3)] bg-[rgba(240,240,255,0.4)] p-5 text-center sm:text-left">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-[var(--umss-brand)] shadow-sm">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Adjunta evidencias del proyecto</p>
                <p className="mt-1 text-xs text-slate-500">
                  Imagenes, videos o documentos PDF. Tamaño maximo 50MB por archivo.
                </p>
              </div>
            </div>
            <input
              type="file"
              multiple
              accept="image/*,video/*,application/pdf"
              onChange={(event) => setFiles(Array.from(event.target.files || []))}
              className="mt-4 w-full text-sm text-slate-500 file:mr-4 file:rounded-2xl file:border-0 file:bg-[var(--umss-brand)] file:px-5 file:py-2.5 file:text-sm file:font-semibold file:text-white"
            />
            {files.length > 0 ? (
              <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                {files.slice(0, 4).map((file) => (
                  <div key={file.name} className="rounded-2xl bg-white/80 px-3 py-2">
                    {file.name}
                  </div>
                ))}
                {files.length > 4 ? (
                  <div className="rounded-2xl bg-white/70 px-3 py-2 text-slate-400">
                    +{files.length - 4} archivos mas
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-500">
                Sube al menos una evidencia para validar tu proyecto.
              </p>
            )}

            <div className="mt-5 flex flex-col gap-2">
              <Button
                type="button"
                className="h-10 rounded-2xl text-sm font-semibold"
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? 'Enviando...' : 'Subir proyecto'}
              </Button>
              {formError ? <p className="text-xs text-rose-600">{formError}</p> : null}
              {formSuccess ? <p className="text-xs text-emerald-600">{formSuccess}</p> : null}
            </div>
          </div>
        </div>
      </DashboardCard>

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
            {projects.length === 0 ? (
              <div className="col-span-full rounded-[28px] border border-dashed border-[rgba(80,72,229,0.22)] bg-[rgba(240,240,255,0.45)] p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-[var(--umss-brand)] shadow-sm">
                  <Plus className="h-6 w-6" />
                </div>
                <p className="mt-5 text-lg font-semibold text-slate-900">Aún no hay proyectos</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Crea tu primer proyecto para comenzar a construir tu portafolio.
                </p>
                <button
                  type="button"
                  onClick={onAddProject}
                  className="mt-4 text-sm font-semibold text-[var(--umss-brand)]"
                >
                  Agregar proyecto
                </button>
              </div>
            ) : (
              projects.map((project) => (
                <article
                  key={project.id}
                  className="overflow-hidden rounded-[28px] border border-[var(--umss-border)] bg-white shadow-[0_18px_40px_-34px_rgba(15,23,42,0.22)]"
                >
                  <div className="relative h-44 bg-gradient-to-br from-slate-100 via-white to-indigo-100">
                    <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        <DashboardBadge tone="brand">{project.category}</DashboardBadge>
                        <ProjectStatusBadge status={project.status} />
                      </div>
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

                    <div className="rounded-2xl border border-[var(--umss-border)] bg-[var(--umss-surface)] px-3 py-2 text-xs text-slate-600">
                      Evidencias: {project.evidence_summary.total} · Verificadas {project.evidence_summary.verified} ·
                      En revisión {project.evidence_summary.pending} · Rechazadas {project.evidence_summary.rejected}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectStatusBadge({ status }: { status: string }) {
  if (status === 'verificado') {
    return <DashboardBadge tone="success">Verificado</DashboardBadge>;
  }

  if (status === 'rechazado') {
    return (
      <DashboardBadge className="border border-rose-200 bg-rose-50 text-rose-600">
        Rechazado
      </DashboardBadge>
    );
  }

  return <DashboardBadge tone="warning">En revisión</DashboardBadge>;
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
