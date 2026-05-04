import { useEffect, useMemo, useState } from 'react';
import { 
  FileText, Image, UploadCloud, Video, 
  Filter, Edit, X, Archive, CheckCircle, 
  AlertTriangle, Plus, Loader2, Save, Trash2,
  ExternalLink, Search, ChevronDown, Folder
} from 'lucide-react';
import { Button } from '@shared/components/ui/Button';
import { DashboardBadge } from '@shared/components/dashboard/DashboardBadge';
import { DashboardCard } from '@shared/components/dashboard/DashboardCard';
import { uploadProjectEvidence, updateEvidence } from '@services/projects';
import { SectionHeading } from './SectionHeading';

type EvidenceItem = {
  id: string;
  title: string;
  type: string;
  status: string;
  file_url?: string | null;
  project: string;
  project_id?: string | null;
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

  // Filtering State
  const [filterProjectId, setFilterProjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Editing State
  const [editingEvidence, setEditingEvidence] = useState<EvidenceItem | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!selectedProject && projects.length > 0) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject]);

  const filteredEvidences = useMemo(() => {
    return evidences.filter((ev) => {
      const matchesProject = filterProjectId === 'all' || ev.project_id === filterProjectId || ev.project === projects.find(p => p.id === filterProjectId)?.title;
      const matchesSearch = ev.title.toLowerCase().includes(searchQuery.toLowerCase()) || ev.project.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesProject && matchesSearch;
    });
  }, [evidences, filterProjectId, searchQuery, projects]);

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

  const handleUpdateEvidence = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingEvidence) return;

    const formData = new FormData(event.currentTarget);
    const updates = {
      titulo: formData.get('titulo') as string,
    };

    try {
      setIsUpdating(true);
      setError('');
      
      // Update metadata
      await updateEvidence(editingEvidence.id, updates);
      
      // If there are batch files, upload them to the project
      if (batchFiles.length > 0 && editingEvidence.project_id) {
         await uploadProjectEvidence(editingEvidence.project_id, batchFiles);
      }

      setSuccess('Evidencia actualizada correctamente.');
      setEditingEvidence(null);
      setBatchFiles([]);
      onEvidenceUploaded?.();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar evidencia.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-['Inter',sans-serif]">
      <SectionHeading
        eyebrow="Gestión Documental"
        title="Repositorio de Evidencias"
        description="Administra los respaldos de tus retos y logros. Aquí puedes subir nuevos archivos, filtrar por proyecto y actualizar el estado de tus validaciones."
      />

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Upload Card */}
        <DashboardCard 
          title="Nueva carga masiva" 
          description={`Subiendo a: ${projectLabel}`}
          className="rounded-[32px] border-indigo-100 shadow-xl shadow-indigo-50/50"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Proyecto Objetivo</label>
              <div className="relative">
                <select
                  value={selectedProject}
                  onChange={(event) => setSelectedProject(event.target.value)}
                  disabled={!hasProjects}
                  className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50"
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Categoría</label>
              <div className="relative">
                <select className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50">
                  <option>Imagen / Captura</option>
                  <option>Video Demo</option>
                  <option>Documento PDF</option>
                  <option>Enlace Externo</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[28px] border-2 border-dashed border-indigo-100 bg-indigo-50/20 p-8 text-center transition-all hover:border-indigo-300 hover:bg-white hover:shadow-inner group">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-white text-indigo-600 shadow-lg shadow-indigo-100 ring-4 ring-indigo-50 group-hover:scale-110 transition-transform">
                <UploadCloud className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Suelta tus evidencias aquí</p>
                <p className="mt-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                  Formatos aceptados: JPG, PNG, MP4, PDF. Máx 50MB.
                </p>
              </div>
            </div>
            <input
              type="file"
              multiple
              accept="image/*,video/*,application/pdf"
              onChange={(event) => setFiles(Array.from(event.target.files || []))}
              disabled={!hasProjects}
              className="mt-6 w-full text-[11px] font-black uppercase tracking-widest text-indigo-600 file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:px-6 file:py-2.5 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:text-white hover:file:bg-indigo-700 transition"
            />
            
            {files.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {files.slice(0, 3).map((f) => (
                  <span key={f.name} className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 shadow-sm border border-slate-100 animate-in zoom-in-50">
                    <FileText className="h-3 w-3 text-indigo-400" /> {f.name}
                  </span>
                ))}
                {files.length > 3 && <span className="text-[10px] font-black text-indigo-400 pt-2">+{files.length - 3} archivos más</span>}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Button
              type="button"
              className="h-12 w-full rounded-2xl bg-indigo-600 text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 hover:-translate-y-0.5"
              disabled={isSubmitting}
              onClick={handleUpload}
            >
              {isSubmitting ? (
                 <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Procesando carga...</span>
              ) : 'Confirmar Envío'}
            </Button>
            {error && <div className="rounded-xl bg-red-50 p-3 text-center text-[10px] font-black uppercase tracking-widest text-red-500">{error}</div>}
            {success && <div className="rounded-xl bg-emerald-50 p-3 text-center text-[10px] font-black uppercase tracking-widest text-emerald-600">{success}</div>}
          </div>
        </DashboardCard>

        {/* Legend Card */}
        <div className="space-y-6">
          <DashboardCard title="Estados del Ciclo" description="Interpretación de las validaciones académicas.">
            <div className="space-y-4">
              {[
                { label: 'En Revisión (Pendiente)', desc: 'Validación por el equipo de coordinación.', tone: 'warning' as const },
                { label: 'Verificado (Activo)', desc: 'Visible en tu portafolio público.', tone: 'success' as const },
                { label: 'Rechazado (No Validado)', desc: 'Requiere corrección o nuevos archivos.', color: 'text-rose-600 bg-rose-50 border-rose-100' },
              ].map((item, i) => (
                <div key={i} className={`flex flex-col gap-2 rounded-[24px] border border-slate-100 bg-white p-4 transition hover:shadow-md ${item.color?.split(' ')[0] || ''}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-tight text-slate-700">{item.label}</span>
                    {item.tone ? <DashboardBadge tone={item.tone}>Activo</DashboardBadge> : <span className="rounded-lg bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-500 uppercase tracking-widest">Inactivo</span>}
                  </div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* RECENT EVIDENCES - FILTER & LIST */}
      <DashboardCard 
        title="Repositorio Reciente" 
        description="Listado exhaustivo de tus archivos de respaldo."
        className="rounded-[40px] border-slate-100 shadow-2xl shadow-slate-200/50"
      >
        <div className="mb-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex min-w-[300px] flex-1 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
             <Search className="h-4 w-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Buscar en el repositorio..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-transparent text-xs font-bold text-slate-700 outline-none"
             />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-indigo-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filtrar:</span>
            </div>
            <select
              value={filterProjectId}
              onChange={(e) => setFilterProjectId(e.target.value)}
              className="rounded-xl border border-slate-100 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-tight text-slate-600 shadow-sm outline-none focus:ring-2 focus:ring-indigo-50"
            >
              <option value="all">Todas las evidencias</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredEvidences.length === 0 ? (
            <div className="col-span-full py-20 text-center animate-in fade-in duration-700">
               <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[32px] bg-slate-50 text-slate-200">
                 <Folder className="h-10 w-10" />
               </div>
               <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">No se encontraron evidencias coincidentes</p>
            </div>
          ) : (
            filteredEvidences.map((item) => (
              <article
                key={item.id}
                className="group relative flex flex-col justify-between rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-100/50"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="max-w-[150px] truncate text-[10px] font-black uppercase tracking-widest text-indigo-400">{item.project}</span>
                    <button 
                      onClick={() => setEditingEvidence(item)}
                      className="rounded-lg p-1.5 text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 transition opacity-0 group-hover:opacity-100"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-indigo-600 shadow-inner group-hover:bg-indigo-50 group-hover:text-indigo-700 transition-colors">
                      {resolveEvidenceIcon(item.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-black tracking-tight text-slate-800 uppercase">{item.title}</h3>
                      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">Tipo: {item.type}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-4">
                  <StatusBadge status={item.status} />
                  {item.file_url && (
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-indigo-600 hover:underline"
                    >
                      Ver Nodo <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </DashboardCard>

      {/* EDIT MODAL */}
      {editingEvidence && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 p-6 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="relative w-full max-w-lg overflow-hidden rounded-[40px] border border-white/20 bg-white shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="bg-indigo-600 px-10 py-8 text-white">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Editor de Evidencia</p>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Personalizar Registro</h2>
                  </div>
                  <button onClick={() => setEditingEvidence(null)} className="rounded-2xl bg-white/10 p-2 hover:bg-white/20 transition">
                    <X className="h-6 w-6" />
                  </button>
                </div>
             </div>

             <form onSubmit={handleUpdateEvidence} className="p-10">
               <div className="space-y-8">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Título del Registro</label>
                   <input 
                     name="titulo"
                     defaultValue={editingEvidence.title}
                     className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition"
                   />
                 </div>

                 <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado de Validación</label>
                      <div className="flex h-12 items-center rounded-2xl border border-slate-200 bg-slate-50 px-6 text-sm font-bold text-slate-700">
                        {editingEvidence.status === 'verificado'
                          ? 'Verificado'
                          : editingEvidence.status === 'rechazado'
                          ? 'Rechazado'
                          : 'En revisión'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identificador</label>
                      <div className="flex h-12 items-center rounded-2xl border border-slate-100 bg-slate-100/50 px-6 text-[10px] font-black text-slate-400 uppercase">
                        ID: {editingEvidence.id}
                      </div>
                    </div>
                 </div>

                 {/* "EVIDENCIA SOBRE EVIDENCIA" Section */}
                 <div className="rounded-[32px] border-2 border-dashed border-indigo-100 bg-indigo-50/10 p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-slate-100">
                        <Plus className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Anexar más evidencias</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Añade archivos a este proyecto</p>
                      </div>
                    </div>
                    <input 
                      type="file" 
                      multiple
                      onChange={(e) => setBatchFiles(Array.from(e.target.files || []))}
                      className="w-full text-[10px] font-black uppercase tracking-widest text-indigo-600 file:mr-3 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:text-[9px] file:font-black file:uppercase file:text-indigo-600 file:shadow-sm"
                    />
                    {batchFiles.length > 0 && (
                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest text-center">{batchFiles.length} archivos en cola para subir</p>
                    )}
                 </div>
               </div>

               <div className="mt-10 flex gap-4">
                 <Button 
                   type="button" 
                   variant="secondary"
                   onClick={() => setEditingEvidence(null)}
                   className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-[0.2em] text-black hover:bg-slate-50"
                 >
                   Cancelar
                 </Button>
                 <Button 
                   type="submit" 
                   disabled={isUpdating}
                   className="h-12 flex-2 rounded-2xl bg-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700"
                 >
                   {isUpdating ? 'Guardando...' : 'Aplicar Cambios'}
                 </Button>
               </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
}

function resolveEvidenceIcon(type: string) {
  if (type === 'imagen') {
    return <Image className="h-6 w-6" />;
  }

  if (type === 'video') {
    return <Video className="h-6 w-6" />;
  }

  return <FileText className="h-6 w-6" />;
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'verificado' || status === 'aprobado') {
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
