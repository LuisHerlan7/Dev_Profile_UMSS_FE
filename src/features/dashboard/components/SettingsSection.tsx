import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, Lock, Pencil, Trash2, X, Plus, Upload, ImageIcon } from 'lucide-react';
import { DashboardCard } from '@shared/components/dashboard/DashboardCard';
import { SectionHeading } from './SectionHeading';
import { updateAvatar, updateProfile } from '@features/dashboard/api/developerDashboard';
import type {
  SettingsProfileState,
  VisibilityHighlightsState,
} from '@features/dashboard/utils/developerDashboardMappers';

const initialProfile = {
  firstName: 'Alex',
  lastName: 'Rivera',
  maternalLastName: 'Terceros',
  role: 'Full Stack Developer',
  bio:
    'Desarrollador Full Stack apasionado con más de 5 años de experiencia en la creación de aplicaciones web escalables. Me especializo en React, Node.js y arquitectura en la nube. Mi objetivo es conectar backends de alto rendimiento con experiencias de usuario excepcionales.',
  github: 'https://github.com/arivera',
  linkedin: 'https://linkedin.com/in/alexrivera-dev',
  website: 'https://alexrivera.io',
  phone: '+591 700 00000',
  email: 'raulito@gmail.com',
  password: '**********',
  newPassword: '',
};

const initialHighlights = {
  projects: [
    'Digital Curator Platform',
    'Cloud Scale Infrastructure',
    'AI Portfolio Analyzer',
  ],
  skills: ['React & Next.js', 'TypeScript Expert', 'Node.js / Express'],
  trajectory: ['Senior Developer @ Tech Corp', 'Lead Eng @ Startup X', 'MS Computer Science'],
};

