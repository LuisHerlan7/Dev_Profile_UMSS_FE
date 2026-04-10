import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PROJECT_STORAGE_KEY = 'umss_projects';

export function EditProjectPage() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [label, setLabel] = useState('');
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [role, setRole] = useState('Arquitecto Principal / Fullstack');
  const [status, setStatus] = useState('Producción');
  const [techInput, setTechInput] = useState('');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (stored && projectId) {
      const projects = JSON.parse(stored) as any[];
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        setLabel(project.label || '');
        setTitle(project.title || '');
        setShortDescription(project.subtitle || '');
        setDetailedDescription(project.detailedDescription || '');
        setRole(project.role || 'Arquitecto Principal / Fullstack');
        setStatus(project.status || 'Producción');
        setTechnologies(project.tags || []);
        setStartDate(project.startDate || '');
        setEndDate(project.endDate || '');
        setGithubUrl(project.githubUrl || '');
        setLiveUrl(project.liveUrl || '');
        setIsPublic(project.isPublic !== false);
      }
    }
  }, [projectId]);

  const handleAddTechnology = () => {
    const tech = techInput.trim();
    if (tech && !technologies.includes(tech)) {
      setTechnologies((current) => [...current, tech]);
    }
    setTechInput('');
  };

  const handleRemoveTechnology = (tech: string) => {
    setTechnologies((current) => current.filter((item) => item !== tech));
  };

  const saveProjects = (items: unknown[]) => {
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(items));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const updatedProject = {
      id: projectId,
      title: title || 'Proyecto nuevo',
      subtitle: shortDescription || 'Descripción breve del proyecto',
      status,
      tags: technologies,
      label: label || 'Proyecto',
      accentClassName: 'from-slate-100 via-slate-200 to-slate-300',
      themeClassName: 'bg-[rgba(56,189,248,0.12)] text-sky-600 border-sky-200',
      visible: true,
      role,
      detailedDescription,
      startDate,
      endDate,
      githubUrl,
      liveUrl,
      isPublic,
    };

    const stored = localStorage.getItem(PROJECT_STORAGE_KEY);
    const existingProjects = stored ? (JSON.parse(stored) as unknown[]) : [];
    const next = existingProjects.map((p: any) =>
      p.id === projectId ? updatedProject : p
    );
    saveProjects(next);
    navigate('/dashboard?section=projects');
  };

  return (
    <div className="min-h-screen bg-[var(--umss-surface)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--umss-brand)] hover:text-[#4338CA]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al dashboard
        </button>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-[32px] border border-[var(--umss-border)] bg-white p-8 shadow-sm">
            <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--umss-brand)]">Portfolio de desarrollador</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Editar Proyecto</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Actualiza los detalles de tu proyecto profesional.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6 rounded-[24px] border border-[var(--umss-border)] bg-[var(--umss-surface)] p-6">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">Fundamentos del Proyecto</h2>
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">Título del proyecto</label>
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Ej. Sistema de Panel Nexus"
                      className="w-full rounded-2xl border border-[var(--umss-border)] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--umss-brand)] focus:ring-2 focus:ring-[rgba(80,72,229,0.12)]"
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <label className="mb-2 block text-sm font-semibold text-slate-900">Etiqueta</label>
                      <input
                        value={label}
                        onChange={(event) => setLabel(event.target.value)}
                        placeholder="Ej. Microservicios, UX/UI, DevOps"
                        className="w-full rounded-2xl border border-[var(--umss-border)] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--umss-brand)] focus:ring-2 focus:ring-[rgba(80,72,229,0.12)]"
                      />
                    </div>
                    {label ? (
                      <span className="rounded-full bg-[var(--umss-brand)]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--umss-brand)] shadow-sm">
                        {label}
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">Descripción corta</label>
                    <input
                      value={shortDescription}
                      onChange={(event) => setShortDescription(event.target.value)}
                      placeholder="Un breve resumen de una línea sobre tu logro"
                      className="w-full rounded-2xl border border-[var(--umss-border)] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--umss-brand)] focus:ring-2 focus:ring-[rgba(80,72,229,0.12)]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">Descripción detallada</label>
                    <textarea
                      value={detailedDescription}
                      onChange={(event) => setDetailedDescription(event.target.value)}
                      placeholder="Describe los desafíos técnicos, tu solución y el impacto..."
                      className="min-h-[160px] w-full resize-none rounded-[24px] border border-[var(--umss-border)] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--umss-brand)] focus:ring-2 focus:ring-[rgba(80,72,229,0.12)]"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-[var(--umss-border)] bg-[var(--umss-surface)] p-6">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">Ejecución Técnica</h2>
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">Rol en el proyecto</label>
                    <input
                      value={role}
                      onChange={(event) => setRole(event.target.value)}
                      placeholder="Arquitecto Principal / Fullstack"
                      className="w-full rounded-2xl border border-[var(--umss-border)] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--umss-brand)] focus:ring-2 focus:ring-[rgba(80,72,229,0.12)]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">Estado del proyecto</label>
                    <select
                      value={status}
                      onChange={(event) => setStatus(event.target.value)}
                      className="w-full rounded-2xl border border-[var(--umss-border)] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--umss-brand)] focus:ring-2 focus:ring-[rgba(80,72,229,0.12)]"
                    >
                      <option>Producción</option>
                      <option>Beta</option>
                      <option>Concepto</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="mb-2 block text-sm font-semibold text-slate-900">Tecnologías utilizadas</label>
                  <div className="flex flex-wrap gap-2 rounded-3xl border border-[var(--umss-border)] bg-white p-3">
                    {technologies.map((tech) => (
                      <span key={tech} className="inline-flex items-center gap-2 rounded-full bg-[var(--umss-surface)] px-3 py-1 text-xs font-semibold text-slate-700">
                        {tech}
                        <button
                          type="button"
                          onClick={() => handleRemoveTechnology(tech)}
                          className="rounded-full p-1 text-slate-400 transition hover:text-slate-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <div className="flex min-w-[160px] flex-1 items-center gap-2 rounded-2xl bg-[var(--umss-surface)] px-3 py-2">
                      <input
                        value={techInput}
                        onChange={(event) => setTechInput(event.target.value)}
                        placeholder="Escribe una tecnología"
                        className="w-full bg-transparent text-sm text-slate-700 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddTechnology}
                        className="rounded-full bg-[var(--umss-brand)] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#4338CA]"
                      >
                        + Añadir
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">Fecha de inicio</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                      className="w-full rounded-2xl border border-[var(--umss-border)] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--umss-brand)] focus:ring-2 focus:ring-[rgba(80,72,229,0.12)]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">Fecha de finalización</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(event) => setEndDate(event.target.value)}
                      className="w-full rounded-2xl border border-[var(--umss-border)] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--umss-brand)] focus:ring-2 focus:ring-[rgba(80,72,229,0.12)]"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-[var(--umss-border)] bg-[var(--umss-surface)] p-6">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">Galería y Multimedia</h2>
                <div className="mt-6 rounded-[24px] border-2 border-dashed border-[var(--umss-border)] bg-white p-10 text-center text-slate-500">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-3xl bg-[var(--umss-brand)]/10 text-[var(--umss-brand)] shadow-sm">
                    <ArrowLeft className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">Arrastra las capturas de pantalla de tu proyecto aquí</p>
                  <p className="mt-2 text-sm text-slate-500">PNG, JPG o EBP (Máx. 10MB por archivo)</p>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">Repositorio de GitHub</label>
                    <input
                      value={githubUrl}
                      onChange={(event) => setGithubUrl(event.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full rounded-2xl border border-[var(--umss-border)] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--umss-brand)] focus:ring-2 focus:ring-[rgba(80,72,229,0.12)]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">Enlace a demo en vivo</label>
                    <input
                      value={liveUrl}
                      onChange={(event) => setLiveUrl(event.target.value)}
                      placeholder="https://proyecto.dev/..."
                      className="w-full rounded-2xl border border-[var(--umss-border)] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--umss-brand)] focus:ring-2 focus:ring-[rgba(80,72,229,0.12)]"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between rounded-2xl border border-[var(--umss-border)] bg-white px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Hacer proyecto público</p>
                    <p className="text-sm text-slate-500">Permitir que otros en la red UMSS vean este proyecto</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPublic((value) => !value)}
                    className={`relative inline-flex h-9 w-16 items-center rounded-full transition ${
                      isPublic ? 'bg-[var(--umss-brand)]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-7 w-7 rounded-full bg-white shadow-sm transition-transform ${
                        isPublic ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="h-11 rounded-2xl border border-[var(--umss-border)] bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-[var(--umss-surface)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-11 rounded-2xl bg-[var(--umss-brand)] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4338CA]"
                >
                  Actualizar Proyecto
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-6 rounded-[32px] border border-[var(--umss-border)] bg-white p-6 shadow-sm">
            <div className="rounded-[24px] bg-[var(--umss-surface)] p-6">
              <h2 className="text-lg font-semibold text-slate-900">Consejos</h2>
              <div className="mt-6 space-y-4 text-sm text-slate-600">
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <p className="font-semibold text-slate-900">Mantén actualizado</p>
                  <p className="mt-2 text-slate-500">Actualiza regularmente tus proyectos para reflejar tu progreso y habilidades actuales.</p>
                </div>
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <p className="font-semibold text-slate-900">Sé específico</p>
                  <p className="mt-2 text-slate-500">Incluye detalles técnicos específicos sobre las tecnologías y desafíos que enfrentaste.</p>
                </div>
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <p className="font-semibold text-slate-900">Muestra impacto</p>
                  <p className="mt-2 text-slate-500">Describe cómo tu proyecto resolvió problemas reales o mejoró procesos existentes.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}