import { useEffect, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { DashboardCard } from '@shared/components/dashboard/DashboardCard';
import { SectionHeading } from './SectionHeading';
import type { SoftSkillState, TechnicalSkillState } from '@features/dashboard/utils/developerDashboardMappers';

const levelOptions = ['Principiante', 'Intermedio', 'Avanzado', 'Experto'] as const;

type SkillFilter = 'all' | 'technical' | 'soft';

function normalizeSkillName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function sortSkills<T extends { name: string; progress: number }>(items: T[]) {
  return [...items].sort((a, b) => {
    if (b.progress !== a.progress) return b.progress - a.progress;
    return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
  });
}

function buildValidationError(
  technical: TechnicalSkillState[],
  soft: SoftSkillState[]
) {
  const allNames = new Set<string>();

  for (const skill of [...technical, ...soft]) {
    const normalizedName = normalizeSkillName(skill.name);

    if (!normalizedName) {
      return 'No se permite guardar una habilidad sin nombre.';
    }

    if (normalizedName.length > 50) {
      return 'El nombre de la habilidad no puede superar los 50 caracteres.';
    }

    if (!Number.isFinite(skill.progress) || skill.progress < 0 || skill.progress > 100) {
      return 'El porcentaje de dominio debe estar entre 0% y 100%.';
    }

    const duplicateKey = normalizedName.toLocaleLowerCase('es');
    if (allNames.has(duplicateKey)) {
      return 'No se permiten habilidades duplicadas.';
    }

    allNames.add(duplicateKey);
  }

  return '';
}

function nextSkillId(prefix: 'tech' | 'soft') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function prepareTechnicalSkills(skills: TechnicalSkillState[]) {
  return sortSkills(
    skills.map((skill) => ({
      ...skill,
      name: normalizeSkillName(skill.name),
    }))
  );
}

function prepareSoftSkills(skills: SoftSkillState[]) {
  return sortSkills(
    skills.map((skill) => ({
      ...skill,
      name: normalizeSkillName(skill.name),
    }))
  );
}

function EmptySkillsState({ isSearching }: { isSearching: boolean }) {
  return (
    <div className="rounded-[24px] border border-dashed border-[var(--umss-border)] bg-white p-6 text-sm text-slate-500">
      {isSearching
        ? 'No encontramos habilidades con ese criterio de búsqueda.'
        : 'Aún no hay habilidades registradas. Activa el modo edición para agregar tus competencias.'}
    </div>
  );
}

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
  const [technicalSkills, setTechnicalSkills] = useState<TechnicalSkillState[]>(() => serverTechnical ?? []);
  const [softSkills, setSoftSkills] = useState<SoftSkillState[]>(() => serverSoft ?? []);
  const [draftTechnicalSkills, setDraftTechnicalSkills] = useState<TechnicalSkillState[]>(() => serverTechnical ?? []);
  const [draftSoftSkills, setDraftSoftSkills] = useState<SoftSkillState[]>(() => serverSoft ?? []);
  const [skillSearch, setSkillSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState<SkillFilter>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    if (serverTechnical !== undefined) {
      const nextTechnical = prepareTechnicalSkills(serverTechnical);
      setTechnicalSkills(nextTechnical);
      setDraftTechnicalSkills(nextTechnical);
    }

    if (serverSoft !== undefined) {
      const nextSoft = prepareSoftSkills(serverSoft);
      setSoftSkills(nextSoft);
      setDraftSoftSkills(nextSoft);
    }
  }, [serverTechnical, serverSoft]);

  const startEdit = () => {
    setDraftTechnicalSkills(technicalSkills);
    setDraftSoftSkills(softSkills);
    setSaveError('');
    setSaveSuccess('');
    setEditMode(true);
  };

  const cancelEdit = () => {
    setDraftTechnicalSkills(technicalSkills);
    setDraftSoftSkills(softSkills);
    setSaveError('');
    setSaveSuccess('');
    setEditMode(false);
  };

  const saveChanges = async () => {
    setSaveError('');
    setSaveSuccess('');

    const validationError = buildValidationError(draftTechnicalSkills, draftSoftSkills);
    if (validationError) {
      setSaveError(validationError);
      return;
    }

    const nextTechnicalSkills = prepareTechnicalSkills(draftTechnicalSkills);
    const nextSoftSkills = prepareSoftSkills(draftSoftSkills);

    setIsSaving(true);
    try {
      const { syncSkills } = await import('@features/dashboard/api/developerDashboard');
      await syncSkills({
        technical: nextTechnicalSkills.map((skill) => ({
          name: skill.name,
          level: skill.level,
          progress: skill.progress,
        })),
        soft: nextSoftSkills.map((skill) => ({
          name: skill.name,
          level: skill.level,
          progress: skill.progress,
        })),
      });

      setTechnicalSkills(nextTechnicalSkills);
      setSoftSkills(nextSoftSkills);
      setDraftTechnicalSkills(nextTechnicalSkills);
      setDraftSoftSkills(nextSoftSkills);
      setEditMode(false);
      setSaveSuccess('Los cambios se guardaron correctamente.');

      onDataDirty?.();
    } catch (error: unknown) {
      setSaveError(error instanceof Error ? error.message : 'Error al guardar habilidades.');
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

        if (field === 'progress') {
          const progress = Number(value);
          return {
            ...skill,
            progress,
          };
        }

        if (field === 'level') {
          return {
            ...skill,
            level: String(value),
          };
        }

        return {
          ...skill,
          name: String(value).slice(0, 50),
        };
      })
    );
  };

  const handleDraftSoftChange = (
    id: string,
    field: 'name' | 'level' | 'progress',
    value: string | number
  ) => {
    setDraftSoftSkills((current) =>
      current.map((skill) => {
        if (skill.id !== id) return skill;

        if (field === 'progress') {
          const progress = Number(value);
          return {
            ...skill,
            progress,
          };
        }

        if (field === 'level') {
          return {
            ...skill,
            level: String(value),
          };
        }

        return {
          ...skill,
          name: String(value).slice(0, 50),
        };
      })
    );
  };

  const handleAddTechnicalSkill = () => {
    setSaveError('');
    setDraftTechnicalSkills((current) => [
      {
        id: nextSkillId('tech'),
        name: '',
        level: 'Principiante',
        progress: 0,
      },
      ...current,
    ]);
  };

  const handleAddSoftSkill = () => {
    setSaveError('');
    setDraftSoftSkills((current) => [
      {
        id: nextSkillId('soft'),
        name: '',
        level: 'Principiante',
        progress: 0,
      },
      ...current,
    ]);
  };

  const handleDeleteTechnicalSkill = (skillId: string) => {
    setSaveError('');
    setDraftTechnicalSkills((current) => current.filter((skill) => skill.id !== skillId));
  };

  const handleDeleteSoftSkill = (skillId: string) => {
    setSaveError('');
    setDraftSoftSkills((current) => current.filter((skill) => skill.id !== skillId));
  };

  const activeTechnicalSkills = editMode ? draftTechnicalSkills : sortSkills(technicalSkills);
  const activeSoftSkills = editMode ? draftSoftSkills : sortSkills(softSkills);
  const query = skillSearch.trim().toLocaleLowerCase('es');

  const filteredTechnicalSkills = activeTechnicalSkills.filter(
    (skill) =>
      !query ||
      skill.name.toLocaleLowerCase('es').includes(query) ||
      skill.level.toLocaleLowerCase('es').includes(query)
  );

  const filteredSoftSkills = activeSoftSkills.filter(
    (skill) =>
      !query ||
      skill.name.toLocaleLowerCase('es').includes(query) ||
      skill.level.toLocaleLowerCase('es').includes(query)
  );

  const showTechnical = skillFilter === 'all' || skillFilter === 'technical';
  const showSoft = skillFilter === 'all' || skillFilter === 'soft';
  const hasVisibleSkills = filteredTechnicalSkills.length > 0 || filteredSoftSkills.length > 0;

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Editor de Perfil"
        title="Habilidades"
        description="Lenguajes, frameworks, herramientas y habilidades blandas resumidas."
        actions={
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={skillSearch}
                onChange={(event) => setSkillSearch(event.target.value)}
                placeholder="Buscar habilidades..."
                className="h-10 w-52 rounded-2xl border border-[var(--umss-border)] bg-white pl-9 pr-3 text-sm text-slate-900 shadow-sm focus:border-[var(--umss-brand)] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-[var(--umss-border)] bg-white p-1">
              {([
                { id: 'all', label: 'Todas' },
                { id: 'technical', label: 'Técnicas' },
                { id: 'soft', label: 'Blandas' },
              ] as const).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSkillFilter(option.id)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    skillFilter === option.id
                      ? 'bg-[var(--umss-lavender)] text-[var(--umss-brand)]'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

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

      {saveError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {saveError}
        </div>
      ) : null}

      {saveSuccess ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {saveSuccess}
        </div>
      ) : null}

      {!hasVisibleSkills && !editMode ? <EmptySkillsState isSearching={Boolean(query)} /> : null}

      <form
        id="skills-form"
        onSubmit={(event) => {
          event.preventDefault();
          saveChanges();
        }}
        className="space-y-4"
      >
        {showTechnical ? (
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
            {filteredTechnicalSkills.length === 0 ? (
              <EmptySkillsState isSearching={Boolean(query)} />
            ) : (
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
                        aria-label={`Eliminar ${skill.name || 'habilidad técnica'}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}

                    {editMode ? (
                      <>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <label className="text-sm font-semibold text-slate-900" htmlFor={`${skill.id}-name`}>
                              Nombre
                            </label>
                            <input
                              id={`${skill.id}-name`}
                              value={skill.name}
                              onChange={(event) => handleDraftTechnicalChange(skill.id, 'name', event.target.value)}
                              maxLength={50}
                              required
                              placeholder="Nueva habilidad"
                              className="mt-2 w-full rounded-2xl border border-[var(--umss-border)] bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[var(--umss-brand)] focus:outline-none"
                            />
                          </div>

                          <div className="w-full max-w-[180px]">
                            <label className="text-sm font-semibold text-slate-900" htmlFor={`${skill.id}-level`}>
                              Nivel
                            </label>
                            <select
                              id={`${skill.id}-level`}
                              value={skill.level}
                              onChange={(event) => handleDraftTechnicalChange(skill.id, 'level', event.target.value)}
                              className="mt-2 w-full rounded-2xl border border-[var(--umss-border)] bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[var(--umss-brand)] focus:outline-none"
                            >
                              {levelOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-900">Dominio</p>
                            <span className="text-sm font-medium text-[var(--umss-brand)]">
                              {skill.progress}%
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
                              style={{ width: `${skill.progress}%` }}
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
                            {skill.progress}%
                          </span>
                        </div>
                        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white p-1 shadow-inner">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] via-[var(--umss-brand)] to-[var(--umss-accent)]"
                            style={{ width: `${skill.progress}%` }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        ) : null}

        {showSoft ? (
          <DashboardCard
            title="Habilidades Blandas"
            description="Competencias interpersonales y de trabajo."
            action={
              editMode ? (
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--umss-lavender)] text-[var(--umss-brand)] transition hover:bg-[rgba(80,72,229,0.18)]"
                  aria-label="Agregar habilidad blanda"
                  onClick={handleAddSoftSkill}
                >
                  <Plus className="h-4 w-4" />
                </button>
              ) : null
            }
          >
            {filteredSoftSkills.length === 0 ? (
              <EmptySkillsState isSearching={Boolean(query)} />
            ) : (
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
                        aria-label={`Eliminar ${skill.name || 'habilidad blanda'}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}

                    {editMode ? (
                      <>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <label className="text-sm font-semibold text-slate-900" htmlFor={`${skill.id}-name`}>
                              Nombre
                            </label>
                            <input
                              id={`${skill.id}-name`}
                              value={skill.name}
                              onChange={(event) => handleDraftSoftChange(skill.id, 'name', event.target.value)}
                              maxLength={50}
                              required
                              placeholder="Nueva habilidad blanda"
                              className="mt-2 w-full rounded-2xl border border-[var(--umss-border)] bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[var(--umss-brand)] focus:outline-none"
                            />
                          </div>

                          <div className="w-full max-w-[180px]">
                            <label className="text-sm font-semibold text-slate-900" htmlFor={`${skill.id}-level`}>
                              Nivel
                            </label>
                            <select
                              id={`${skill.id}-level`}
                              value={skill.level}
                              onChange={(event) => handleDraftSoftChange(skill.id, 'level', event.target.value)}
                              className="mt-2 w-full rounded-2xl border border-[var(--umss-border)] bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[var(--umss-brand)] focus:outline-none"
                            >
                              {levelOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-900">Dominio</p>
                            <span className="text-sm font-medium text-[var(--umss-brand)]">
                              {skill.progress}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={skill.progress}
                            onChange={(event) =>
                              handleDraftSoftChange(skill.id, 'progress', Number(event.target.value))
                            }
                            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--umss-border)] accent-[var(--umss-brand)]"
                          />
                          <div className="h-3 overflow-hidden rounded-full bg-white p-1 shadow-inner">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] via-[var(--umss-brand)] to-[var(--umss-accent)] transition-all"
                              style={{ width: `${skill.progress}%` }}
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
                            {skill.progress}%
                          </span>
                        </div>
                        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white p-1 shadow-inner">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] via-[var(--umss-brand)] to-[var(--umss-accent)]"
                            style={{ width: `${skill.progress}%` }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        ) : null}

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
              className={`inline-flex h-11 items-center justify-center rounded-2xl px-6 text-sm font-semibold shadow-sm transition ${
                isSaving
                  ? 'cursor-not-allowed bg-slate-300 text-slate-500'
                  : 'bg-[var(--umss-brand)] text-white hover:bg-[#4338CA]'
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