export function SettingsSection({
  serverProfile,
  serverHighlights,
  onDataDirty,
  onLocalUpdate,
  pendingAvatarFile,
  setPendingAvatarFile,
}: {
  serverProfile?: SettingsProfileState;
  serverHighlights?: VisibilityHighlightsState;
  onDataDirty?: () => void;
  onLocalUpdate?: (updates: Partial<SettingsProfileState>) => void;
  pendingAvatarFile?: File | null;
  setPendingAvatarFile?: (file: File | null) => void;
}) {
  const [profile, setProfile] = useState(serverProfile || initialProfile);
  const [highlights, setHighlights] = useState(initialHighlights);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showQuickAlert, setShowQuickAlert] = useState(true);
  const [addingSection, setAddingSection] = useState<keyof typeof highlights | null>(null);
  const [newItemText, setNewItemText] = useState('');
  
  // Ref para rastrear el avatar original del servidor y detectar cambios reales
  const originalServerAvatar = useRef<string | null>(serverProfile?.avatar || null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(serverProfile?.avatar || null);
  
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (field: keyof typeof profile, value: string) => {
    const newProfile = { ...profile, [field]: value };
    setProfile(newProfile);
    if (onLocalUpdate) {
      onLocalUpdate({ [field]: value });
    }
  };

  const removeHighlight = (section: keyof typeof highlights, index: number) => {
    setHighlights((current) => ({
      ...current,
      [section]: current[section].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const addHighlight = (section: keyof typeof highlights) => {
    if (newItemText.trim()) {
      setHighlights((current) => ({
        ...current,
        [section]: [...current[section], newItemText.trim()],
      }));
      setNewItemText('');
      setAddingSection(null);
    }
  };

  const startAdding = (section: keyof typeof highlights) => {
    setAddingSection(section);
    setNewItemText('');
  };

  const cancelAdding = () => {
    setAddingSection(null);
    setNewItemText('');
  };

  const handleChangePassword = () => {
    setShowPasswordFields(true);
  };

  useEffect(() => {
    if (serverProfile && !isSaving) {
      setProfile((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(serverProfile)) return prev;
        return { ...prev, ...serverProfile };
      });
      
      // Solo actualizamos avatarUrl si NO hay un archivo pendiente (cambio local)
      if (!pendingAvatarFile) {
        setAvatarUrl(serverProfile.avatar || null);
        originalServerAvatar.current = serverProfile.avatar || null;
      }
    }
  }, [serverProfile, isSaving, pendingAvatarFile]);

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      let avatarUpdated = false;
      let profileUpdated = false;

      // 1. Guardar Avatar si ha cambiado
      // Cambió si hay archivo nuevo O si el actual es null pero el original no lo era
      const hasRemovedAvatar = avatarUrl === null && originalServerAvatar.current !== null;
      
      if (pendingAvatarFile !== null || hasRemovedAvatar) {
        const fd = new FormData();
        if (pendingAvatarFile) {
          fd.append('avatar', pendingAvatarFile);
        } else {
          fd.append('remove_avatar', '1');
        }
        
        const res = await updateAvatar(fd);
        const newAvatarUrl = res.url || null;
        
        if (onLocalUpdate) {
          onLocalUpdate({ avatar: newAvatarUrl });
        }
        setAvatarUrl(newAvatarUrl);
        originalServerAvatar.current = newAvatarUrl;
        
        if (setPendingAvatarFile) {
          setPendingAvatarFile(null);
        }
        avatarUpdated = true;
      }

      // 2. Guardar resto del perfil
      const profilePayload = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        maternalLastName: profile.maternalLastName,
        role: profile.role,
        bio: profile.bio,
      };

      await updateProfile(profilePayload);
      profileUpdated = true;
      
      if (avatarUpdated || profileUpdated) {
        if (onDataDirty) onDataDirty();
      }
      
      alert('Configuración guardada correctamente.');
    } catch (e: any) {
      alert(e.message || 'Error al guardar configuración.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Configuracion"
        title="Editar Perfil Profesional"
        description="Actualiza tu identidad en la red de curadores digitales. Estos datos serán visibles para posibles colaboradores y empleadores."
      />

      <div className="space-y-6">
        <DashboardCard title="Editar Perfil Profesional" className="relative overflow-visible">
          {showQuickAlert ? (
            <div className="absolute right-6 top-6 z-20 w-[320px] rounded-[24px] border border-[var(--umss-border)] bg-white p-5 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.18)]">
              <div className="flex items-center justify-between gap-4">
                <p className="text-base font-semibold text-slate-900">Consejos Rápidos</p>
                <button
                  type="button"
                  onClick={() => setShowQuickAlert(false)}
                  className="rounded-full p-2 text-slate-500 transition hover:bg-[rgba(15,23,42,0.06)]"
                  aria-label="Cerrar aviso"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-5 space-y-4">
                <TipRow
                  icon={<Lock className="h-4 w-4" />}
                  label="Verifica tus enlaces externos para asegurar que los reclutadores puedan contactarte."
                />
                <TipRow
                  icon={<ArrowRight className="h-4 w-4" />}
                  label="Usa una biografía concisa pero impactante que resalte tus mayores logros."
                />
              </div>
            </div>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <div className="rounded-[28px] border border-[var(--umss-border)] bg-[var(--umss-surface)] p-6 shadow-sm">
              <div className="relative h-56 overflow-hidden rounded-[24px] bg-slate-200">
                {/* Avatar preview */}
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar de perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-slate-400" />
                  </div>
                )}

                {/* Pencil button */}
                <button
                  type="button"
                  onClick={() => setShowAvatarUpload(true)}
                  className="absolute bottom-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--umss-brand)] text-white shadow-lg transition hover:bg-[#4338ca]"
                  aria-label="Editar foto de perfil"
                >
                  <Pencil className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              <FormField
                label="Nombre"
                value={profile.firstName}
                onChange={(value) => updateField('firstName', value)}
              />
              <FormField
                label="Apellido paterno"
                value={profile.lastName}
                onChange={(value) => updateField('lastName', value)}
              />
              <FormField
                label="Apellido materno"
                value={profile.maternalLastName}
                onChange={(value) => updateField('maternalLastName', value)}
              />
              <FormField
                label="Titulo profesional / Rol"
                value={profile.role}
                onChange={(value) => updateField('role', value)}
              />
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Información Personal">
          <div className="rounded-[24px] border border-[var(--umss-border)] bg-[var(--umss-surface)] p-5">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--umss-brand)]">
              Bio & Professional Narrative
            </label>
            <textarea
              value={profile.bio}
              onChange={(event) => updateField('bio', event.target.value)}
              className="mt-3 min-h-[170px] w-full resize-none rounded-[24px] border border-[var(--umss-border)] bg-white p-4 text-sm text-slate-900 shadow-sm focus:border-[var(--umss-brand)] focus:outline-none"
            />
          </div>
        </DashboardCard>

        <DashboardCard title="Configuración de Visibilidad">
          <div className="space-y-4">
            {(['projects', 'skills', 'trajectory'] as const).map((section) => (
              <VisibilitySection
                key={section}
                sectionKey={section}
                title={section === 'projects' ? 'Proyectos' : section === 'skills' ? 'Habilidades' : 'Trayectoria'}
                items={highlights[section]}
                onRemove={(index) => removeHighlight(section, index)}
                onAdd={() => startAdding(section)}
                addingSection={addingSection}
                newItemText={newItemText}
                setNewItemText={setNewItemText}
                onAddItem={() => addHighlight(section)}
                onCancelAdding={cancelAdding}
              />
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Redes Sociales & Enlaces">
          <div className="grid gap-4 xl:grid-cols-2">
            <FormField label="GitHub" value={profile.github} onChange={(value) => updateField('github', value)} />
            <FormField label="LinkedIn" value={profile.linkedin} onChange={(value) => updateField('linkedin', value)} />
            <FormField label="Personal Website" value={profile.website} onChange={(value) => updateField('website', value)} />
            <FormField label="Teléfono de contacto" value={profile.phone} onChange={(value) => updateField('phone', value)} />
          </div>
        </DashboardCard>

        <DashboardCard title="Correo y Contraseña">
          <div className="space-y-4">
            <FormField label="E-mail" value={profile.email} onChange={(value) => updateField('email', value)} type="email" />
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleChangePassword}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
              >
                Cambiar Contraseña
              </button>
            </div>
            {showPasswordFields && (
              <>
                <FormField
                  label="Contraseña actual"
                  value={profile.password}
                  onChange={(value) => updateField('password', value)}
                  type="password"
                />
                <FormField
                  label="Nueva contraseña"
                  value={profile.newPassword}
                  onChange={(value) => updateField('newPassword', value)}
                  type="password"
                />
              </>
            )}
          </div>
        </DashboardCard>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => {
            if (serverProfile) {
              setProfile(serverProfile);
              setAvatarUrl(serverProfile.avatar || null);
              originalServerAvatar.current = serverProfile.avatar || null;
              if (setPendingAvatarFile) setPendingAvatarFile(null);
            }
          }}
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--umss-border)] bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-[var(--umss-surface)]"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={saveChanges}
          disabled={isSaving}
          className={`inline-flex h-11 items-center justify-center rounded-2xl px-6 text-sm font-semibold text-white shadow-sm transition ${isSaving ? 'bg-slate-300 cursor-not-allowed' : 'bg-[var(--umss-brand)] hover:bg-[#4338CA]'}`}
        >
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {showAvatarUpload && (
        <AvatarUploadTray
          currentAvatar={avatarUrl}
          onClose={() => setShowAvatarUpload(false)}
          onConfirm={(file, url) => {
            if (setPendingAvatarFile) setPendingAvatarFile(file);
            setAvatarUrl(url); // Actualización local inmediata
            if (onLocalUpdate) onLocalUpdate({ avatar: url }); // Sync Sidebar/Topbar
            setShowAvatarUpload(false);
          }}
        />
      )}
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-900">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full rounded-2xl border border-[var(--umss-border)] bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[var(--umss-brand)] focus:outline-none"
      />
    </div>
  );
}

