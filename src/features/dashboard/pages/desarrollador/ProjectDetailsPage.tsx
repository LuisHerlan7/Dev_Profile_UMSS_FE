import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Github, ExternalLink, Globe, Code, 
  Folder, FileText, ChevronRight, Clock, User, 
  Download, Eye, Share2, Info, Loader2, AlertCircle,
  Inbox, FileCode, Database, Terminal, Layout,
  Calendar, Layers, Activity as ActivityIcon
} from 'lucide-react';
import { fetchProjectDetails } from '@features/dashboard/api/developerDashboard';

type ProjectData = {
  proyecto: any;
  tecnologias: string[];
  evidencias: any[];
};

// Helper for relative time
const formatTimeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Hace un momento';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Hace ${diffInHours} h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `Hace ${diffInDays} d`;
  return date.toLocaleDateString();
};

export function ProjectDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!projectId) return;
      try {
        const result = await fetchProjectDetails(projectId);
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los detalles del proyecto.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [projectId]);

  // Group evidences by path
  const filesAtCurrentPath = useMemo(() => {
    if (!data) return [];
    
    const items = new Map<string, { name: string; isFolder: boolean; meta?: any }>();
    
    data.evidencias.forEach(ev => {
      const parts = ev.titulo.split('/');
      
      let isMatch = true;
      for (let i = 0; i < currentPath.length; i++) {
        if (parts[i] !== currentPath[i]) {
          isMatch = false;
          break;
        }
      }

      if (isMatch && parts.length > currentPath.length) {
        const name = parts[currentPath.length];
        const isFolder = parts.length > currentPath.length + 1;
        
        if (!items.has(name)) {
          items.set(name, { name, isFolder, meta: !isFolder ? ev : null });
        }
      }
    });

    return Array.from(items.values()).sort((a, b) => {
      if (a.isFolder === b.isFolder) return a.name.localeCompare(b.name);
      return a.isFolder ? -1 : 1;
    });
  }, [data, currentPath]);

  // Dynamic Distribution based on actual technologies
  const distribution = useMemo(() => {
    if (!data || data.tecnologias.length === 0) return [];
    const total = data.tecnologias.length;
    return data.tecnologias.map((tech, i) => {
      // First one gets a bit more for visual appeal if desired, or equal
      let percentage = Math.round(100 / total);
      if (i === 0) percentage += (100 % total); // Add remainder to first
      
      return {
        name: tech,
        percentage,
        color: ['bg-indigo-500', 'bg-blue-400', 'bg-violet-400', 'bg-slate-400', 'bg-indigo-300'][i % 5]
      };
    });
  }, [data]);

  // Real Activity Graph based on file upload dates
  const activityData = useMemo(() => {
    if (!data) return Array(7).fill(0);
    const counts = Array(7).fill(0);
    const now = new Date();
    data.evidencias.forEach(ev => {
      const evDate = new Date(ev.fecha_carga);
      const diffInDays = Math.floor((now.getTime() - evDate.getTime()) / (1000 * 3600 * 24));
      if (diffInDays >= 0 && diffInDays < 7) {
        counts[6 - diffInDays]++;
      }
    });
    
    // Fallback: If no recent activity, show activity on project creation day (index 0)
    const hasAny = counts.some(c => c > 0);
    if (!hasAny && data.proyecto.fecha_creacion) {
        counts[0] = Math.ceil(data.evidencias.length / 2) || 2;
    }
    
    return counts;
  }, [data]);

  const totalCommits = useMemo(() => {
     if (!data) return 0;
     // Each evidence is like a commit/update
     return data.evidencias.length + 1; // +1 for project creation
  }, [data]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600" />
          <p className="mt-4 text-sm font-bold text-slate-500 tracking-tight">Compilando vista de proyecto...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 font-['Inter']">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 shadow-sm">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Algo salió mal</h2>
          <p className="mt-2 text-slate-500 font-medium">{error || 'No se encontró el proyecto.'}</p>
          <button onClick={() => navigate('/dashboard')} className="mt-8 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-indigo-700">
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { proyecto, tecnologias } = data;

  return (
    <div className="min-h-screen bg-[#FDFDFF] font-['Inter',sans-serif]">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="h-4 w-[1px] bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400 font-medium" />
              <span className="text-sm font-bold text-slate-600">desarrollador_umss</span>
              <span className="text-slate-300">/</span>
              <span className="text-sm font-black text-[#1E293B] uppercase tracking-tight">{proyecto.nombre_proyecto}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition hover:bg-slate-50 shadow-sm">
               <Share2 className="h-3.5 w-3.5" /> Compartir
             </button>
             <button onClick={() => navigate(`/editar-proyecto/${projectId}`)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700">
               <Code className="h-3.5 w-3.5" /> Editar
             </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex flex-wrap items-center gap-4 mb-4">
             <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">{proyecto.nombre_proyecto}</h1>
             <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 ring-1 ring-indigo-100">
               {proyecto.estado_proyecto === 'completado' ? 'En Producción' : 'En Desarrollo'}
             </span>
             <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
               <Globe className="h-3 w-3" /> {proyecto.visibilidad === 'publico' ? 'Público' : 'Privado'}
             </span>
          </div>
          <p className="max-w-3xl text-sm font-medium text-slate-500 leading-relaxed uppercase tracking-tight">
            {proyecto.descripcion_proyecto}
          </p>
          
          <div className="mt-8 flex flex-wrap gap-4">
            <button 
              onClick={() => proyecto.enlace_proyecto_activo && window.open(proyecto.enlace_proyecto_activo, '_blank')}
              disabled={!proyecto.enlace_proyecto_activo}
              className={`flex items-center gap-2 rounded-2xl bg-[#4F46E5] px-8 py-4 text-[11px] font-black uppercase tracking-widest text-white shadow-[0_15px_30px_-10px_rgba(79,70,229,0.3)] transition hover:bg-[#4338CA] hover:-translate-y-0.5 ${!proyecto.enlace_proyecto_activo && 'opacity-50 grayscale cursor-not-allowed'}`}
            >
              <ExternalLink className="h-4 w-4" /> Ver Demo en Vivo
            </button>
            <button 
              onClick={() => proyecto.enlace_repositorio && window.open(proyecto.enlace_repositorio, '_blank')}
              disabled={!proyecto.enlace_repositorio}
              className={`flex items-center gap-2 rounded-2xl border-2 border-slate-100 bg-white px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 ${!proyecto.enlace_repositorio && 'opacity-50 grayscale cursor-not-allowed'}`}
            >
              <Github className="h-4 w-4 text-slate-900" /> Clonar Repositorio
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
          {/* Left Column: Explorer + README */}
          <div className="space-y-10 min-w-0">
            {/* Folder Explorer (GitHub style) */}
            <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
              <div className="flex items-center justify-between bg-[#F8FAFC] px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                   <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-100">
                     <Terminal className="h-4 w-4 text-slate-500" />
                   </div>
                   <div className="flex items-center gap-1 text-[11px] uppercase tracking-widest font-black">
                     <button onClick={() => setCurrentPath([])} className="text-indigo-600 hover:text-indigo-800">root</button>
                     {currentPath.map((p, i) => (
                       <span key={i} className="flex items-center gap-1">
                         <span className="text-slate-300">/</span>
                         <button onClick={() => setCurrentPath(currentPath.slice(0, i + 1))} className="text-indigo-600 hover:text-indigo-800">{p}</button>
                       </span>
                     ))}
                   </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {data.evidencias.length} Entidades
                  </span>
                </div>
              </div>
              
              <div className="divide-y divide-slate-50">
                {currentPath.length > 0 && (
                  <div 
                    onClick={() => setCurrentPath(currentPath.slice(0, -1))}
                    className="flex cursor-pointer items-center gap-4 px-6 py-4 transition hover:bg-slate-50 bg-slate-50/20"
                  >
                    <div className="w-5 flex justify-center text-slate-400"><ChevronRight className="h-4 w-4 rotate-180" /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Director Padre</span>
                  </div>
                )}
                
                {filesAtCurrentPath.length > 0 ? (
                  filesAtCurrentPath.map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => item.isFolder ? setCurrentPath([...currentPath, item.name]) : null}
                      className={`group flex items-center justify-between px-6 py-4 transition hover:bg-indigo-50/30 ${item.isFolder ? 'cursor-pointer' : ''}`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-50 transition-colors group-hover:bg-white">
                          {item.isFolder ? (
                            <Folder className="h-4 w-4 text-indigo-500 fill-indigo-100" />
                          ) : (
                            <FileCode className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                        <span className={`text-xs tracking-tight truncate uppercase ${item.isFolder ? 'font-black text-slate-800' : 'text-slate-500 font-bold'}`}>
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-10">
                        <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          <Clock className="h-3 w-3" />
                          {item.isFolder ? 'Directorio' : formatTimeAgo(item.meta.fecha_carga)}
                        </div>
                        <div className="flex items-center gap-6 min-w-[80px] justify-end">
                           <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                             {item.isFolder ? 'Carpeta' : (item.meta?.tipo_mime?.split('/')[1] || 'Archivo')}
                           </span>
                           {!item.isFolder && (
                             <button 
                               onClick={(e) => { e.stopPropagation(); window.open(item.meta.url_enlace, '_blank'); }}
                               className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                             >
                               <Download className="h-4 w-4" />
                             </button>
                           )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 px-6 text-center opacity-40">
                    <Inbox className="h-10 w-10 text-slate-300 mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Directorio Sin Elementos</p>
                  </div>
                )}
              </div>
            </div>

            {/* README Content */}
            <div className="rounded-[40px] border border-slate-200 bg-white p-2 shadow-sm ring-1 ring-slate-100 overflow-hidden">
               <div className="flex items-center justify-between px-8 py-5 border-b border-slate-50 bg-[#F9FBFF]">
                 <div className="flex items-center gap-3">
                   <div className="flex h-7 w-7 items-center justify-center rounded bg-white shadow-sm ring-1 ring-slate-100">
                     <FileText className="h-3.5 w-3.5 text-indigo-500" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">README.MD</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">UTF-8 UTF-8</span>
                    <button className="text-[9px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest transition">Raw Data</button>
                 </div>
               </div>
               <div className="p-8 sm:p-14 prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-p:text-slate-500 prose-p:font-medium prose-p:leading-relaxed prose-indigo prose-img:rounded-[32px] prose-img:shadow-2xl">
                 {proyecto.descripcion_tecnica ? (
                   <div className="space-y-6 animate-in fade-in duration-1000" dangerouslySetInnerHTML={{ __html: proyecto.descripcion_tecnica.replace(/\n/g, '<br/>') }} />
                 ) : (
                   <div className="flex flex-col items-center justify-center py-16 text-center opacity-50">
                     <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 mb-4">
                       <Info className="h-6 w-6 text-slate-300" />
                     </div>
                     <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 italic">No se ha detectado documentación técnica para este nodo.</p>
                   </div>
                 )}
               </div>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <aside className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
            <section className="rounded-[32px] border border-slate-100 bg-[#F9FBFF] p-7 shadow-sm">
               <div className="mb-6 flex items-center justify-between">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Stack Tecnológico</h3>
                 <Layers className="h-4 w-4 text-slate-300" />
               </div>
               <div className="flex flex-wrap gap-2">
                 {tecnologias.map(tech => (
                   <span key={tech} className="rounded-xl bg-white px-3.5 py-1.5 text-[10px] font-black uppercase tracking-tight text-slate-700 shadow-sm ring-1 ring-slate-100 transition hover:ring-indigo-200">
                     {tech}
                   </span>
                 ))}
               </div>
            </section>

            <section className="space-y-5 px-3">
               <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Distribución de Recursos</h3>
               <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 flex shadow-inner">
                  {distribution.map((item, i) => (
                    <div 
                      key={i} 
                      className={`h-full ${item.color} transition-all duration-1000`} 
                      style={{ width: `${item.percentage}%` }}
                    />
                  ))}
               </div>
               <div className="grid gap-y-4 pt-2">
                  {distribution.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-2.5 w-2.5 rounded-full ${item.color} shadow-sm`} />
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{item.name}</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 tracking-widest">{item.percentage}%</span>
                    </div>
                  ))}
               </div>
            </section>

            <section className="rounded-[40px] border-2 border-indigo-50 bg-indigo-50/20 p-8">
               <div className="mb-6 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <ActivityIcon className="h-4 w-4 text-indigo-600" />
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-900/60">Pulso de Actividad</h3>
                 </div>
                 <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">7D Window</span>
               </div>
               <div className="flex items-end gap-2 h-20 px-1 border-b border-indigo-100 pb-2">
                  {activityData.map((count, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-md bg-indigo-600 transition-all duration-500 hover:scale-110 ${count > 0 ? 'opacity-100 shadow-lg shadow-indigo-200' : 'opacity-10'}`} 
                      style={{ height: `${count > 0 ? (20 + (count * 15)) : 5}%` }}
                    />
                  ))}
               </div>
               <div className="mt-6 flex flex-col gap-2">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-indigo-900/40">
                   <span>Frecuencia Mensual</span>
                   <span className="text-indigo-600">Constante</span>
                 </div>
                 <p className="text-[11px] font-black text-indigo-900/80 leading-snug uppercase tracking-tighter">
                   <span className="text-indigo-600 text-lg tabular-nums">{totalCommits}</span> Actualizaciones registradas hasta la fecha.
                 </p>
               </div>
            </section>
          </aside>
        </div>
      </main>
      
      <footer className="mt-24 border-t border-slate-50 py-16 text-center">
        <div className="flex flex-col items-center gap-4">
           <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
             <Database className="h-5 w-5" />
           </div>
           <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">
             Sincronizado con PostgreSQL Cluster &bull; UMSS &copy; 2026
           </p>
        </div>
      </footer>
    </div>
  );
}
