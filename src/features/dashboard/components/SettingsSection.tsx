import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, Lock, Pencil, Trash2, X, Plus, Upload, ImageIcon, Check, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { DashboardCard } from '@shared/components/dashboard/DashboardCard';
import { SectionHeading } from './SectionHeading';
import { updateAvatar, updateProfile, updateSocialLinks, updateEmail, updatePassword, syncHighlights } from '@features/dashboard/api/developerDashboard';
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
  availableProjects,
  availableSkills,
  availableExperience,
}: {
  serverProfile?: SettingsProfileState;
  serverHighlights?: VisibilityHighlightsState;
  onDataDirty?: () => void;
  onLocalUpdate?: (updates: Partial<SettingsProfileState>) => void;
  pendingAvatarFile?: File | null;
  setPendingAvatarFile?: (file: File | null) => void;
  availableProjects?: string[];
  availableSkills?: string[];
  availableExperience?: string[];
}) {
  const [profile, setProfile] = useState(serverProfile || initialProfile);
  const [highlights, setHighlights] = useState<typeof initialHighlights>(serverHighlights || initialHighlights);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showQuickAlert, setShowQuickAlert] = useState(true);
  const [addingSection, setAddingSection] = useState<keyof typeof highlights | null>(null);
  const [newItemText, setNewItemText] = useState('');

  // Ref para rastrear el avatar original del servidor y detectar cambios reales
  const originalServerAvatar = useRef<string | null>(serverProfile?.avatar || null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(serverProfile?.avatar || null);

  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estado del bloque Correo y Contraseña
  const [showSecurityPanel, setShowSecurityPanel] = useState(false);
  const [currentPwVisible, setCurrentPwVisible] = useState(false);
  const [newPwVisible, setNewPwVisible] = useState(false);
  const [currentPwVerified, setCurrentPwVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [newEmail, setNewEmail] = useState(''); // Estado separado para nuevo email

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

  const editHighlight = (section: keyof typeof highlights, index: number, newValue: string) => {
    if (newValue.trim()) {
      setHighlights((current) => {
        const arr = [...current[section]];
        arr[index] = newValue.trim();
        return { ...current, [section]: arr };
      });
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
    setShowSecurityPanel(true);
    setCurrentPwVerified(false);
    setNewEmail('');
    updateField('password', '');
    updateField('newPassword', '');
  };

  const handleVerifyPassword = async () => {
    if (!profile.password.trim()) return;
    setIsVerifying(true);
    try {
      // Validate current password against backend
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/developer/settings/verify-password', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ current_password: profile.password }),
      });
      if (res.ok) {
        setCurrentPwVerified(true);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Contraseña incorrecta. Intenta de nuevo.');
        setCurrentPwVerified(false);
      }
    } catch {
      alert('Error de conexión al verificar la contraseña.');
    } finally {
      setIsVerifying(false);
    }
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

  // Sincronizar highlights cuando cambian desde el servidor
  useEffect(() => {
    if (serverHighlights && !isSaving) {
      setHighlights((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(serverHighlights)) return prev;
        return serverHighlights;
      });
    }
  }, [serverHighlights, isSaving]);

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      // 1. Guardar Avatar si ha cambiado
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
        if (onLocalUpdate) onLocalUpdate({ avatar: newAvatarUrl });
        setAvatarUrl(newAvatarUrl);
        originalServerAvatar.current = newAvatarUrl;
        if (setPendingAvatarFile) setPendingAvatarFile(null);
      }

      // 2. Guardar nombre, apellidos, rol, bio
      await updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        maternalLastName: profile.maternalLastName,
        role: profile.role,
        bio: profile.bio,
      });

      // 3. Guardar redes sociales y teléfono
      await updateSocialLinks({
        github: profile.github,
        linkedin: profile.linkedin,
        website: profile.website,
        phone: profile.phone,
      });

      // 4. Guardar correo si cambió y fue verificado
      const originalEmail = serverProfile?.email ?? '';
      if (currentPwVerified && newEmail.trim() && newEmail.trim() !== originalEmail) {
        await updateEmail({ email: newEmail.trim() });
        setNewEmail('');
      }

      // 5. Guardar contraseña si fue verificada y se llenó la nueva
      if (currentPwVerified && showSecurityPanel && profile.newPassword) {
        await updatePassword({
          current_password: profile.password,
          new_password: profile.newPassword,
        });
      }

      // Siempre cerrar el panel de seguridad tras guardar
      if (showSecurityPanel) {
        setShowSecurityPanel(false);
        setCurrentPwVerified(false);
        setNewEmail('');
        updateField('password', '');
        updateField('newPassword', '');
      }

      // 6. Guardar elementos destacados de visibilidad
      await syncHighlights({
        projects: highlights.projects,
        skills: highlights.skills,
        trajectory: highlights.trajectory,
      });

      if (onDataDirty) onDataDirty();
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

      <form id="settings-form" onSubmit={(e) => { e.preventDefault(); saveChanges(); }} className="space-y-6">
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
                required
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

        <DashboardCard id="settings-visibility-card" title="Configuración de Visibilidad">
          <div className="space-y-4">
            {(['projects', 'skills', 'trajectory'] as const).map((section) => (
              <VisibilitySection
                key={section}
                sectionKey={section}
                title={section === 'projects' ? 'Proyectos' : section === 'skills' ? 'Habilidades' : 'Trayectoria'}
                items={highlights[section]}
                onRemove={(index) => removeHighlight(section, index)}
                onEdit={(index, newValue) => editHighlight(section, index, newValue)}
                onAdd={() => startAdding(section)}
                addingSection={addingSection}
                newItemText={newItemText}
                setNewItemText={setNewItemText}
                onAddItem={() => addHighlight(section)}
                onCancelAdding={cancelAdding}
                availableOptions={section === 'projects' ? (availableProjects || []) : section === 'skills' ? (availableSkills || []) : (availableExperience || [])}
              />
            ))}
          </div>
        </DashboardCard>

        <DashboardCard id="settings-social-card" title="Redes Sociales & Enlaces">
          <div className="grid gap-4 xl:grid-cols-2">
            <FormField label="GitHub" value={profile.github} onChange={(value) => updateField('github', value)} />
            <FormField label="LinkedIn" value={profile.linkedin} onChange={(value) => updateField('linkedin', value)} />
            <FormField label="Personal Website" value={profile.website} onChange={(value) => updateField('website', value)} />
            <FormField label="Teléfono de contacto" value={profile.phone} onChange={(value) => updateField('phone', value)} />
          </div>
        </DashboardCard>

        <DashboardCard id="settings-email-card" title="Correo y Contraseña">
          <div className="space-y-4">
            {/* E-mail actual - siempre solo lectura */}
            <div>
              <label className="block text-sm font-semibold text-slate-900">E-mail actual</label>
              <input
                type="email"
                value={profile.email}
                readOnly
                className="mt-3 w-full cursor-not-allowed rounded-2xl border border-[var(--umss-border)] bg-slate-50 px-3 py-2 text-sm text-slate-400 shadow-sm"
              />
            </div>

            {/* Botón para abrir panel de seguridad */}
            {!showSecurityPanel && (
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleChangePassword}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
                >
                  <Lock className="h-4 w-4" />
                  Cambiar mail y contraseña
                </button>
              </div>
            )}

            {showSecurityPanel && (
              <div className="space-y-4 rounded-2xl border border-[var(--umss-border)] bg-[var(--umss-surface)] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <ShieldCheck className="h-4 w-4 text-[var(--umss-brand)]" />
                  Verifica tu identidad para continuar
                </div>

                {/* Contraseña actual + Verificar */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Contraseña actual</label>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type={currentPwVisible ? 'text' : 'password'}
                        value={profile.password}
                        onChange={(e) => { updateField('password', e.target.value); setCurrentPwVerified(false); }}
                        disabled={currentPwVerified}
                        placeholder="Introduce tu contraseña actual..."
                        className={`w-full rounded-2xl border pr-10 border-[var(--umss-border)] px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[var(--umss-brand)] focus:outline-none ${
                          currentPwVerified ? 'bg-emerald-50 border-emerald-300' : 'bg-white'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setCurrentPwVisible((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        tabIndex={-1}
                      >
                        {currentPwVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {!currentPwVerified ? (
                      <button
                        type="button"
                        onClick={handleVerifyPassword}
                        disabled={isVerifying || !profile.password.trim()}
                        className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-2xl bg-[var(--umss-brand)] px-4 text-sm font-semibold text-white transition hover:bg-[#4338ca] disabled:opacity-50"
                      >
                        {isVerifying ? 'Verificando...' : 'Verificar'}
                      </button>
                    ) : (
                      <span className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-2xl bg-emerald-100 px-4 text-sm font-semibold text-emerald-700">
                        <Check className="h-4 w-4" /> Verificada
                      </span>
                    )}
                  </div>
                </div>

                {/* Campos que se habilitan al verificar */}
                {currentPwVerified && (
                  <>
                    {/* Nuevo E-mail */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-900">Nuevo E-mail</label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Introduce tu nuevo correo electrónico..."
                        className="mt-3 w-full rounded-2xl border border-[var(--umss-border)] bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[var(--umss-brand)] focus:outline-none"
                      />
                      <p className="mt-1 text-xs text-slate-400">Déjalo vacío si no quieres cambiar el correo.</p>
                    </div>

                    {/* Nueva contraseña */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-900">Nueva contraseña</label>
                      <div className="relative mt-3">
                        <input
                          type={newPwVisible ? 'text' : 'password'}
                          value={profile.newPassword}
                          onChange={(e) => updateField('newPassword', e.target.value)}
                          placeholder="Mínimo 8 caracteres..."
                          className="w-full rounded-2xl border border-[var(--umss-border)] bg-white pr-10 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[var(--umss-brand)] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setNewPwVisible((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                          tabIndex={-1}
                        >
                          {newPwVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">Déjala vacía si no quieres cambiar la contraseña.</p>
                    </div>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowSecurityPanel(false);
                    setCurrentPwVerified(false);
                    setNewEmail('');
                    updateField('password', '');
                    updateField('newPassword', '');
                  }}
                  className="text-xs text-slate-400 underline hover:text-slate-600"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </DashboardCard>
      </form>

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
            // Si el panel de seguridad está abierto, resetearlo siempre
            if (showSecurityPanel) {
              setShowSecurityPanel(false);
              setCurrentPwVerified(false);
              setNewEmail('');
            }
          }}
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--umss-border)] bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-[var(--umss-surface)]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="settings-form"
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
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-900">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
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
  onEdit,
  onAdd,
  addingSection,
  newItemText,
  setNewItemText,
  onAddItem,
  onCancelAdding,
  availableOptions = [],
}: {
  sectionKey: 'projects' | 'skills' | 'trajectory';
  title: string;
  items: string[];
  onRemove: (index: number) => void;
  onEdit: (index: number, newValue: string) => void;
  onAdd: () => void;
  addingSection: 'projects' | 'skills' | 'trajectory' | null;
  newItemText: string;
  setNewItemText: (value: string) => void;
  onAddItem: () => void;
  onCancelAdding: () => void;
  availableOptions?: string[];
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const getFilteredOptions = (currentEditItem?: string) => {
    return availableOptions.filter(opt => !items.includes(opt) || opt === currentEditItem);
  };

  const handleSaveEdit = (index: number) => {
    if (editingIndex !== null) {
      onEdit(index, newItemText);
      setEditingIndex(null);
      setNewItemText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setNewItemText('');
  };

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
            {editingIndex === index ? (
              <div className="flex w-full items-center gap-2">
                <select
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  className="flex-1 rounded-2xl border border-[var(--umss-border)] bg-white px-3 py-1 text-sm text-slate-900 shadow-sm focus:border-[var(--umss-brand)] focus:outline-none"
                  autoFocus
                >
                  <option value="" disabled>Selecciona una opción...</option>
                  {getFilteredOptions(item).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                  {getFilteredOptions(item).length === 0 && (
                    <option value="" disabled>No hay opciones disponibles</option>
                  )}
                </select>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(index)}
                    disabled={!newItemText || newItemText === item}
                    className="rounded-full bg-[var(--umss-brand)] p-2 text-white transition hover:bg-[#4338ca] disabled:opacity-50"
                    aria-label="Guardar"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="rounded-full p-2 text-slate-500 transition hover:bg-[rgba(15,23,42,0.06)]"
                    aria-label="Cancelar"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-900">{item}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-full p-2 text-slate-500 transition hover:bg-[rgba(15,23,42,0.06)]"
                    onClick={() => {
                      setEditingIndex(index);
                      setNewItemText(item);
                      onCancelAdding();
                    }}
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
              </>
            )}
          </div>
        ))}

        {/* Botón de añadir si hay menos de 3 elementos */}
        {items.length < 3 && addingSection !== sectionKey && editingIndex === null && (
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
            <select
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              className="flex-1 rounded-2xl border border-[var(--umss-border)] bg-white px-3 py-1 text-sm text-slate-900 shadow-sm focus:border-[var(--umss-brand)] focus:outline-none"
              autoFocus
            >
              <option value="" disabled>Selecciona una opción...</option>
              {getFilteredOptions().map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
              {getFilteredOptions().length === 0 && (
                <option value="" disabled>No hay opciones disponibles</option>
              )}
            </select>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onAddItem}
                disabled={!newItemText}
                className="rounded-full bg-[var(--umss-brand)] p-2 text-white transition hover:bg-[#4338ca] disabled:opacity-50"
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
          className={`relative mb-6 flex aspect-square flex-col items-center justify-center overflow-hidden rounded-[24px] border-2 border-dashed transition-all ${dragActive
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
