import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BarChart3, Calendar, Code2, FileText, Plus, ShieldCheck } from 'lucide-react';

type ExperienceEntry = {
  id: string;
  recordType: 'Experiencia' | 'Certificación';
  badge: string;
  title: string;
  description: string;
  tone: 'brand' | 'neutral' | 'success' | 'warning' | 'info';
  icon: typeof FileText;
  footer: string;
  fileSize?: string;
};

const initialExperienceEntries: ExperienceEntry[] = [
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
  },
];

const recordTypes = ['Experiencia', 'Certificación'] as const;
const filters = ['Todos', 'Documentos', 'Certificaciones', 'Codigo', 'Reportes'] as const;

type RecordType = typeof recordTypes[number];

export function ExperienceSection() {
  const formRef = useRef<HTMLDivElement | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showAddRecordForm, setShowAddRecordForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [recordType, setRecordType] = useState<RecordType>('Experiencia');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<typeof filters[number]>('Todos');
  const [records, setRecords] = useState<ExperienceEntry[]>(initialExperienceEntries);
  const [experienceForm, setExperienceForm] = useState({
    experienceType: '',
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    description: '',
    evidence: '',
    fileSize: '',
  });
  const [certificationForm, setCertificationForm] = useState({
    name: '',
    issuer: '',
    credentialId: '',
    credentialUrl: '',
    evidence: '',
    fileSize: '',
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
      fileSize: '',
    });
    setCertificationForm({ name: '', issuer: '', credentialId: '', credentialUrl: '', evidence: '', fileSize: '' });
    setEditingRecordId(null);
    setSelectedRecordId(null);
  };

  const handleSelectRecord = (record: ExperienceEntry) => {
    if (!isEditMode) return;

    setSelectedRecordId(record.id);
    setRecordType(record.recordType);
    setShowAddRecordForm(true);
    setEditingRecordId(record.id);

    if (record.recordType === 'Experiencia') {
      setExperienceForm({
        experienceType: record.badge,
        company: record.title.replace(/.*@\s*/, ''),
        position: record.title.replace(/@\s*.*/, '').trim(),
        startDate: record.footer.includes('—') ? record.footer.split('—')[0].trim() : '',
        endDate: record.footer.includes('—') ? record.footer.split('—')[1].trim() : '',
        description: record.description,
        evidence: '',
      });
    } else {
      setCertificationForm({
        name: record.title,
        issuer: record.description,
        credentialId: '',
        credentialUrl: '',
        evidence: '',
      });
    }
  };

  const handleSave = () => {
    const newRecord: ExperienceEntry =
      recordType === 'Experiencia'
        ? {
            id: editingRecordId ?? `${Date.now()}`,
            recordType: 'Experiencia',
            badge: experienceForm.experienceType || 'EXPERIENCIA',
            title: `${experienceForm.position || 'Experiencia nueva'}${experienceForm.company ? ` @ ${experienceForm.company}` : ''}`,
            description: experienceForm.description || 'Detalles de la experiencia profesional.',
            tone: 'brand',
            icon: FileText,
            footer: experienceForm.fileSize || (experienceForm.startDate || experienceForm.endDate ? `${experienceForm.startDate} — ${experienceForm.endDate}` : 'Sin fechas'),
            fileSize: experienceForm.fileSize,
          }
        : {
            id: editingRecordId ?? `${Date.now()}`,
            recordType: 'Certificación',
            badge: certificationForm.name || 'CERTIFICACIÓN',
            title: certificationForm.name || 'Nueva certificación',
            description: certificationForm.issuer || 'Organización emisora',
            tone: 'neutral',
            icon: ShieldCheck,
            footer: certificationForm.fileSize || (certificationForm.credentialUrl || 'Sin enlace'),
            fileSize: certificationForm.fileSize,
          };

    setRecords((current) => {
      if (editingRecordId) {
        return current.map((record) => (record.id === editingRecordId ? newRecord : record));
      }
      return [newRecord, ...current];
    });

    setShowAddRecordForm(false);
    resetForm();
  };

  const handleDeleteRecord = (recordId: string) => {
    setRecords((current) => current.filter((record) => record.id !== recordId));
    if (selectedRecordId === recordId) {
      resetForm();
      setShowAddRecordForm(false);
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
        <div className="rounded-[32px] border border-[var(--umss-border)] bg-white p-6 shadow-sm">
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
                  />
                  <FormField
                    label="Empresa"
                    value={experienceForm.company}
                    onChange={(value) => setExperienceForm((current) => ({ ...current, company: value }))}
                    placeholder="Ej: Google, Amazon, Startup local"
                  />
                  <FormField
                    label="Cargo"
                    value={experienceForm.position}
                    onChange={(value) => setExperienceForm((current) => ({ ...current, position: value }))}
                    placeholder="Ej: Frontend Developer"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      label="Fecha inicio"
                      value={experienceForm.startDate}
                      inputType="date"
                      onChange={(value) => setExperienceForm((current) => ({ ...current, startDate: value }))}
                      placeholder="mm/dd/aaaa"
                    />
                    <FormField
                      label="Fecha fin"
                      value={experienceForm.endDate}
                      inputType="date"
                      onChange={(value) => setExperienceForm((current) => ({ ...current, endDate: value }))}
                      placeholder="mm/dd/aaaa"
                    />
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
                  />
                  <FormField
                    label="Organización emisora"
                    value={certificationForm.issuer}
                    onChange={(value) => setCertificationForm((current) => ({ ...current, issuer: value }))}
                    placeholder="Ej: Coursera, Google, Microsoft"
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
                </>
              )}
            </div>

            <div className="rounded-[24px] border border-[var(--umss-border)] bg-[var(--umss-surface)] p-5">
              <p className="text-sm font-semibold text-slate-900">{recordType === 'Experiencia' ? 'Evidencia de trabajo (PDF o imagen)' : 'Certificado (PDF o imagen)'}</p>
              <div className="mt-5 flex min-h-[260px] flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[var(--umss-border)] bg-white p-6 text-center text-slate-500">
                <Plus className="mb-4 h-5 w-5 text-[var(--umss-brand)]" />
                <p className="text-sm font-semibold text-slate-900">Haz clic o arrastra el archivo aquí</p>
                <p className="mt-2 text-xs text-slate-500">Formato PDF, PNG o JPG (Máx. 5MB)</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
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
              type="button"
              onClick={handleSave}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--umss-brand)] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4338CA]"
            >
              {recordType === 'Experiencia' ? 'Guardar Experiencia' : 'Guardar Certificación'}
            </button>
          </div>
        </div>
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
        {records.map((entry) => {
          const Icon = entry.icon;
          return (
            <div
              key={entry.id}
              onClick={(event) => {
                if (isEditMode && !(event.target as HTMLElement).closest('button')) {
                  handleSelectRecord(entry);
                }
              }}
              className={`group cursor-pointer rounded-[32px] border bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.18)] transition hover:-translate-y-1 ${
                isEditMode && selectedRecordId === entry.id ? 'border-[rgb(80,72,229)] ring-2 ring-[rgba(80,72,229,0.16)]' : 'border-[var(--umss-border)]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-[var(--umss-surface)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {entry.badge}
                </span>
                <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--umss-border)] text-[var(--umss-brand)]">
                  {isEditMode ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteRecord(entry.id);
                      }}
                      className="absolute right-[-8px] top-[-8px] inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:bg-red-600 hover:text-white"
                      aria-label="Eliminar registro"
                    >
                      ×
                    </button>
                  ) : null}
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <h3 className="mt-6 text-lg font-semibold tracking-tight text-slate-900">{entry.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{entry.description}</p>

              <div className="mt-6 overflow-hidden rounded-[24px] border border-[var(--umss-border)] bg-[var(--umss-surface)] p-5 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">{entry.fileSize || entry.footer}</p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-[rgb(80,72,229)] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4338CA]"
                >
                  Ver documento
                </button>
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--umss-border)] bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[var(--umss-brand)] hover:text-[var(--umss-brand)]"
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputType?: string;
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
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-2xl border border-[var(--umss-border)] bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-[var(--umss-brand)] focus:outline-none ${
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
