import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BarChart3, Calendar, Code2, FileText, Plus, ShieldCheck } from 'lucide-react';
import type { ExperienceRecord } from '@features/dashboard/utils/developerDashboardMappers';
import { saveExperience, saveFormation, deleteExperience, deleteFormation } from '@features/dashboard/api/developerDashboard';

const initialExperienceEntries: ExperienceRecord[] = [
  {
    id: 'cloudscale',
    recordType: 'Experiencia',
    badge: 'SYSTEM ARCHITECTURE',
    title: 'CloudScale ERP Blueprint',
    description:
      'Full technical documentation of the microservices orchestration using Kubernetes and gRPC protocols.',
    tone: 'brand',
    icon: FileText,
    footer: '4.2 MB',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
  },
  {
    id: 'aws',
    recordType: 'Certificación',
    badge: 'CERTIFICATION',
    title: 'AWS Solutions Architect',
    description:
      'Professional certification validating expertise in designing distributed systems on AWS platforms.',
    tone: 'neutral',
    icon: ShieldCheck,
    footer: 'Verified Credential',
    startDate: '2022-06-01',
  },
  {
    id: 'rust',
    recordType: 'Experiencia',
    badge: 'SOURCE CODE',
    title: 'Neural-Net Core Framework',
    description:
      'Proprietary logic for edge-computing inference engines written in high-performance Rust.',
    tone: 'success',
    icon: Code2,
    footer: 'Production Ready',
    startDate: '2021-01-01',
    endDate: '2022-01-01',
  },
  {
    id: 'audit',
    recordType: 'Experiencia',
    badge: 'QA REPORT',
    title: 'Security Audit - Fintech Module',
    description:
      'Comprehensive vulnerability assessment and penetration test results for the payment gateway.',
    tone: 'warning',
    icon: BarChart3,
    footer: 'Low Risk',
    startDate: '2020-03-01',
    endDate: '2020-05-01',
  },
  {
    id: 'behavioral',
    recordType: 'Experiencia',
    badge: 'R&D INSIGHT',
    title: 'Behavioral Pattern Analysis',
    description:
      'Evidence based research on user interaction models for next-gen accessibility interfaces.',
    tone: 'info',
    icon: ArrowRight,
    footer: 'Research Summary',
    startDate: '2019-10-01',
    endDate: '2020-02-01',
  },
];

const recordTypes = ['Experiencia', 'Certificación'] as const;
const filters = ['Todos', 'Documentos', 'Certificaciones', 'Codigo', 'Reportes'] as const;

type RecordType = typeof recordTypes[number];

function calculateYearsInUI(start: string, end: string | null | undefined): string {
  if (!start) return '';
  // Formato dd/mm/yyyy a objeto Date
  const parts = start.split('/');
  if (parts.length !== 3) return '';
  const startDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  if (isNaN(startDate.getTime())) return '';
  
  const endParts = end ? end.split('/') : null;
  const endDate = endParts && endParts.length === 3 
    ? new Date(`${endParts[2]}-${endParts[1]}-${endParts[0]}`) 
    : new Date();
    
  if (isNaN(endDate.getTime())) return '';

  let years = endDate.getFullYear() - startDate.getFullYear();
  const m = endDate.getMonth() - startDate.getMonth();
  if (m < 0 || (m === 0 && endDate.getDate() < startDate.getDate())) {
    years--;
  }
  
  if (years < 0) return '';
  return years === 1 ? '1 año' : (years > 1 ? `${years} años` : '< 1 año');
}

