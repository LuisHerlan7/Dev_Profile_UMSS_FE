import { DragEvent, FormEvent, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { saveProject } from '@features/dashboard/api/developerDashboard';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const ACCEPTED_TYPES = [
  'image/png', 'image/jpeg', 'image/webp',
  'application/pdf',
  'application/zip', 'application/x-zip-compressed',
];
const ACCEPTED_EXTENSIONS = '.png,.jpg,.jpeg,.webp,.pdf,.zip';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function NewProjectPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [label, setLabel] = useState('');
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [role, setRole] = useState('Arquitecto Principal / Fullstack');
  const [status, setStatus] = useState('Producción');
  const [techInput, setTechInput] = useState('');
  const [technologies, setTechnologies] = useState(['React', 'TypeScript', 'TailwindCSS']);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateAndSetFile = useCallback((file: File) => {
    setFileError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError('Formato no soportado. Usa PNG, JPG, WEBP, PDF o ZIP.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`El archivo supera el límite de ${formatFileSize(MAX_FILE_SIZE)}.`);
      return;
    }

    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);

    setUploadedFile(file);
    if (file.type.startsWith('image/')) {
      setFilePreviewUrl(URL.createObjectURL(file));
    } else {
      setFilePreviewUrl(null);
    }
  }, [filePreviewUrl]);

  const handleRemoveFile = () => {
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setUploadedFile(null);
    setFilePreviewUrl(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  };

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

  const handleCancel = () => {
    handleRemoveFile();
    navigate(-1);
  };

  const mapStatus = (uiStatus: string) => {
    switch (uiStatus) {
      case 'Producción': return 'completado';
      case 'Beta': return 'en_desarrollo';
      case 'Concepto': return 'pausado';
      default: return 'completado';
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('nombre_proyecto', title || 'Proyecto nuevo');
      formData.append('descripcion_proyecto', shortDescription || detailedDescription || 'Sin descripción');
      if (role) formData.append('rol_desarrollador', role);
      if (startDate) formData.append('fecha_inicio', startDate);
      if (endDate) formData.append('fecha_fin', endDate);
      if (githubUrl) formData.append('enlace_repositorio', githubUrl);
      if (liveUrl) formData.append('enlace_proyecto_activo', liveUrl);
      formData.append('estado_proyecto', mapStatus(status));

      if (uploadedFile) {
        formData.append('archivo', uploadedFile);
      }

      await saveProject(formData);
      navigate('/dashboard?section=projects');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear el proyecto.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
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
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Añadir Nuevo Proyecto</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Completa el formulario para compartir tu nuevo proyecto profesional con la red UMSS.
                </p>
              </div>
            </div>

            {submitError && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

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
                        onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); handleAddTechnology(); } }}
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

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_EXTENSIONS}
                  className="hidden"
                  onChange={handleFileInputChange}
                />

                {!uploadedFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                    className={`mt-6 cursor-pointer rounded-[24px] border-2 border-dashed p-10 text-center transition-colors ${
                      isDragging
                        ? 'border-[var(--umss-brand)] bg-[rgba(80,72,229,0.06)]'
                        : 'border-[var(--umss-border)] bg-white hover:border-[var(--umss-brand)]/40 hover:bg-[rgba(80,72,229,0.03)]'
                    }`}
                  >
                    <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-3xl shadow-sm transition-colors ${
                      isDragging
                        ? 'bg-[var(--umss-brand)] text-white'
                        : 'bg-[rgba(80,72,229,0.1)] text-[var(--umss-brand)]'
                    }`}>
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {isDragging ? 'Suelta el archivo aquí' : 'Arrastra tu archivo aquí, o haz clic para explorar'}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      PNG, JPG, WEBP, PDF o ZIP — Máx. {formatFileSize(MAX_FILE_SIZE)}
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 rounded-[24px] border border-[var(--umss-border)] bg-white p-4">
                    <div className="flex items-center gap-4">
                      {filePreviewUrl ? (
                        <img
                          src={filePreviewUrl}
                          alt="Vista previa"
                          className="h-16 w-16 flex-shrink-0 rounded-2xl border border-[var(--umss-border)] object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(80,72,229,0.1)]">
                          {uploadedFile.type === 'application/pdf' ? (
                            <FileText className="h-7 w-7 text-[var(--umss-brand)]" />
                          ) : (
                            <ImageIcon className="h-7 w-7 text-[var(--umss-brand)]" />
                          )}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{uploadedFile.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{formatFileSize(uploadedFile.size)}</p>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--umss-surface)]">
                          <div className="h-full rounded-full bg-[var(--umss-brand)] transition-all duration-500" style={{ width: '100%' }} />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-[var(--umss-border)] bg-white text-slate-400 transition hover:border-red-300 hover:bg-red-50 hover:text-red-500"
                        aria-label="Eliminar archivo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {fileError && (
                  <p className="mt-3 text-xs font-medium text-red-500">{fileError}</p>
                )}

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">Repositorio de GitHub</label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(event) => setGithubUrl(event.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full rounded-2xl border border-[var(--umss-border)] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--umss-brand)] focus:ring-2 focus:ring-[rgba(80,72,229,0.12)]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">Enlace a demo en vivo</label>
                    <input
                      type="url"
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
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="h-11 rounded-2xl border border-[var(--umss-border)] bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-[var(--umss-surface)] disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 inline-flex items-center gap-2 rounded-2xl bg-[var(--umss-brand)] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4338CA] disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando…
                    </>
                  ) : (
                    'Publicar Proyecto'
                  )}
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-6 rounded-[32px] border border-[var(--umss-border)] bg-white p-6 shadow-sm">
            <div className="rounded-[24px] bg-[var(--umss-surface)] p-6">
              <h2 className="text-lg font-semibold text-slate-900">Consejos</h2>
              <div className="mt-6 space-y-4 text-sm text-slate-600">
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <p className="font-semibold text-slate-900">Enfócate en el impacto</p>
                  <p className="mt-2 text-slate-500">En lugar de solo listar funciones, describe cómo tu código resolvió un problema o mejoró el rendimiento.</p>
                </div>
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <p className="font-semibold text-slate-900">Lo visual importa</p>
                  <p className="mt-2 text-slate-500">Los proyectos con capturas de pantalla de alta calidad obtienen más interacción de reclutadores.</p>
                </div>
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <p className="font-semibold text-slate-900">Etiqueta con inteligencia</p>
                  <p className="mt-2 text-slate-500">Usa etiquetas como 'Microservicios' o 'GraphQL' para que tu perfil se encuentre mejor.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
