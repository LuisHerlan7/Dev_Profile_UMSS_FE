import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FileText, FolderOpen, Github, Link as LinkIcon } from 'lucide-react';
import { fetchPublicProjectDetail } from '@features/dashboard/api/developerDashboard';
import { renderMarkdownToHtml } from '@shared/utils/markdown';

type PublicProjectResponse = {
  project: {
    id: number;
    portfolioId: number;
    title: string;
    subtitle: string;
    summary: string;
    description: string | null;
    status: string;
    tags: string[];
    liveUrl?: string | null;
    repoUrl?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    evidences: Array<{
      id: number;
      titulo: string;
      url_enlace: string;
      nombre_archivo?: string | null;
      tipo_mime?: string | null;
      fecha_carga?: string | null;
    }>;
  };
  owner: {
    id: number;
    name: string;
    title: string;
    summary: string;
    avatarUrl?: string | null;
  };
  social: Record<string, string>;
  contact: {
    emailVisible: boolean;
    whatsappVisible: boolean;
  };
};

export function VisitanteProyectoDetallePage() {
  const { portfolioId, projectId } = useParams<{ portfolioId: string; projectId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<PublicProjectResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!portfolioId || !projectId) {
        setError('Proyecto no proporcionado.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetchPublicProjectDetail(portfolioId, projectId);
        setData(response);
      } catch (err: any) {
        setError(err.message || 'Error al cargar el proyecto.');
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [portfolioId, projectId]);

  const markdownHtml = useMemo(
    () => renderMarkdownToHtml(data?.project.description ?? ''),
    [data?.project.description]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-semibold text-slate-500">Cargando proyecto...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-slate-900">No se pudo abrir el proyecto</h2>
          <p className="mt-3 text-sm text-slate-500">{error || 'Proyecto no encontrado.'}</p>
          <button
            type="button"
            onClick={() => navigate(`/portafolio/${portfolioId}`)}
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white"
          >
            Volver al portafolio
          </button>
        </div>
      </div>
    );
  }

  const { project, owner } = data;

  return (
    <main className="min-h-screen bg-[#f8fbff] px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(`/portafolio/${owner.id}`)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al portafolio
          </button>

          <div className="flex flex-wrap gap-3">
            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir demo
              </a>
            ) : null}
            {project.repoUrl ? (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                <Github className="h-4 w-4" />
                Repositorio
              </a>
            ) : null}
          </div>
        </div>

        <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">{project.subtitle}</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">{project.title}</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-600">{project.summary}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                {tag}
              </span>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <FileText className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-slate-900">Descripcion del proyecto</h2>
            </div>

            {project.description ? (
              <div
                className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-strong:text-slate-900 prose-a:text-indigo-600"
                dangerouslySetInnerHTML={{ __html: markdownHtml }}
              />
            ) : (
              <p className="text-sm text-slate-500">No hay documentacion detallada disponible para este proyecto.</p>
            )}
          </section>

          <aside className="space-y-6">
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Desarrollador</p>
              <h3 className="mt-3 text-xl font-bold text-slate-900">{owner.name}</h3>
              <p className="mt-1 text-sm font-medium text-indigo-600">{owner.title}</p>
              <p className="mt-4 text-sm text-slate-500">{owner.summary}</p>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <FolderOpen className="h-5 w-5 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900">Evidencias</h3>
              </div>

              {project.evidences.length > 0 ? (
                <div className="space-y-3">
                  {project.evidences.map((evidence) => (
                    <a
                      key={evidence.id}
                      href={evidence.url_enlace}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:border-indigo-200 hover:bg-white"
                    >
                      <span className="truncate">{evidence.nombre_archivo || evidence.titulo}</span>
                      <LinkIcon className="h-4 w-4 shrink-0 text-indigo-500" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Este proyecto aun no tiene evidencias publicas.</p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
