import { useMemo, useState } from 'react';
import { FileText, Image, UploadCloud, Video } from 'lucide-react';
import { Button } from '@shared/components/ui/Button';
import { DashboardBadge } from '@shared/components/dashboard/DashboardBadge';
import { DashboardCard } from '@shared/components/dashboard/DashboardCard';
import { uploadProjectEvidence } from '@services/projects';
import { SectionHeading } from './SectionHeading';

type EvidenceItem = {
  id: string;
  title: string;
  type: string;
  status: string;
  file_url?: string | null;
  project: string;
  created_at?: string | null;
};

type ProjectOption = {
  id: string;
  title: string;
};

type EvidenceSectionProps = {
  evidences: EvidenceItem[];
  projects: ProjectOption[];
  onEvidenceUploaded?: () => void;
};

export function EvidenceSection({ evidences, projects, onEvidenceUploaded }: EvidenceSectionProps) {
  const hasProjects = projects.length > 0;
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const projectLabel = useMemo(
    () => projects.find((project) => project.id === selectedProject)?.title || 'Proyecto',
    [projects, selectedProject]
  );

  const handleUpload = async () => {
    setError('');
    setSuccess('');

    if (!selectedProject) {
      setError('Selecciona el proyecto al que pertenece la evidencia.');
      return;
    }

    if (files.length === 0) {
      setError('Adjunta al menos un archivo de evidencia.');
      return;
    }

    try {
      setIsSubmitting(true);
      await uploadProjectEvidence(selectedProject, files);
      setSuccess('Evidencias enviadas. Quedan en revisión.');
      setFiles([]);
      onEvidenceUploaded?.();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'No se pudo subir la evidencia.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Evidencias del proyecto"
        title="Subir Evidencia"
        description="Carga archivos que respalden la veracidad de tus proyectos. El equipo admin validará cada evidencia."
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <DashboardCard title="Registrar evidencia" description={`Proyecto seleccionado: ${projectLabel}`}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-600">
              Proyecto
              <select
                value={selectedProject}
                onChange={(event) => setSelectedProject(event.target.value)}
                disabled={!hasProjects}
                className="mt-2 h-11 w-full rounded-2xl border border-[var(--umss-border)] bg-white px-4 text-sm text-slate-900 outline-none focus:border-[rgba(80,72,229,0.35)] focus:ring-2 focus:ring-[rgba(80,72,229,0.15)]"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-slate-600">
              Tipo de evidencia
              <select className="mt-2 h-11 w-full rounded-2xl border border-[var(--umss-border)] bg-white px-4 text-sm text-slate-900 outline-none focus:border-[rgba(80,72,229,0.35)] focus:ring-2 focus:ring-[rgba(80,72,229,0.15)]">
                <option>Imagen / Captura</option>
                <option>Video Demo</option>
                <option>Documento PDF</option>
                <option>Enlace Externo</option>
              </select>
            </label>
          </div>

          <div className="mt-4 rounded-3xl border border-dashed border-[rgba(80,72,229,0.3)] bg-[rgba(240,240,255,0.4)] p-5 text-center sm:text-left">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-[var(--umss-brand)] shadow-sm">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Arrastra tus archivos aqui</p>
                <p className="mt-1 text-xs text-slate-500">
                  Imagenes, videos o PDF. Maximo 50MB por archivo.
                </p>
              </div>
            </div>
            <input
              type="file"
              multiple
              accept="image/*,video/*,application/pdf"
              onChange={(event) => setFiles(Array.from(event.target.files || []))}
              disabled={!hasProjects}
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
                Adjunta al menos un archivo para enviar tu evidencia.
              </p>
            )}

            <div className="mt-4 flex flex-col gap-2">
              <Button
                type="button"
                className="h-10 rounded-2xl text-sm font-semibold"
                disabled={isSubmitting}
                onClick={handleUpload}
              >
                {isSubmitting ? 'Subiendo...' : 'Subir evidencia'}
              </Button>
              {error ? <p className="text-xs text-rose-600">{error}</p> : null}
              {success ? <p className="text-xs text-emerald-600">{success}</p> : null}
            </div>
            {!hasProjects ? (
              <p className="mt-3 text-xs text-amber-600">
                Primero crea un proyecto para poder adjuntar evidencias.
              </p>
            ) : null}
          </div>
        </DashboardCard>

        <div className="space-y-4">
          <DashboardCard title="Guia rapida" description="Tu evidencia pasa por tres estados.">
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-2xl border border-[var(--umss-border)] bg-white px-3 py-2">
                <span>En revisión</span>
                <DashboardBadge tone="warning">Pendiente</DashboardBadge>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-[var(--umss-border)] bg-white px-3 py-2">
                <span>Verificado</span>
                <DashboardBadge tone="success">Aprobado</DashboardBadge>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-[var(--umss-border)] bg-white px-3 py-2">
                <span>Rechazado</span>
                <DashboardBadge className="border border-rose-200 bg-rose-50 text-rose-600">
                  Observado
                </DashboardBadge>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>

      <DashboardCard title="Evidencias recientes" description="Archivos que ya se encuentran en revisión.">
        <div className="grid gap-4 lg:grid-cols-3">
          {evidences.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-[var(--umss-border)] bg-[var(--umss-surface)] p-6 text-center text-sm text-slate-500">
              Aún no has cargado evidencias. Empieza subiendo archivos para tus proyectos.
            </div>
          ) : (
            evidences.map((item) => (
              <article
                key={item.id}
                className="flex h-full flex-col justify-between rounded-3xl border border-[var(--umss-border)] bg-white p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.2)]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{item.project}</span>
                    {item.created_at ? <span>{item.created_at}</span> : null}
                  </div>
                  <div className="flex items-center gap-2">
                    {resolveEvidenceIcon(item.type)}
                    <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500">Tipo: {item.type}</p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <StatusBadge status={item.status} />
                  {item.file_url ? (
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-[var(--umss-brand)]"
                    >
                      Ver archivo
                    </a>
                  ) : null}
                </div>
              </article>
            ))
          )}
        </div>
      </DashboardCard>
    </div>
  );
}

function resolveEvidenceIcon(type: string) {
  if (type === 'imagen') {
    return <Image className="h-4 w-4 text-[var(--umss-brand)]" />;
  }

  if (type === 'video') {
    return <Video className="h-4 w-4 text-[var(--umss-brand)]" />;
  }

  return <FileText className="h-4 w-4 text-[var(--umss-brand)]" />;
}

function StatusBadge({ status }: { status: string }) {
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
