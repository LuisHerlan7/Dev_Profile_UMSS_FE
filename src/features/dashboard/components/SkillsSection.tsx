import { useEffect, useState } from 'react';
import { Check, Edit3, Plus, Search, Trash2, X } from 'lucide-react';
import { DashboardCard } from '@shared/components/dashboard/DashboardCard';
import { SectionHeading } from './SectionHeading';
import type { SoftSkillState, TechnicalSkillState } from '@features/dashboard/utils/developerDashboardMappers';

const initialTechnicalSkills = [
  { id: 'tech-1', name: 'React.js', level: 'Avanzado', progress: 84 },
  { id: 'tech-2', name: 'TypeScript', level: 'Intermedio', progress: 68 },
  { id: 'tech-3', name: 'Node.js', level: 'Intermedio', progress: 58 },
  { id: 'tech-4', name: 'PostgreSQL', level: 'Principiante', progress: 42 },
];

const initialSoftSkills = [
  { id: 'soft-1', name: 'Trabajo en equipo', progress: 85 },
  { id: 'soft-2', name: 'Comunicación asertiva', progress: 75 },
  { id: 'soft-3', name: 'Resolución de problemas', progress: 90 },
  { id: 'soft-4', name: 'Liderazgo', progress: 70 },
];

const levelOptions = ['Principiante', 'Intermedio', 'Avanzado', 'Experto'];

