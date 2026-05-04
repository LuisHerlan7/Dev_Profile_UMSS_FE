import { DragEvent, FormEvent, useCallback, useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Upload, X, FileText, Image as ImageIcon, Loader2, 
  Bold, Italic, List, Link as LinkIcon, Video, Eye, Code, 
  FolderPlus, Github, ExternalLink, Lightbulb, CheckCircle2,
  Trash2, Monitor, Layout, FileJson, ChevronRight, ChevronDown, 
  Folder, FolderOpen, MoreVertical, Plus, Box, AlertCircle, Check
} from 'lucide-react';
import { saveProject } from '@features/dashboard/api/developerDashboard';
import { renderMarkdownToHtml } from '@shared/utils/markdown';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

type ProjectFile = {
  id: string;
  file: File;
  folder: string;
};

// Helper to convert paths to a tree structure
const buildFolderTree = (folders: string[]) => {
  const root: any = { name: 'root', children: {}, isRoot: true, fullPath: '' };
  folders.forEach(path => {
    let current = root;
    const parts = path.split('/').filter(Boolean);
    let cumulativePath = '';
    parts.forEach(part => {
      cumulativePath += part + '/';
      if (!current.children[part]) {
        current.children[part] = { name: part, children: {}, fullPath: cumulativePath };
      }
      current = current.children[part];
    });
  });
  return root;
};