export function ExperienceSection({
  initialFromServer,
  onDataDirty,
}: {
  initialFromServer?: ExperienceRecord[];
  onDataDirty?: () => void;
}) {
  const formRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showAddRecordForm, setShowAddRecordForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [recordType, setRecordType] = useState<RecordType>('Experiencia');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<typeof filters[number]>('Todos');
  const [records, setRecords] = useState<ExperienceRecord[]>(() =>
    initialFromServer === undefined ? initialExperienceEntries : initialFromServer
  );
  
  useEffect(() => {
    if (initialFromServer) {
      setRecords(initialFromServer);
    }
  }, [initialFromServer]);
  const [experienceForm, setExperienceForm] = useState({
    experienceType: '',
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    description: '',
    evidence: '',
    evidenceUrl: '',
    evidenceFile: null as File | null,
    fileSize: '',
    isCurrent: false,
  });
  const [certificationForm, setCertificationForm] = useState({
    name: '',
    issuer: '',
    credentialId: '',
    credentialUrl: '',
    evidence: '',
    evidenceUrl: '',
    evidenceFile: null as File | null,
    fileSize: '',
    isCurrent: false,
  });

  useEffect(() => {
    if (showAddRecordForm) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showAddRecordForm]);

  const resetForm = () => {
    setExperienceForm({
      experienceType: '',
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      evidence: '',
      evidenceUrl: '',
      evidenceFile: null,
      fileSize: '',
      isCurrent: false,
    });
    setCertificationForm({ name: '', issuer: '', credentialId: '', credentialUrl: '', evidence: '', evidenceUrl: '', evidenceFile: null, fileSize: '', isCurrent: false });
    setEditingRecordId(null);
    setSelectedRecordId(null);
  };

  const handleSelectRecord = (record: ExperienceRecord) => {
    if (!isEditMode) return;

    setSelectedRecordId(record.id);
    setRecordType(record.recordType);
    setShowAddRecordForm(true);
    setEditingRecordId(record.id);

    if (record.recordType === 'Experiencia') {
      const title = record.title || '';
      setExperienceForm({
        experienceType: record.badge || 'EXPERIENCIA',
        company: record.company || (title.includes('@') ? title.split('@')[1]?.trim() : '') || '',
        position: record.position || (title.includes('@') ? title.split('@')[0]?.trim() : title) || '',
        startDate: record.startDate && typeof record.startDate === 'string' && record.startDate.includes('-') 
          ? record.startDate.split('-').reverse().join('/') 
          : '',
        endDate: record.endDate && typeof record.endDate === 'string' && record.endDate.includes('-') 
          ? record.endDate.split('-').reverse().join('/') 
          : '',
        description: record.description || '',
        evidence: '',
        evidenceUrl: record.evidenceUrl || '',
        evidenceFile: null,
        fileSize: record.fileSize || '',
        isCurrent: Boolean(record.isCurrent),
      });
    } else {
      const title = record.title || '';
      setCertificationForm({
        name: record.position || title,
        issuer: record.company || record.description || '',
        credentialId: '',
        credentialUrl: '',
        evidence: '',
        evidenceUrl: record.evidenceUrl || '',
        evidenceFile: null,
        fileSize: record.fileSize || '',
        isCurrent: Boolean(record.isCurrent),
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = (file: File) => {
    if (!['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      alert('Formato no soportado. Por favor sube un PDF, PNG o JPG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máx. 5MB.');
      return;
    }
    
    const sizeStr = formatFileSize(file.size);
    const fileName = file.name;
    const url = URL.createObjectURL(file);

    if (recordType === 'Experiencia') {
      setExperienceForm((curr) => ({ ...curr, evidence: fileName, evidenceUrl: url, evidenceFile: file, fileSize: sizeStr }));
    } else {
      setCertificationForm((curr) => ({ ...curr, evidence: fileName, evidenceUrl: url, evidenceFile: file, fileSize: sizeStr }));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (recordType === 'Experiencia') {
        const bdDateFrom = experienceForm.startDate ? experienceForm.startDate.split('/').reverse().join('-') : new Date().toISOString().split('T')[0];
        const bdDateTo = experienceForm.endDate ? experienceForm.endDate.split('/').reverse().join('-') : null;

        const formData = new FormData();
        formData.append('titulo_puesto', experienceForm.position || 'Experiencia nueva');
        formData.append('nombre_empresa', experienceForm.company || 'Sin Empresa');
        formData.append('descripcion_puesto', experienceForm.description);
        formData.append('fecha_inicio', bdDateFrom);
        formData.append('es_trabajo_actual', experienceForm.isCurrent ? '1' : '0');
        formData.append('tipo_experiencia', experienceForm.experienceType);
        
        // CORRECCIÓN: Solo enviar fecha_fin si existe y NO es el trabajo actual
        if (!experienceForm.isCurrent && bdDateTo) {
          formData.append('fecha_fin', bdDateTo);
        }

        if (experienceForm.evidenceFile) {
          formData.append('archivo', experienceForm.evidenceFile);
        }

        // Si estamos editando un registro guardado (db-exp-...), enviamos su ID
        if (editingRecordId && editingRecordId.startsWith('db-exp-')) {
          const rawId = editingRecordId.replace('db-exp-', '');
          formData.append('id_experiencia', rawId);
        }

        const res = await saveExperience(formData);

        const newRecord: ExperienceRecord = {
          id: `db-exp-${res.id}`, // MANTENER PREFIJO PARA EVITAR DUPLICADOS
          recordType: 'Experiencia',
          badge: experienceForm.experienceType || 'EXPERIENCIA',
          title: `${experienceForm.position || 'Experiencia nueva'}${experienceForm.company ? ` @ ${experienceForm.company}` : ''}`,
          description: experienceForm.description || 'Detalles de la experiencia profesional.',
          tone: 'brand',
          icon: FileText,
          footer: experienceForm.fileSize || (experienceForm.isCurrent ? 'Actualidad' : (experienceForm.startDate || experienceForm.endDate ? `${experienceForm.startDate} — ${experienceForm.endDate}` : 'Sin fechas')),
          fileSize: experienceForm.fileSize,
          evidenceUrl: experienceForm.evidenceUrl || (experienceForm.evidenceFile ? '/api/developer/files/experiencia/' + res.id : undefined),
          isCurrent: experienceForm.isCurrent,
          durationYears: experienceForm.isCurrent ? '' : calculateYearsInUI(experienceForm.startDate, experienceForm.endDate),
          position: experienceForm.position,
          company: experienceForm.company,
          startDate: bdDateFrom,
          endDate: bdDateTo || undefined,
        };

        setRecords((current) => {
          if (editingRecordId) return current.map((record) => (record.id === editingRecordId ? newRecord : record));
          return [newRecord, ...current];
        });

      } else {
        const bdDateFrom = new Date().toISOString().split('T')[0];
        
        const formData = new FormData();
        formData.append('institucion', certificationForm.issuer || 'Institucion');
        formData.append('carrera_especialidad', certificationForm.name || 'Certificacion nueva');
        formData.append('fecha_inicio', bdDateFrom);
        formData.append('actualmente_estudiante', certificationForm.isCurrent ? '1' : '0');
        formData.append('tipo_formacion', certificationForm.name);

        if (certificationForm.evidenceFile) {
          formData.append('archivo', certificationForm.evidenceFile);
        }

        // Si estamos editando un registro guardado (db-form-...), enviamos su ID
        if (editingRecordId && editingRecordId.startsWith('db-form-')) {
          const rawId = editingRecordId.replace('db-form-', '');
          formData.append('id_formacion', rawId);
        }

        const res = await saveFormation(formData);

        const newRecord: ExperienceRecord = {
          id: `db-form-${res.id}`, // MANTENER PREFIJO
          recordType: 'Certificación',
          badge: certificationForm.name || 'CERTIFICACIÓN',
          title: certificationForm.name || 'Nueva certificación',
          description: certificationForm.issuer || 'Organización emisora',
          tone: 'neutral',
          icon: ShieldCheck,
          footer: certificationForm.fileSize || (certificationForm.credentialUrl || 'Sin enlace'),
          fileSize: certificationForm.fileSize,
          evidenceUrl: certificationForm.evidenceUrl || (certificationForm.evidenceFile ? '/api/developer/files/formacion/' + res.id : undefined),
          isCurrent: certificationForm.isCurrent,
          position: certificationForm.name,
          company: certificationForm.issuer,
          startDate: bdDateFrom,
          endDate: undefined,
        };

        setRecords((current) => {
          if (editingRecordId) return current.map((record) => (record.id === editingRecordId ? newRecord : record));
          return [newRecord, ...current];
        });
      }

      setShowAddRecordForm(false);
      resetForm();
      if (onDataDirty) onDataDirty();
    } catch (e: any) {
      alert(e.message || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecord = async (recordId: string, type: 'Experiencia' | 'Certificación') => {
    try {
      const isDbRecord = recordId.startsWith('db-');
      const rawId = recordId.replace('db-exp-', '').replace('db-form-', '');
      
      if (isDbRecord) {
        if (type === 'Experiencia') {
          await deleteExperience(rawId);
        } else {
          await deleteFormation(rawId);
        }
      }
      setRecords((current) => current.filter((record) => record.id !== recordId));
      if (selectedRecordId === recordId) {
        resetForm();
        setShowAddRecordForm(false);
      }
      if (editingRecordId === recordId) {
        setEditingRecordId(null);
      }
      if (onDataDirty) onDataDirty();
    } catch (e: any) {
      alert(e.message || 'Error al eliminar registro');
    }
  };

  const handleToggleEditMode = () => {
    setIsEditMode((current) => {
      const nextMode = !current;
      if (current && showAddRecordForm) {
        setShowAddRecordForm(false);
        resetForm();
      }
      if (!nextMode) {
        setSelectedRecordId(null);
        setEditingRecordId(null);
      }
      return nextMode;
    });
  };

  const currentEvidence = recordType === 'Experiencia' ? experienceForm.evidence : certificationForm.evidence;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 inline-flex rounded-full bg-[rgba(99,102,241,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--umss-brand)]">
            ARCHIVO
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Experiencia y Certificaciones</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Registros verificados de sus logros técnicos, arquitecturas de sistemas y credenciales profesionales.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAddRecordForm((state) => !state)}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--umss-brand)] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4338CA]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Subir
          </button>
          <button
            type="button"
            onClick={handleToggleEditMode}
            className={`inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-semibold shadow-sm transition ${
              isEditMode
                ? 'border border-red-600 bg-red-600 text-white hover:bg-red-700'
                : 'border border-[var(--umss-border)] bg-white text-slate-700 hover:border-[var(--umss-brand)] hover:text-[var(--umss-brand)]'
            }`}
          >
            {isEditMode ? 'Salir edición' : 'Editar'}
          </button>
          <button
            type="button"
            onClick={() => setShowFilterPanel((state) => !state)}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--umss-border)] bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[var(--umss-brand)] hover:text-[var(--umss-brand)]"
          >
            Filtrar
          </button>
        </div>
      </div>

      {showAddRecordForm ? (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="rounded-[32px] border border-[var(--umss-border)] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap gap-3 rounded-[24px] bg-[var(--umss-surface)] p-2">
            {recordTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setRecordType(type)}
                className={`rounded-[20px] px-5 py-3 text-sm font-semibold transition ${
                  recordType === type
                    ? 'bg-[var(--umss-brand)] text-white shadow-sm'
                    : 'bg-white text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:border-[var(--umss-brand)] hover:text-[var(--umss-brand)]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div ref={formRef} className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              {recordType === 'Experiencia' ? (
                <>
                  <FormField
                    label="Tipo Experiencia"
                    value={experienceForm.experienceType}
                    onChange={(value) => setExperienceForm((current) => ({ ...current, experienceType: value }))}
                    placeholder="Ej: SYSTEM ARCHITECTURE, QA REPORT"
                    required
                  />
                  <FormField
                    label="Empresa"
                    value={experienceForm.company}
                    onChange={(value) => setExperienceForm((current) => ({ ...current, company: value }))}
                    placeholder="Ej: Google, Amazon, Startup local"
                    required
                  />
                  <FormField
                    label="Cargo"
                    value={experienceForm.position}
                    onChange={(value) => setExperienceForm((current) => ({ ...current, position: value }))}
                    placeholder="Ej: Frontend Developer"
                    required
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      label="Fecha inicio"
                      value={experienceForm.startDate}
                      inputType="date"
                      onChange={(value) => setExperienceForm((current) => ({ ...current, startDate: value }))}
                      placeholder="mm/dd/aaaa"
                      required
                    />
                    <FormField
                      label="Fecha fin"
                      value={experienceForm.endDate}
                      inputType="date"
                      onChange={(value) => setExperienceForm((current) => ({ ...current, endDate: value }))}
                      placeholder="mm/dd/aaaa"
                      disabled={experienceForm.isCurrent}
                    />
                  </div>
                  <div className="flex items-center gap-2 px-1">
                    <input
                      id="is-current-job"
                      type="checkbox"
                      checked={experienceForm.isCurrent}
                      onChange={(e) => setExperienceForm(curr => ({ ...curr, isCurrent: e.target.checked, endDate: e.target.checked ? '' : curr.endDate }))}
                      className="h-4 w-4 rounded border-[var(--umss-border)] text-[var(--umss-brand)] focus:ring-[var(--umss-brand)]"
                    />
                    <label htmlFor="is-current-job" className="text-sm font-medium text-slate-700">
                      Trabajo actual
                    </label>
                  </div>
                  <TextareaField
                    label="Descripción"
                    value={experienceForm.description}
                    onChange={(value) => setExperienceForm((current) => ({ ...current, description: value }))}
                    placeholder="Resume tus responsabilidades y logros..."
                  />
                </>
              ) : (
                <>
                  <FormField
                    label="Nombre de la certificación"
                    value={certificationForm.name}
                    onChange={(value) => setCertificationForm((current) => ({ ...current, name: value }))}
                    placeholder="Ej: Meta Front-End Developer"
                    required
                  />
                  <FormField
                    label="Organización emisora"
                    value={certificationForm.issuer}
                    onChange={(value) => setCertificationForm((current) => ({ ...current, issuer: value }))}
                    placeholder="Ej: Coursera, Google, Microsoft"
                    required
                  />
                  <FormField
                    label="ID de credencial"
                    value={certificationForm.credentialId}
                    onChange={(value) => setCertificationForm((current) => ({ ...current, credentialId: value }))}
                    placeholder="Ej: AB1234CD5678"
                  />
                  <FormField
                    label="URL de la credencial"
                    value={certificationForm.credentialUrl}
                    onChange={(value) => setCertificationForm((current) => ({ ...current, credentialUrl: value }))}
                    placeholder="https://coursera.org/verify/..."
                  />
                  <div className="flex items-center gap-2 px-1">
                    <input
                      id="is-current-student"
                      type="checkbox"
                      checked={certificationForm.isCurrent}
                      onChange={(e) => setCertificationForm(curr => ({ ...curr, isCurrent: e.target.checked }))}
                      className="h-4 w-4 rounded border-[var(--umss-border)] text-[var(--umss-brand)] focus:ring-[var(--umss-brand)]"
                    />
                    <label htmlFor="is-current-student" className="text-sm font-medium text-slate-700">
                      Actualmente estudiante / Activo
                    </label>
                  </div>
                </>
              )}
            </div>

            <div className="rounded-[24px] border border-[var(--umss-border)] bg-[var(--umss-surface)] p-5">
              <p className="text-sm font-semibold text-slate-900">{recordType === 'Experiencia' ? 'Evidencia de trabajo (PDF o imagen)' : 'Certificado (PDF o imagen)'}</p>
              <div 
                className={`mt-5 flex min-h-[260px] flex-col items-center justify-center rounded-[24px] border-2 border-dashed transition-colors cursor-pointer ${
                  isDragging ? 'border-[var(--umss-brand)] bg-[rgba(79,70,229,0.04)]' : 'border-[var(--umss-border)] bg-white hover:border-[var(--umss-brand)] hover:bg-[rgba(79,70,229,0.02)]'
                } p-6 text-center text-slate-500`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="application/pdf,image/png,image/jpeg,image/jpg"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileUpload(e.target.files[0]);
                      e.target.value = ''; // clear input
                    }
                  }}
                />
                {currentEvidence ? (
                  <>
                    <FileText className="mb-4 h-8 w-8 text-[var(--umss-brand)]" />
                    <p className="text-sm font-semibold text-slate-900 line-clamp-2 max-w-full">{currentEvidence}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      Archivo cargado con éxito ({recordType === 'Experiencia' ? experienceForm.fileSize : certificationForm.fileSize})
                    </p>
                    <button
                      type="button"
                      className="mt-4 inline-flex items-center text-xs font-semibold text-[var(--umss-brand)] hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (recordType === 'Experiencia') {
                          setExperienceForm(curr => ({ ...curr, evidence: '', evidenceUrl: '', evidenceFile: null, fileSize: '' }));
                        } else {
                          setCertificationForm(curr => ({ ...curr, evidence: '', evidenceUrl: '', evidenceFile: null, fileSize: '' }));
                        }
                      }}
                    >
                      Remover archivo
                    </button>
                  </>
                ) : (
                  <>
                    <Plus className="mb-4 h-5 w-5 text-[var(--umss-brand)]" />
                    <p className="text-sm font-semibold text-slate-900">Haz clic o arrastra el archivo aquí</p>
                    <p className="mt-2 text-xs text-slate-500">Formato PDF, PNG o JPG (Máx. 5MB)</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            {editingRecordId ? (
              <button
                type="button"
                onClick={() => handleDeleteRecord(editingRecordId, recordType)}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 text-sm font-semibold text-red-600 transition hover:bg-red-100 mr-auto"
              >
                Eliminar {recordType === 'Experiencia' ? 'Experiencia' : 'Certificación'}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setShowAddRecordForm(false);
                resetForm();
              }}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--umss-border)] bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-[var(--umss-surface)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`inline-flex h-11 items-center justify-center rounded-2xl px-6 text-sm font-semibold shadow-sm transition ${isSaving ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[var(--umss-brand)] text-white hover:bg-[#4338CA]'}`}
            >
              {isSaving ? 'Guardando...' : (recordType === 'Experiencia' ? 'Guardar Experiencia' : 'Guardar Certificación')}
            </button>
          </div>
        </form>
      ) : null}

      {showFilterPanel ? (
        <div className="rounded-[28px] border border-[var(--umss-border)] bg-[var(--umss-surface)] p-5 shadow-sm">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div>
                <label className="block text-sm font-semibold text-slate-900">Buscar</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Buscar experiencia..."
                  className="mt-2 w-full rounded-2xl border border-[var(--umss-border)] bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-[var(--umss-brand)] focus:outline-none"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--umss-brand)] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4338CA]"
                >
                  Buscar
                </button>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Filtros rápidos</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      activeFilter === filter
                        ? 'border-[var(--umss-brand)] bg-[var(--umss-brand)] text-white'
                        : 'border-[var(--umss-border)] bg-white text-slate-700 hover:border-[var(--umss-brand)] hover:text-[var(--umss-brand)]'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3">
        {records
          .filter((entry) => {
            if (!entry) return false;
            // Filtro por texto
            const q = (searchQuery || '').toLowerCase();
            const title = (entry.title || '').toLowerCase();
            const desc = (entry.description || '').toLowerCase();
            const badge = (entry.badge || '').toLowerCase();
            const footer = (entry.footer || '').toLowerCase();
            const type = (entry.recordType || '').toLowerCase();

            const matchesSearch =
              !q ||
              title.includes(q) ||
              desc.includes(q) ||
              badge.includes(q) ||
              footer.includes(q) ||
              type.includes(q);

            // Filtro por categoría
            const matchesFilter =
              activeFilter === 'Todos' ||
              (activeFilter === 'Documentos' && entry.recordType === 'Experiencia') ||
              (activeFilter === 'Certificaciones' && entry.recordType === 'Certificación') ||
              (activeFilter === 'Codigo' && entry.badge.toLowerCase().includes('code')) ||
              (activeFilter === 'Reportes' && (entry.badge.toLowerCase().includes('report') || entry.badge.toLowerCase().includes('qa')));

            return matchesSearch && matchesFilter;
          })
          .map((entry) => {
          const Icon = entry.icon;
          return (
            <div
              key={entry.id}
              id={`experience-${entry.id}`}
              onClick={(event) => {
                if (isEditMode && !(event.target as HTMLElement).closest('button')) {
                  handleSelectRecord(entry);
                }
              }}
              className={`group cursor-pointer rounded-[32px] border bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.18)] transition hover:-translate-y-1 ${
                isEditMode && selectedRecordId === entry.id ? 'border-[rgb(80,72,229)] ring-2 ring-[rgba(80,72,229,0.16)]' : 'border-[var(--umss-border)]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-2">
                  <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] border ${
                    entry.recordType === 'Experiencia' 
                      ? 'bg-indigo-50 border-indigo-100 text-indigo-600' 
                      : 'bg-purple-50 border-purple-100 text-purple-600'
                  }`}>
                    {entry.recordType === 'Experiencia' ? 'TIPO EXP' : 'TIPO CERT'}: {entry.badge}
                  </span>
                  {entry.durationYears && entry.recordType === 'Experiencia' && (
                    <span className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600 border border-emerald-100 italic">
                      {entry.durationYears} totales
                    </span>
                  )}
                </div>
                <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--umss-surface)] text-[var(--umss-brand)] border border-[var(--umss-border)] shadow-sm">
                  {isEditMode ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteRecord(entry.id, entry.recordType);
                      }}
                      className="absolute right-[-8px] top-[-8px] inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-400 shadow-md transition hover:bg-red-600 hover:text-white border border-slate-100"
                      aria-label="Eliminar registro"
                    >
                      ×
                    </button>
                  ) : null}
                  {Icon ? <Icon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                    {entry.recordType === 'Experiencia' ? 'ROL' : 'CERTIFICACIÓN'}
                  </p>
                  <h3 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
                    {entry.position || ((entry.title || '').includes('@') ? entry.title.split('@')[0].trim() : entry.title)}
                  </h3>
                </div>
                
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                    {entry.recordType === 'Experiencia' ? 'EMPRESA' : 'INSTITUCIÓN'}
                  </p>
                  <p className={`text-sm font-semibold ${entry.recordType === 'Experiencia' ? 'text-indigo-600' : 'text-purple-600'}`}>
                    {entry.company || ((entry.title || '').includes('@') ? entry.title.split('@')[1].trim() : 'N/A')}
                  </p>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">DESCRIPCIÓN</p>
                  <p className="text-xs leading-relaxed text-slate-500 line-clamp-3">
                    {entry.description || 'Sin descripción detallada.'}
                  </p>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-[20px] border border-[var(--umss-border)] bg-[var(--umss-surface)] p-4">
                <div className="flex items-center gap-3 text-slate-600">
                  <Calendar className="h-4 w-4 opacity-50" />
                  <p className="text-[11px] font-bold">
                    {entry.footer.includes('Actualidad') ? entry.footer.replace('Actualidad', ' — ACTUALIDAD') : (entry.fileSize || entry.footer)}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (entry.evidenceUrl) {
                      window.open(entry.evidenceUrl, '_blank');
                    } else {
                      alert('No hay documento adjunto para este registro.');
                    }
                  }}
                  className={`inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold shadow-sm transition ${
                    entry.evidenceUrl
                      ? 'bg-[rgb(80,72,229)] text-white hover:bg-[#4338CA]'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                  disabled={!entry.evidenceUrl}
                >
                  Ver documento
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (entry.evidenceUrl) {
                      const a = document.createElement('a');
                      a.href = entry.evidenceUrl;
                      a.download = entry.title || 'documento';
                      a.click();
                    } else {
                      alert('No hay documento adjunto para este registro.');
                    }
                  }}
                  className={`inline-flex h-11 items-center justify-center rounded-2xl border px-4 text-sm font-semibold shadow-sm transition ${
                    entry.evidenceUrl 
                      ? 'border-[var(--umss-border)] bg-white text-slate-700 hover:border-[var(--umss-brand)] hover:text-[var(--umss-brand)]'
                      : 'border-transparent bg-slate-50 text-slate-400 cursor-not-allowed'
                  }`}
                  disabled={!entry.evidenceUrl}
                >
                  Descargar
                </button>
              </div>
            </div>
          );
        })}

        <div className="flex min-h-[320px] items-center justify-center rounded-[32px] border border-dashed border-[var(--umss-border)] bg-[rgba(79,70,229,0.04)] text-center text-slate-500 transition hover:border-[var(--umss-brand)] hover:bg-[rgba(79,70,229,0.08)]">
          <button
            type="button"
            onClick={() => setShowAddRecordForm(true)}
            className="inline-flex flex-col items-center gap-3 text-sm font-semibold text-[var(--umss-brand)]"
          >
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
              <Plus className="h-6 w-6" />
            </span>
            Subir Nuevo
            <span className="text-xs text-slate-500">PDF, PNG, JPG o ZIP files. Max size 50MB.</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  inputType = 'text',
  required = false,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputType?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hiddenDateRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    if (hiddenDateRef.current) {
      // Use hidden date input to trigger calendar
      if (hiddenDateRef.current.showPicker) {
        hiddenDateRef.current.showPicker();
      } else {
        hiddenDateRef.current.focus();
        hiddenDateRef.current.click();
      }
    }
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = event.target.value;
    if (dateValue) {
      // Convert from yyyy-mm-dd to dd/mm/yyyy
      const [year, month, day] = dateValue.split('-');
      const formattedDate = `${day}/${month}/${year}`;
      onChange(formattedDate);
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-900">{label}</label>
      <div className="relative mt-3">
        <input
          ref={inputRef}
          type="text"
          value={value || ''}
          required={required}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder || ''}
          className={`w-full rounded-2xl border border-[var(--umss-border)] bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-[var(--umss-brand)] focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 ${
            inputType === 'date'
              ? 'date-input-custom pr-10'
              : ''
          }`}
        />
        {inputType === 'date' && (
          <>
            <button
              type="button"
              onClick={handleIconClick}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[var(--umss-surface)] transition-colors"
            >
              <Calendar className="h-4 w-4 text-[var(--umss-brand)] opacity-70 hover:opacity-100 transition-all" />
            </button>
            {/* Hidden date input for calendar functionality */}
            <input
              ref={hiddenDateRef}
              type="date"
              onChange={handleDateChange}
              className="absolute opacity-0 pointer-events-none"
              style={{ width: '1px', height: '1px' }}
            />
          </>
        )}
      </div>
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-900">{label}</label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-3 min-h-[140px] w-full resize-none rounded-[24px] border border-[var(--umss-border)] bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-[var(--umss-brand)] focus:outline-none"
      />
    </div>
  );
}