export function SkillsSection({
  serverTechnical,
  serverSoft,
  onDataDirty,
}: {
  serverTechnical?: TechnicalSkillState[];
  serverSoft?: SoftSkillState[];
  onDataDirty?: () => void;
}) {
  const [editMode, setEditMode] = useState(false);
  const [technicalSkills, setTechnicalSkills] = useState<TechnicalSkillState[]>(() =>
    serverTechnical === undefined ? initialTechnicalSkills : serverTechnical
  );
  const [softSkills, setSoftSkills] = useState<SoftSkillState[]>(() =>
    serverSoft === undefined ? initialSoftSkills : serverSoft
  );
  const [draftTechnicalSkills, setDraftTechnicalSkills] = useState<TechnicalSkillState[]>(() =>
    serverTechnical === undefined ? initialTechnicalSkills : serverTechnical
  );
  const [draftSoftSkills, setDraftSoftSkills] = useState<SoftSkillState[]>(() =>
    serverSoft === undefined ? initialSoftSkills : serverSoft
  );

  useEffect(() => {
    if (serverTechnical !== undefined) {
      setTechnicalSkills(serverTechnical);
      setDraftTechnicalSkills(serverTechnical);
    }
    if (serverSoft !== undefined) {
      setSoftSkills(serverSoft);
      setDraftSoftSkills(serverSoft);
    }
  }, [serverTechnical, serverSoft]);
  const [newSoftSkill, setNewSoftSkill] = useState('');
  const [editingSoftSkillId, setEditingSoftSkillId] = useState<string | null>(null);
  const [editingSoftSkillName, setEditingSoftSkillName] = useState('');
  const [skillSearch, setSkillSearch] = useState('');

  const getLevelForProgress = (progress: number) => {
    if (progress <= 25) return 'Principiante';
    if (progress <= 50) return 'Intermedio';
    if (progress <= 75) return 'Avanzado';
    return 'Experto';
  };

  const startEdit = () => {
    setDraftTechnicalSkills(technicalSkills);
    setDraftSoftSkills(softSkills);
    setNewSoftSkill('');
    setEditingSoftSkillId(null);
    setEditingSoftSkillName('');
    setEditMode(true);
  };

  const cancelEdit = () => {
    setDraftTechnicalSkills(technicalSkills);
    setDraftSoftSkills(softSkills);
    setNewSoftSkill('');
    setEditingSoftSkillId(null);
    setEditingSoftSkillName('');
    setEditMode(false);
  };

  const [isSaving, setIsSaving] = useState(false);

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      const { syncSkills } = await import('@features/dashboard/api/developerDashboard');
      await syncSkills({
        technical: draftTechnicalSkills.map(t => ({
          name: t.name,
          level: t.level,
          progress: t.progress
        })),
        soft: draftSoftSkills.map(s => ({
          name: s.name,
          progress: s.progress
        }))
      });

      setTechnicalSkills(draftTechnicalSkills);
      setSoftSkills(draftSoftSkills);
      setEditingSoftSkillId(null);
      setEditingSoftSkillName('');
      setEditMode(false);

      if (onDataDirty) onDataDirty();
    } catch (e: any) {
      alert(e.message || 'Error al guardar habilidades');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDraftTechnicalChange = (
    id: string,
    field: 'name' | 'level' | 'progress',
    value: string | number
  ) => {
    setDraftTechnicalSkills((current) =>
      current.map((skill) => {
        if (skill.id !== id) return skill;
        const nextValue = field === 'progress' ? Number(value) : value;
        const nextLevel =
          field === 'progress'
            ? getLevelForProgress(Number(value))
            : field === 'level'
              ? String(value)
              : skill.level;

        return {
          ...skill,
          [field]: nextValue,
          level: nextLevel,
        };
      })
    );
  };

  const handleAddTechnicalSkill = () => {
    setDraftTechnicalSkills((current) => [
      {
        id: `tech-${Date.now()}`,
        name: 'Nueva habilidad',
        level: 'Principiante',
        progress: 0,
      },
      ...current,
    ]);
  };

  const handleDraftSoftSkillChange = (
    id: string,
    field: 'name' | 'progress',
    value: string | number
  ) => {
    setDraftSoftSkills((current) =>
      current.map((skill) => {
        if (skill.id !== id) return skill;
        return {
          ...skill,
          [field]: field === 'progress' ? Number(value) : value,
        };
      })
    );
  };

  const handleAddSoftSkill = () => {
    const trimmed = newSoftSkill.trim();
    if (!trimmed) return;
    setDraftSoftSkills((current) => [
      ...current,
      { id: `soft-${Date.now()}`, name: trimmed, progress: 0 },
    ]);
    setNewSoftSkill('');
  };

  const handleStartSoftSkillEdit = (skillId: string, currentName: string) => {
    setEditingSoftSkillId(skillId);
    setEditingSoftSkillName(currentName);
  };

  const handleSaveSoftSkill = () => {
    if (!editingSoftSkillId) return;
    const trimmed = editingSoftSkillName.trim();
    if (!trimmed) return;
    setDraftSoftSkills((current) =>
      current.map((skill) =>
        skill.id === editingSoftSkillId ? { ...skill, name: trimmed } : skill
      )
    );
    setEditingSoftSkillId(null);
    setEditingSoftSkillName('');
  };

  const handleDeleteSoftSkill = (skillId: string) => {
    setDraftSoftSkills((current) => current.filter((skill) => skill.id !== skillId));
    if (editingSoftSkillId === skillId) {
      setEditingSoftSkillId(null);
      setEditingSoftSkillName('');
    }
  };

  const activeTechnicalSkills = editMode ? draftTechnicalSkills : technicalSkills;
  const activeSoftSkills = editMode ? draftSoftSkills : softSkills;

  const q = skillSearch.toLowerCase();
  const filteredTechnicalSkills = activeTechnicalSkills.filter(
    (s) => !q || s.name.toLowerCase().includes(q) || s.level.toLowerCase().includes(q)
  );
  const filteredSoftSkills = activeSoftSkills.filter(
    (s) => !q || s.name.toLowerCase().includes(q)
  );

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Editor de Perfil"
        title="Habilidades"
        description="Lenguajes, frameworks, herramientas y habilidades blandas resumidos"
        actions={
          <div className="flex items-center gap-3">
            {!editMode && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  placeholder="Buscar habilidades..."
                  className="h-10 w-48 rounded-2xl border border-[var(--umss-border)] bg-white pl-9 pr-3 text-sm text-slate-900 shadow-sm focus:border-[var(--umss-brand)] focus:outline-none"
                />
              </div>
            )}
            {!editMode ? (
              <button
                type="button"
                onClick={startEdit}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--umss-brand)] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4338ca]"
              >
                Editar
              </button>
            ) : (
              <span className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--umss-lavender)] px-4 text-sm font-semibold text-[var(--umss-brand)]">
                Modo edición
              </span>
            )}
          </div>
        }
      />

      <form id="skills-form" onSubmit={(e) => { e.preventDefault(); saveChanges(); }} className="space-y-4">
        <DashboardCard
          title="Habilidades Técnicas"
          description="Lenguajes, frameworks y herramientas."
          action={
            editMode ? (
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--umss-lavender)] text-[var(--umss-brand)] transition hover:bg-[rgba(80,72,229,0.18)]"
                aria-label="Agregar habilidad técnica"
                onClick={handleAddTechnicalSkill}
              >
                <Plus className="h-4 w-4" />
              </button>
            ) : null
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            {filteredTechnicalSkills.map((skill) => (
              <div
                key={skill.id}
                id={`skill-${skill.id}`}
                className="relative rounded-[24px] border border-[var(--umss-border)] bg-[var(--umss-surface)] p-4"
              >
                {editMode ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteTechnicalSkill(skill.id)}
                    className="absolute right-4 top-4 rounded-full p-2 text-slate-500 transition hover:bg-[rgba(15,23,42,0.06)]"
                    aria-label={`Eliminar ${skill.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}

                {editMode ? (
                  <>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <label className="text-sm font-semibold text-slate-900" htmlFor={`${skill.id}-name`}>
                          Nombre
                        </label>
                        <input
                          id={`${skill.id}-name`}
                          value={skill.name}
                          onChange={(event) => handleDraftTechnicalChange(skill.id, 'name', event.target.value)}
                          required
                          className="mt-2 w-full rounded-2xl border border-[var(--umss-border)] bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[var(--umss-brand)] focus:outline-none"
                        />
                      </div>

                      <div className="w-full max-w-[180px]">
                        <label className="text-sm font-semibold text-slate-900" htmlFor={`${skill.id}-level`}>
                          Nivel
                        </label>
                        <div
                          className="mt-2 w-full rounded-2xl border border-[var(--umss-border)] bg-slate-50 px-3 py-2 text-sm text-slate-500 shadow-sm"
                        >
                          {skill.level}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-900">Dominio</p>
                        <span className="text-sm font-medium text-[var(--umss-brand)]">
                          {skill.progress ?? 0}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={skill.progress}
                        onChange={(event) =>
                          handleDraftTechnicalChange(skill.id, 'progress', Number(event.target.value))
                        }
                        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--umss-border)] accent-[var(--umss-brand)]"
                      />
                      <div className="h-3 overflow-hidden rounded-full bg-white p-1 shadow-inner">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] via-[var(--umss-brand)] to-[var(--umss-accent)] transition-all"
                          style={{ width: `${skill.progress ?? 0}%` }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{skill.name}</p>
                        <p className="mt-1 text-sm text-slate-600">{skill.level}</p>
                      </div>
                      <span className="text-sm font-semibold text-[var(--umss-brand)]">
                        {skill.progress ?? 0}%
                      </span>
                    </div>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-white p-1 shadow-inner">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] via-[var(--umss-brand)] to-[var(--umss-accent)]"
                        style={{ width: `${skill.progress ?? 0}%` }}
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard
          title="Habilidades Blandas"
          action={
            editMode ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--umss-brand)] text-white shadow-sm transition hover:bg-[#4338CA]"
                  aria-label="Agregar habilidad blanda"
                  onClick={handleAddSoftSkill}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            ) : null
          }
        >
          <div className="flex flex-col gap-3">
            <div className="grid gap-4 md:grid-cols-2">
              {filteredSoftSkills.map((skill) => (
                <div
                  key={skill.id}
                  id={`skill-${skill.id}`}
                  className="relative rounded-[24px] border border-[var(--umss-border)] bg-[var(--umss-surface)] p-4"
                >
                  {editMode ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteSoftSkill(skill.id)}
                      className="absolute right-4 top-4 rounded-full p-2 text-slate-500 transition hover:bg-[rgba(15,23,42,0.06)]"
                      aria-label={`Eliminar ${skill.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}

                  {editMode ? (
                    <>
                      <div className="min-w-0 pr-8">
                        <label className="text-sm font-semibold text-slate-900" htmlFor={`${skill.id}-name`}>
                          Nombre
                        </label>
                        <input
                          id={`${skill.id}-name`}
                          value={skill.name}
                          onChange={(event) => handleDraftSoftSkillChange(skill.id, 'name', event.target.value)}
                          required
                          className="mt-2 w-full rounded-2xl border border-[var(--umss-border)] bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[var(--umss-brand)] focus:outline-none"
                        />
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-900">Dominio</p>
                          <span className="text-sm font-medium text-[var(--umss-brand)]">
                            {skill.progress ?? 0}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={skill.progress}
                          onChange={(event) =>
                            handleDraftSoftSkillChange(skill.id, 'progress', Number(event.target.value))
                          }
                          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--umss-border)] accent-[var(--umss-brand)]"
                        />
                        <div className="h-3 overflow-hidden rounded-full bg-white p-1 shadow-inner">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] via-[var(--umss-brand)] to-[var(--umss-accent)] transition-all"
                            style={{ width: `${skill.progress ?? 0}%` }}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-900">{skill.name}</p>
                        <span className="text-sm font-semibold text-[var(--umss-brand)]">
                          {skill.progress ?? 0}%
                        </span>
                      </div>
                      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white p-1 shadow-inner">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] via-[var(--umss-brand)] to-[var(--umss-accent)]"
                          style={{ width: `${skill.progress ?? 0}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {editMode ? (
              <div className="flex flex-col gap-2 rounded-[24px] border border-[var(--umss-border)] bg-[var(--umss-surface)] p-4 md:flex-row md:items-center md:justify-between">
                <input
                  type="text"
                  value={newSoftSkill}
                  onChange={(event) => setNewSoftSkill(event.target.value)}
                  placeholder="Nueva habilidad blanda"
                  className="w-full rounded-2xl border border-[var(--umss-border)] bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[var(--umss-brand)] focus:outline-none"
                />
                <button
                  type="button"
                  disabled={!newSoftSkill.trim()}
                  onClick={handleAddSoftSkill}
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-100 px-4 text-sm font-semibold text-black shadow-sm transition hover:bg-slate-200 disabled:opacity-50"
                >
                  Agregar habilidad
                </button>
              </div>
            ) : null}
          </div>
        </DashboardCard>

        {editMode ? (
          <div className="flex flex-col gap-3 rounded-[28px] border border-[var(--umss-border)] bg-white p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.2)] sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--umss-border)] bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-[var(--umss-surface)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="skills-form"
              disabled={isSaving}
              className={`inline-flex h-11 items-center justify-center rounded-2xl px-6 text-sm font-semibold shadow-sm transition ${isSaving ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[var(--umss-brand)] text-white hover:bg-[#4338CA]'
                }`}
            >
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        ) : null}
      </form>
    </div>
  );
}