function VisibilitySection({
  sectionKey,
  title,
  items,
  onRemove,
  onAdd,
  addingSection,
  newItemText,
  setNewItemText,
  onAddItem,
  onCancelAdding,
}: {
  sectionKey: 'projects' | 'skills' | 'trajectory';
  title: string;
  items: string[];
  onRemove: (index: number) => void;
  onAdd: () => void;
  addingSection: 'projects' | 'skills' | 'trajectory' | null;
  newItemText: string;
  setNewItemText: (value: string) => void;
  onAddItem: () => void;
  onCancelAdding: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-[var(--umss-border)] bg-[var(--umss-surface)] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <span className="rounded-full bg-[var(--umss-surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {items.length} destacados seleccionados
        </span>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item}
            className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--umss-border)] bg-white px-4 py-3 shadow-sm"
          >
            <p className="text-sm text-slate-900">{item}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-full p-2 text-slate-500 transition hover:bg-[rgba(15,23,42,0.06)]"
                aria-label={`Editar ${item}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded-full p-2 text-slate-500 transition hover:bg-[rgba(15,23,42,0.06)]"
                onClick={() => onRemove(index)}
                aria-label={`Eliminar ${item}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        
        {/* Botón de añadir si hay menos de 3 elementos */}
        {items.length < 3 && addingSection !== sectionKey && (
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center justify-center gap-2 w-full rounded-2xl border border-dashed border-[var(--umss-border)] bg-[var(--umss-surface)] px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[var(--umss-brand)] hover:bg-[rgba(80,72,229,0.04)]"
          >
            <Plus className="h-4 w-4" />
            Añadir elemento destacado
          </button>
        )}

        {/* Formulario para añadir nuevo elemento */}
        {addingSection === sectionKey && (
          <div className="flex items-center gap-2 rounded-2xl border border-[var(--umss-border)] bg-white px-4 py-3 shadow-sm">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder={`Escribe un nuevo ${title.toLowerCase().slice(0, -1)}...`}
              className="flex-1 bg-transparent text-sm text-slate-900 outline-none"
              autoFocus
            />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onAddItem}
                className="rounded-full bg-[var(--umss-brand)] p-2 text-white transition hover:bg-[#4338ca]"
                aria-label="Añadir"
              >
                <Plus className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={onCancelAdding}
                className="rounded-full p-2 text-slate-500 transition hover:bg-[rgba(15,23,42,0.06)]"
                aria-label="Cancelar"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TipRow({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[24px] border border-[var(--umss-border)] bg-[var(--umss-surface)] p-4">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(80,72,229,0.12)] text-[var(--umss-brand)]">
        {icon}
      </span>
      <p className="text-sm text-slate-700">{label}</p>
    </div>
  );
}

function AvatarUploadTray({
  currentAvatar,
  onClose,
  onConfirm,
}: {
  currentAvatar: string | null;
  onClose: () => void;
  onConfirm: (file: File | null, url: string | null) => void;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida.');
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="w-[480px] rounded-[32px] border border-[var(--umss-border)] bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">Actualizar Foto de Perfil</h3>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          onDragEnter={onDrag}
          onDragLeave={onDrag}
          onDragOver={onDrag}
          onDrop={onDrop}
          className={`relative mb-6 flex aspect-square flex-col items-center justify-center overflow-hidden rounded-[24px] border-2 border-dashed transition-all ${
            dragActive
              ? 'border-[var(--umss-brand)] bg-[rgba(80,72,229,0.04)]'
              : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-[var(--umss-brand)]'
          }`}
        >
          {previewUrl ? (
            <>
              <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg"
                >
                  Cambiar imagen
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center p-6 text-center" onClick={() => fileInputRef.current?.click()}>
              <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
                <Upload className="h-6 w-6 text-[var(--umss-brand)]" />
              </div>
              <p className="text-sm font-semibold text-slate-900">Arrastra tu foto aquí</p>
              <p className="mt-1 text-xs text-slate-500">o haz clic para buscar en tu equipo</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>

        <div className="flex items-center gap-3">
          {previewUrl && (
            <button
              onClick={() => {
                setPreviewUrl(null);
                setSelectedFile(null);
              }}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-red-50 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          )}
          <div className="ml-auto flex gap-3">
            <button
              onClick={onClose}
              className="h-11 rounded-2xl px-6 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => onConfirm(selectedFile, previewUrl)}
              className="h-11 rounded-2xl bg-[var(--umss-brand)] px-6 text-sm font-semibold text-white shadow-lg hover:bg-[#4338ca]"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