export function NewProjectPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const txtInputRef = useRef<HTMLInputElement | null>(null);
  const techInputRef = useRef<HTMLInputElement | null>(null);
  
  // Basic Info
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'markdown' | 'preview'>('markdown');
  
  // Technical details
  const [role, setRole] = useState('Arquitecto Principal / Fullstack');
  const [status, setStatus] = useState('En Producción');
  const [techInput, setTechInput] = useState('');
  const [technologies, setTechnologies] = useState(['React 18', 'TypeScript', 'Node.js', 'PostgreSQL']);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Files and Structure (Starting from 0)
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['']));
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // Links and visibility
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  
  // Sidebar state
  const [showTips, setShowTips] = useState(true);
  
  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());

  // Setup webkitdirectory ref
  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute('webkitdirectory', '');
      folderInputRef.current.setAttribute('directory', '');
    }
  }, []);

  const folderTree = useMemo(() => buildFolderTree(folders), [folders]);

  const toggleFolder = (path: string) => {
    const newSet = new Set(expandedFolders);
    if (newSet.has(path)) newSet.delete(path);
    else newSet.add(path);
    setExpandedFolders(newSet);
  };

  // Markdown actions
  const applyMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('detailed-desc') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);

    const newValue = before + prefix + selected + suffix + after;
    setDetailedDescription(newValue);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 10);
  };

  const handleLoadTxt = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          setDetailedDescription((current) => current + (current ? '\n\n' : '') + text);
        }
      };
      reader.readAsText(file);
    }
    if (event.target) event.target.value = '';
  };

  const handleAddFiles = (files: FileList | null, destinationFolder: string = currentFolder) => {
    if (!files) return;
    const newFiles: ProjectFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      folder: destinationFolder
    }));
    setProjectFiles(prev => [...prev, ...newFiles]);
  };

  const handleUploadFolder = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFolders = new Set(folders);
    const addedFiles: ProjectFile[] = [];

    Array.from(files).forEach(file => {
      const relPath = (file as any).webkitRelativePath;
      if (relPath) {
        const parts = relPath.split('/');
        parts.pop(); // Remove filename
        const folderPath = parts.join('/') + '/';
        
        // Add all subfolders to the folders list
        let subPath = '';
        parts.forEach((p: string) => {
          subPath += p + '/';
          newFolders.add(subPath);
        });
        
        addedFiles.push({
          id: Math.random().toString(36).substring(7),
          file,
          folder: folderPath
        });
      }
    });

    setFolders(Array.from(newFolders));
    setProjectFiles(prev => [...prev, ...addedFiles]);
    if (event.target) event.target.value = '';
  };

  const createFolder = () => {
    const name = newFolderName.trim();
    if (!name) {
      setIsCreatingFolder(false);
      return;
    }
    const path = currentFolder + name + '/';
    if (!folders.includes(path)) {
      setFolders(prev => [...prev, path]);
    }
    setNewFolderName('');
    setIsCreatingFolder(false);
    setCurrentFolder(path);
    // Expand parents
    const parts = path.split('/').filter(Boolean);
    let cumulative = '';
    const newSet = new Set(expandedFolders);
    parts.forEach(p => {
      cumulative += p + '/';
      newSet.add(cumulative);
    });
    setExpandedFolders(newSet);
  };

  const removeFile = (id: string) => {
    setProjectFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleAddTechnology = () => {
    const tech = techInput.trim();
    if (tech && !technologies.includes(tech)) {
      setTechnologies(prev => [...prev, tech]);
    }
    setTechInput('');
  };

  const validateForm = () => {
    const errors = new Set<string>();
    if (!title.trim()) errors.add('title');
    if (!shortDescription.trim()) errors.add('description');
    setValidationErrors(errors);
    return errors.size === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitError(null);
    if (!validateForm()) {
      setSubmitError('Por favor completa los campos obligatorios resaltados en rojo.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('nombre_proyecto', title);
      formData.append('descripcion_proyecto', shortDescription);
      formData.append('descripcion_tecnica', detailedDescription);
      formData.append('rol_desarrollador', role);
      formData.append('estado_proyecto', status === 'En Producción' ? 'completado' : 'en_desarrollo');
      formData.append('fecha_inicio', startDate);
      if (endDate) formData.append('fecha_fin', endDate);
      formData.append('enlace_repositorio', githubUrl);
      formData.append('enlace_proyecto_activo', liveUrl);
      formData.append('visibilidad', isPublic ? 'publico' : 'privado');

      projectFiles.forEach((f, index) => {
        formData.append(`evidences[${index}]`, f.file);
        formData.append(`evidence_folders[${index}]`, f.folder);
      });

      technologies.forEach((tech, index) => {
        formData.append(`technologies[${index}]`, tech);
      });

      await saveProject(formData);
      setIsSuccess(true);
      
      // Delay to show success state
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      console.error('Submission error:', err);
      setSubmitError(err.message || 'Error al guardar el proyecto. Verifica los datos e intenta de nuevo.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // TreeNode component
  const TreeNode = ({ node, depth = 0 }: { node: any, depth?: number }) => {
    const isExpanded = expandedFolders.has(node.fullPath || '');
    const hasChildren = Object.keys(node.children).length > 0;
    const isSelected = currentFolder === node.fullPath;

    return (
      <div className="select-none">
        {!node.isRoot && (
          <div 
            onClick={() => {
              toggleFolder(node.fullPath);
              setCurrentFolder(node.fullPath);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer rounded-lg transition-colors ${isSelected ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
            style={{ paddingLeft: `${depth * 14}px` }}
          >
            {hasChildren ? (
              isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <div className="w-3.5" />
            )}
            {isExpanded ? <FolderOpen className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-indigo-400'}`} /> : <Folder className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-indigo-400'}`} />}
            <span className="text-[11px] font-bold truncate">{node.name}</span>
          </div>
        )}
        {(isExpanded || node.isRoot) && (
          <div>
            {Object.values(node.children).sort((a: any, b: any) => a.name.localeCompare(b.name)).map((child: any) => (
              <TreeNode key={child.fullPath} node={child} depth={node.isRoot ? depth : depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const filteredFiles = useMemo(() => {
    return projectFiles.filter(f => f.folder === currentFolder);
  }, [projectFiles, currentFolder]);
  const previewHtml = useMemo(() => renderMarkdownToHtml(detailedDescription), [detailedDescription]);

  return (
    <div className="min-h-screen bg-[#FDFDFF] px-4 py-8 sm:px-6 lg:px-12 font-['Inter',sans-serif]">
      {showTips && (
        <div className="fixed right-12 top-[20%] z-50 w-[320px] transform animate-in fade-in slide-in-from-right-10 duration-500 max-xl:hidden">
          <div className="relative rounded-[32px] bg-[#EEF2FF] p-8 shadow-[0_20px_50px_-20px_rgba(79,70,229,0.25)] ring-1 ring-indigo-100">
            <button onClick={() => setShowTips(false)} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/50 text-indigo-600 transition hover:bg-white hover:rotate-90"><X className="h-4 w-4" /></button>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200"><Lightbulb className="h-5 w-5" /></div>
              <h3 className="text-lg font-bold text-slate-800">Consejos de Curador</h3>
            </div>
            <div className="space-y-6">
              {[
                { title: 'Enfócate en el Impacto', desc: 'En lugar de solo listar funciones, describe cómo tu código resolvió un problema específico o mejoró el rendimiento.' },
                { title: 'Lo Visual Importa', desc: 'Los proyectos con capturas de pantalla de alta calidad o GIFs obtienen 3 veces más interacción de los reclutadores.' },
                { title: 'Etiqueta con Inteligencia', desc: 'Usa etiquetas específicas como \'Microservicios\' o \'GraphQL\' para ayudar al algoritmo a encontrar tu perfil.' }
              ].map((tip, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1 flex-shrink-0"><CheckCircle2 className="h-5 w-5 text-indigo-500" /></div>
                  <div><h4 className="text-sm font-bold text-slate-800">{tip.title}</h4><p className="mt-1 text-xs leading-relaxed text-slate-600">{tip.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl">
        <header className="mb-12 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-600">Portafolio de desarrollador UMSS</p><h1 className="mt-2 text-4xl font-extrabold tracking-tight text-[#1E293B] sm:text-5xl">Añadir Nuevo Proyecto</h1></div>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 text-sm font-bold text-slate-500 transition hover:text-slate-800">Descartar</button>
            <button 
              type="button" 
              onClick={handleSubmit} 
              disabled={isSubmitting || isSuccess} 
              className={`flex items-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-bold text-white shadow-xl transition-all duration-300 ${isSuccess ? 'bg-green-500 shadow-green-100' : 'bg-indigo-600 shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5'}`}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : isSuccess ? <Check className="h-4 w-4" /> : null} 
              {isSubmitting ? 'Publicando Proyecto...' : isSuccess ? '¡Publicado con éxito!' : 'Publicar Proyecto'}
            </button>
          </div>
        </header>

        {submitError && (
          <div className="mb-8 flex items-center gap-4 rounded-3xl bg-red-50 p-6 ring-1 ring-red-100 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-red-100">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-900">No se pudo publicar</h3>
              <p className="mt-0.5 text-xs text-red-600/80">{submitError}</p>
            </div>
            <button onClick={() => setSubmitError(null)} className="ml-auto text-red-300 hover:text-red-500 transition">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <form className="space-y-10 pb-20">
          <section className="space-y-6">
            <div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Layout className="h-4 w-4" /></div><h2 className="text-xl font-bold text-[#334155]">Fundamentos del Proyecto</h2></div>
            <div className="space-y-4">
              <div className="group">
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400 group-focus-within:text-indigo-600 transition-colors">Título del Proyecto <span className="text-red-400">*</span></label>
                <input 
                  type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="ej. Sistema de Panel Nexus" 
                  className={`h-14 w-full rounded-2xl bg-[#F8FAFC] px-6 text-sm font-medium text-slate-700 outline-none ring-1 transition-all focus:bg-white focus:ring-2 border-none ${validationErrors.has('title') ? 'ring-red-400 bg-red-50/30' : 'ring-slate-200 focus:ring-indigo-500/20'}`}
                />
              </div>
              <div className="group">
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400 group-focus-within:text-indigo-600 transition-colors">Descripción Corta <span className="text-red-400">*</span></label>
                <input 
                  type="text" value={shortDescription} onChange={e => setShortDescription(e.target.value)} placeholder="Un breve resumen de una línea sobre tu logro" 
                  className={`h-14 w-full rounded-2xl bg-[#F8FAFC] px-6 text-sm font-medium text-slate-700 outline-none ring-1 transition-all focus:bg-white focus:ring-2 border-none ${validationErrors.has('description') ? 'ring-red-400 bg-red-50/30' : 'ring-slate-200 focus:ring-indigo-500/20'}`}
                />
              </div>
              <div className="group overflow-hidden rounded-[28px] bg-[#F8FAFC] ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                <div className="flex flex-col border-b border-slate-100 bg-white sm:flex-row sm:items-center sm:justify-between px-4 py-3 gap-4">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Descripción Detallada (README.MD)</label>
                  <div className="flex items-center gap-2">
                    <div className="mr-4 flex gap-1 rounded-xl bg-slate-50 p-1">
                      <button type="button" onClick={() => setActiveTab('markdown')} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase transition-all ${activeTab === 'markdown' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><Code className="h-3 w-3" /> Markdown</button>
                      <button type="button" onClick={() => setActiveTab('preview')} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase transition-all ${activeTab === 'preview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><Eye className="h-3 w-3" /> Previsualizar</button>
                    </div>
                    <button type="button" onClick={() => txtInputRef.current?.click()} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase text-slate-600 transition hover:bg-slate-50"><FileText className="h-3 w-3" /> Cargar desde .txt</button>
                    <input ref={txtInputRef} type="file" accept=".txt" className="hidden" onChange={handleLoadTxt} />
                  </div>
                </div>
                <div className="flex items-center gap-2 border-b border-slate-100 bg-white/50 px-6 py-2">
                  <button type="button" onClick={() => applyMarkdown('**', '**')} className="p-2 text-slate-400 hover:bg-white hover:text-indigo-600 rounded-lg transition" title="Negrita"><Bold className="h-4 w-4" /></button>
                  <button type="button" onClick={() => applyMarkdown('_', '_')} className="p-2 text-slate-400 hover:bg-white hover:text-indigo-600 rounded-lg transition" title="Cursiva"><Italic className="h-4 w-4" /></button>
                  <button type="button" onClick={() => applyMarkdown('\n- ', '')} className="p-2 text-slate-400 hover:bg-white hover:text-indigo-600 rounded-lg transition" title="Lista"><List className="h-4 w-4" /></button>
                  <div className="mx-2 h-4 w-[1px] bg-slate-200"></div>
                  <button type="button" onClick={() => applyMarkdown('[', '](url)')} className="p-2 text-slate-400 hover:bg-white hover:text-indigo-600 rounded-lg transition" title="Enlace"><LinkIcon className="h-4 w-4" /></button>
                  <button type="button" onClick={() => applyMarkdown('![alt text](', ')')} className="p-2 text-slate-400 hover:bg-white hover:text-indigo-600 rounded-lg transition" title="Imagen"><ImageIcon className="h-4 w-4" /></button>
                  <button type="button" onClick={() => applyMarkdown('<video src="', '"></video>')} className="p-2 text-slate-400 hover:bg-white hover:text-indigo-600 rounded-lg transition" title="Video"><Video className="h-4 w-4" /></button>
                </div>
                <div className="relative min-h-[300px]">
                  {activeTab === 'markdown' ? (
                    <textarea id="detailed-desc" value={detailedDescription} onChange={e => setDetailedDescription(e.target.value)} placeholder="Describe los desafíos técnicos, tu solución y el impacto usando Markdown..." className="h-full min-h-[300px] w-full bg-transparent p-8 text-sm leading-relaxed text-slate-700 outline-none resize-none" />
                  ) : (
                    <div className="h-full min-h-[300px] w-full p-8 text-sm text-slate-600 prose prose-indigo">
                      {detailedDescription ? <div dangerouslySetInnerHTML={{ __html: previewHtml }} /> : <p className="italic text-slate-400">Nada que previsualizar aún...</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Code className="h-4 w-4" /></div><h2 className="text-xl font-bold text-[#334155]">Ejecución Técnica</h2></div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="group"><label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400 group-focus-within:text-indigo-600">Rol en el Proyecto</label><input type="text" value={role} onChange={e => setRole(e.target.value)} className="h-14 w-full rounded-2xl bg-[#F8FAFC] px-6 text-sm font-medium text-slate-700 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 border-none" /></div>
              <div className="group"><label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400 group-focus-within:text-indigo-600">Estado del Proyecto</label><select value={status} onChange={e => setStatus(e.target.value)} className="h-14 w-full appearance-none rounded-2xl bg-[#F8FAFC] px-6 text-sm font-medium text-slate-700 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 border-none"><option>En Producción</option><option>En Desarrollo</option><option>Completado</option><option>Pausado</option></select></div>
            </div>
            <div className="group">
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400 group-focus-within:text-indigo-600">Tecnologías Utilizadas</label>
              <div className="flex flex-wrap gap-2 rounded-[24px] bg-[#F8FAFC] p-4 ring-1 ring-slate-200 group-focus-within:ring-2 group-focus-within:ring-indigo-500/20 transition-all">
                {technologies.map(tech => (
                  <span key={tech} className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-indigo-600 shadow-sm ring-1 ring-indigo-100">{tech}<button type="button" onClick={() => setTechnologies(prev => prev.filter(t => t !== tech))} className="text-slate-300 hover:text-indigo-600 transition-colors"><X className="h-3 w-3" /></button></span>
                ))}
                <button type="button" onClick={() => techInputRef.current?.focus()} className="flex items-center gap-1.5 rounded-xl border border-dashed border-indigo-200 px-3 py-1.5 text-xs font-bold text-indigo-500 hover:bg-white">+ Añadir Tech</button>
              </div>
              <input ref={techInputRef} type="text" value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTechnology(); } }} placeholder="Escribe una tecnología y presiona enter" className="mt-3 h-12 w-full rounded-2xl bg-[#F8FAFC] px-6 text-xs font-medium text-slate-600 outline-none ring-1 ring-slate-100 border-none" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="group"><label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400 group-focus-within:text-indigo-600">Fecha de Inicio</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-14 w-full rounded-2xl bg-[#F8FAFC] px-6 text-sm font-medium text-slate-700 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 border-none" /></div>
              <div className="group"><label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400 group-focus-within:text-indigo-600">Fecha de Finalización</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-14 w-full rounded-2xl bg-[#F8FAFC] px-6 text-sm font-medium text-slate-700 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 border-none" /></div>
            </div>
          </section>

          {/* Section 3: Estructura del Repositorio */}
          <section className="space-y-6">
            <div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><FolderPlus className="h-4 w-4" /></div><h2 className="text-xl font-bold text-[#334155]">Estructura del Repositorio y Archivos</h2></div>

            <div className="grid gap-0 overflow-hidden rounded-[32px] bg-white ring-1 ring-slate-200 sm:grid-cols-[280px_1fr] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)]">
              {/* Sidebar: Folder Tree */}
              <div className="flex flex-col border-r border-slate-100 bg-[#F9FBFF] p-6">
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Explorador</span>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => setIsCreatingFolder(true)} className="p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition" title="Nueva Carpeta"><Plus className="h-4 w-4" /></button>
                    <button type="button" onClick={() => folderInputRef.current?.click()} className="p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition" title="Subir Carpeta"><FolderPlus className="h-4 w-4" /></button>
                    <input ref={folderInputRef} type="file" className="hidden" onChange={handleUploadFolder} />
                  </div>
                </div>

                <div className="flex-1 space-y-1 overflow-y-auto">
                  <TreeNode node={folderTree} />
                  {isCreatingFolder && (
                    <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-xl ring-1 ring-indigo-100">
                      <Folder className="h-4 w-4 text-indigo-600" />
                      <input autoFocus value={newFolderName} onChange={e => setNewFolderName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') createFolder(); if (e.key === 'Escape') setIsCreatingFolder(false); }} onBlur={createFolder} placeholder="Nombre..." className="w-full bg-transparent text-[11px] font-bold text-slate-700 outline-none" />
                    </div>
                  )}
                  {folders.length === 0 && !isCreatingFolder && (
                    <p className="mt-4 px-3 text-[10px] font-medium text-slate-400 italic">No hay carpetas aún.</p>
                  )}
                </div>
              </div>

              {/* Main: Files Area */}
              <div className="flex flex-col bg-white p-8">
                <div className="mb-8 flex items-center justify-between border-b border-slate-50 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50">
                      <FolderOpen className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Directorio Actual</p>
                      <p className="text-sm font-bold text-slate-700 tracking-tight">{currentFolder || 'root/'}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition">
                    <Plus className="h-4 w-4" /> Añadir Archivo
                  </button>
                  <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => handleAddFiles(e.target.files)} />
                </div>

                <div 
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={e => { e.preventDefault(); setIsDragging(false); handleAddFiles(e.dataTransfer.files); }}
                  className={`relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-[28px] border-2 border-dashed transition-all duration-300 ${isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-100 bg-slate-50/20 hover:border-indigo-300 hover:bg-[#F9FBFF]'}`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100">
                    <Upload className="h-5 w-5 text-indigo-600" />
                  </div>
                  <p className="mt-4 text-xs font-bold text-slate-500 tracking-tight">Arrastra archivos aquí o haz clic para subir</p>
                </div>

                <div className="mt-8 space-y-3">
                  {filteredFiles.length > 0 ? (
                    filteredFiles.map(f => (
                      <div key={f.id} className="group flex items-center justify-between rounded-2xl bg-[#F9FBFF]/50 p-4 ring-1 ring-slate-50 transition-all hover:bg-white hover:ring-indigo-100 hover:shadow-[0_8px_30px_-10px_rgba(79,70,229,0.1)]">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
                            {f.file.type.includes('image') ? <ImageIcon className="h-5 w-5 text-indigo-500" /> : <FileText className="h-5 w-5 text-indigo-500" />}
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-700 truncate max-w-[250px]">{f.file.name}</p>
                            <p className="text-[9px] font-medium text-slate-400">{(f.file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => removeFile(f.id)} className="p-2 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 opacity-20">
                      <Box className="h-12 w-12 text-slate-300" />
                      <p className="mt-3 text-[11px] font-bold text-slate-400">Esta carpeta no tiene archivos todavía</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="group"><label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400 group-focus-within:text-indigo-600">Repositorio de Github</label><div className="relative"><div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"><Github className="h-4 w-4" /></div><input type="text" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/..." className="h-14 w-full rounded-2xl bg-[#F8FAFC] pl-12 pr-6 text-sm font-medium text-slate-700 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 border-none" /></div></div>
              <div className="group"><label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400 group-focus-within:text-indigo-600">Enlace a Demo en Vivo</label><div className="relative"><div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"><ExternalLink className="h-4 w-4" /></div><input type="text" value={liveUrl} onChange={e => setLiveUrl(e.target.value)} placeholder="https://proyecto.dev/..." className="h-14 w-full rounded-2xl bg-[#F8FAFC] pl-12 pr-6 text-sm font-medium text-slate-700 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 border-none" /></div></div>
            </div>
          </section>

          <footer className="flex flex-col items-center justify-between gap-6 rounded-[32px] bg-slate-50 p-8 sm:flex-row">
            <div><h3 className="text-lg font-bold text-slate-800">Hacer Proyecto Público</h3><p className="mt-1 text-xs text-slate-500">Permitir que otros en la red UMSS vean este proyecto</p></div>
            <button type="button" onClick={() => setIsPublic(!isPublic)} className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all duration-300 ${isPublic ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-300'}`}><div className={`absolute h-8 w-8 rounded-full bg-white shadow-md transition-all duration-300 ${isPublic ? 'left-11' : 'left-1'}`}></div></button>
          </footer>
        </form>
      </div>
    </div>
  );
}
