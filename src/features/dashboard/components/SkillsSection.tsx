import { useEffect, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { DashboardCard } from '@shared/components/dashboard/DashboardCard';
import { SectionHeading } from './SectionHeading';
import type {
  SkillReferenceState,
  SoftSkillState,
  TechnicalSkillState,
} from '@features/dashboard/utils/developerDashboardMappers';

const levelOptions = ['Principiante', 'Intermedio', 'Avanzado', 'Experto'] as const;

type SkillFilter = 'all' | 'technical' | 'soft';
type LinkKind = 'project' | 'experience' | 'formation';

type ReferenceCandidate = {
  id: string;
  label: string;
  description?: string;
  tags?: string[];
};

function normalizeSkillName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function normalizeSearchValue(value: string) {
  return normalizeSkillName(value).toLocaleLowerCase('es');
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

function nextLinkId(skillId: string) {
  return `link-${skillId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function prepareTechnicalSkills(skills: TechnicalSkillState[]) {
  return sortSkills(
    skills.map((skill) => ({
      ...skill,
      name: normalizeSkillName(skill.name),
      links: skill.links ?? [],
    }))
  );
}

function prepareSoftSkills(skills: SoftSkillState[]) {
  return sortSkills(
    skills.map((skill) => ({
      ...skill,
      name: normalizeSkillName(skill.name),
      links: skill.links ?? [],
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
  availableProjects = [],
  availableExperience = [],
  availableFormations = [],
  onDataDirty,
}: {
  serverTechnical?: TechnicalSkillState[];
  serverSoft?: SoftSkillState[];
  availableProjects?: ReferenceCandidate[];
  availableExperience?: ReferenceCandidate[];
  availableFormations?: ReferenceCandidate[];
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
  const [linkDrafts, setLinkDrafts] = useState<Record<string, string>>({});
  const [linkErrors, setLinkErrors] = useState<Record<string, string>>({});

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
    setLinkDrafts({});
    setLinkErrors({});
    setSaveError('');
    setSaveSuccess('');
    setEditMode(true);
  };

  const cancelEdit = () => {
    setDraftTechnicalSkills(technicalSkills);
    setDraftSoftSkills(softSkills);
    setLinkDrafts({});
    setLinkErrors({});
    setSaveError('');
    setSaveSuccess('');
    setEditMode(false);
  };

  const getProjectSuggestions = (skillName: string, draftValue: string) => {
    const normalizedSkill = normalizeSearchValue(skillName);
    const normalizedDraft = normalizeSearchValue(draftValue);

    return availableProjects.filter((project) => {
      const matchesSkill = (project.tags ?? []).some((tag) => normalizeSearchValue(tag) === normalizedSkill);
      const matchesDraft =
        !normalizedDraft
        || normalizeSearchValue(project.label).includes(normalizedDraft)
        || (project.tags ?? []).some((tag) => normalizeSearchValue(tag).includes(normalizedDraft));

      return matchesSkill && matchesDraft;
    });
  };

  const getNarrativeSuggestions = (
    source: ReferenceCandidate[],
    skillName: string,
    draftValue: string
  ) => {
    const normalizedSkill = normalizeSearchValue(skillName);
    const normalizedDraft = normalizeSearchValue(draftValue);

    return source.filter((item) => {
      const searchable = `${item.label} ${item.description ?? ''}`;
      const normalizedSearchable = normalizeSearchValue(searchable);
      const matchesSkill = normalizedSearchable.includes(normalizedSkill);
      const matchesDraft = !normalizedDraft || normalizedSearchable.includes(normalizedDraft);
      return matchesSkill && matchesDraft;
    });
  };

  const getAllowedCandidates = (
    skillName: string,
    linkType: LinkKind
  ): ReferenceCandidate[] => {
    if (linkType === 'project') {
      return getProjectSuggestions(skillName, '');
    }
    if (linkType === 'experience') {
      return getNarrativeSuggestions(availableExperience, skillName, '');
    }
    return getNarrativeSuggestions(availableFormations, skillName, '');
  };

  const setLinkDraft = (skillId: string, value: string) => {
    setLinkDrafts((current) => ({ ...current, [skillId]: value }));
  };

  const clearLinkFeedback = (skillId: string) => {
    setLinkErrors((current) => ({ ...current, [skillId]: '' }));
  };

  const attachLink = (
    skillId: string,
    skillName: string,
    linkType: LinkKind,
    currentLinks: SkillReferenceState[],
    onChange: (links: SkillReferenceState[]) => void
  ) => {
    const draftValue = (linkDrafts[skillId] ?? '').trim();
    const candidates = getAllowedCandidates(skillName, linkType);
    const selected = candidates.find(
      (candidate) => normalizeSearchValue(candidate.label) === normalizeSearchValue(draftValue)
    );

    if (!selected) {
      const message =
        linkType === 'project'
          ? `Ese proyecto no usa ${skillName}.`
          : linkType === 'experience'
            ? `Esa experiencia no parece tratar de ${skillName}.`
            : `Esa certificación no parece respaldar ${skillName}.`;
      setLinkErrors((current) => ({ ...current, [skillId]: message }));
      return;
    }

    if (currentLinks.some((link) => link.referenceType === linkType && link.referenceId === Number(selected.id))) {
      setLinkErrors((current) => ({ ...current, [skillId]: 'Ese vínculo ya fue agregado.' }));
      return;
    }

    onChange([
      ...currentLinks,
      {
        id: nextLinkId(skillId),
        referenceType: linkType,
        label: selected.label,
        referenceId: Number(selected.id),
      },
    ]);

    setLinkDrafts((current) => ({ ...current, [skillId]: '' }));
    clearLinkFeedback(skillId);
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
          links: skill.links.map((link) => ({
            referenceType: link.referenceType === 'project' ? 'project' : 'formation',
            referenceId: link.referenceId,
            label: link.label,
          })),
        })),
        soft: nextSoftSkills.map((skill) => ({
          name: skill.name,
          level: skill.level,
          progress: skill.progress,
          links: skill.links.map((link) => ({
            referenceType: link.referenceType === 'experience' ? 'experience' : 'formation',
            referenceId: link.referenceId,
            label: link.label,
          })),
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
    field: 'name' | 'level' | 'progress' | 'links',
    value: string | number | SkillReferenceState[]
  ) => {
    setDraftTechnicalSkills((current) =>
      current.map((skill) => {
        if (skill.id !== id) return skill;

        if (field === 'progress') {
          return { ...skill, progress: Number(value) };
        }

        if (field === 'level') {
          return { ...skill, level: String(value) };
        }

        if (field === 'links') {
          return { ...skill, links: value as SkillReferenceState[] };
        }

        return { ...skill, name: String(value).slice(0, 50) };
      })
    );
  };

  const handleDraftSoftChange = (
    id: string,
    field: 'name' | 'level' | 'progress' | 'links',
    value: string | number | SkillReferenceState[]
  ) => {
    setDraftSoftSkills((current) =>
      current.map((skill) => {
        if (skill.id !== id) return skill;

        if (field === 'progress') {
          return { ...skill, progress: Number(value) };
        }

        if (field === 'level') {
          return { ...skill, level: String(value) };
        }

        if (field === 'links') {
          return { ...skill, links: value as SkillReferenceState[] };
        }

        return { ...skill, name: String(value).slice(0, 50) };
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
        links: [],
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
        links: [],
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
      !query
      || skill.name.toLocaleLowerCase('es').includes(query)
      || skill.level.toLocaleLowerCase('es').includes(query)
  );

  const filteredSoftSkills = activeSoftSkills.filter(
    (skill) =>
      !query
      || skill.name.toLocaleLowerCase('es').includes(query)
      || skill.level.toLocaleLowerCase('es').includes(query)
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
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    editMode={editMode}
                    linkDraft={linkDrafts[skill.id] ?? ''}
                    linkError={linkErrors[skill.id] ?? ''}
                    linkPlaceholder="Buscar proyecto o certificación..."
                    suggestedLinks={{
                      project: getProjectSuggestions(skill.name, linkDrafts[skill.id] ?? ''),
                      formation: getNarrativeSuggestions(availableFormations, skill.name, linkDrafts[skill.id] ?? ''),
                    }}
                    onLinkDraftChange={(value) => setLinkDraft(skill.id, value)}
                    onLinkRemove={(linkId) =>
                      handleDraftTechnicalChange(
                        skill.id,
                        'links',
                        skill.links.filter((link) => link.id !== linkId)
                      )
                    }
                    onAttachLink={(linkType) =>
                      attachLink(
                        skill.id,
                        skill.name,
                        linkType,
                        skill.links,
                        (links) => handleDraftTechnicalChange(skill.id, 'links', links)
                      )
                    }
                    onDelete={() => handleDeleteTechnicalSkill(skill.id)}
                    onChange={(field, value) => handleDraftTechnicalChange(skill.id, field, value)}
                    linkSummaryTitle="Vinculos con proyectos o certificaciones"
                  />
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
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    editMode={editMode}
                    linkDraft={linkDrafts[skill.id] ?? ''}
                    linkError={linkErrors[skill.id] ?? ''}
                    linkPlaceholder="Buscar experiencia o certificación..."
                    suggestedLinks={{
                      experience: getNarrativeSuggestions(availableExperience, skill.name, linkDrafts[skill.id] ?? ''),
                      formation: getNarrativeSuggestions(availableFormations, skill.name, linkDrafts[skill.id] ?? ''),
                    }}
                    onLinkDraftChange={(value) => setLinkDraft(skill.id, value)}
                    onLinkRemove={(linkId) =>
                      handleDraftSoftChange(
                        skill.id,
                        'links',
                        skill.links.filter((link) => link.id !== linkId)
                      )
                    }
                    onAttachLink={(linkType) =>
                      attachLink(
                        skill.id,
                        skill.name,
                        linkType,
                        skill.links,
                        (links) => handleDraftSoftChange(skill.id, 'links', links)
                      )
                    }
                    onDelete={() => handleDeleteSoftSkill(skill.id)}
                    onChange={(field, value) => handleDraftSoftChange(skill.id, field, value)}
                    linkSummaryTitle="Vinculos con experiencia o certificaciones"
                  />
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

function SkillCard({
  skill,
  editMode,
  linkDraft,
  linkError,
  linkPlaceholder,
  suggestedLinks,
  onLinkDraftChange,
  onLinkRemove,
  onAttachLink,
  onDelete,
  onChange,
  linkSummaryTitle,
}: {
  skill: TechnicalSkillState | SoftSkillState;
  editMode: boolean;
  linkDraft: string;
  linkError: string;
  linkPlaceholder: string;
  suggestedLinks: Partial<Record<LinkKind, ReferenceCandidate[]>>;
  onLinkDraftChange: (value: string) => void;
  onLinkRemove: (linkId: string) => void;
  onAttachLink: (linkType: LinkKind) => void;
  onDelete: () => void;
  onChange: (
    field: 'name' | 'level' | 'progress' | 'links',
    value: string | number | SkillReferenceState[]
  ) => void;
  linkSummaryTitle: string;
}) {
  const suggestionEntries = Object.entries(suggestedLinks) as Array<[LinkKind, ReferenceCandidate[]]>;

  return (
    <div
      key={skill.id}
      id={`skill-${skill.id}`}
      className="relative rounded-[24px] border border-[var(--umss-border)] bg-[var(--umss-surface)] p-4"
    >
      {editMode ? (
        <button
          type="button"
          onClick={onDelete}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-500 transition hover:bg-[rgba(15,23,42,0.06)]"
          aria-label={`Eliminar ${skill.name || 'habilidad'}`}
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
                onChange={(event) => onChange('name', event.target.value)}
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
                onChange={(event) => onChange('level', event.target.value)}
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
              onChange={(event) => onChange('progress', Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--umss-border)] accent-[var(--umss-brand)]"
            />
            <div className="h-3 overflow-hidden rounded-full bg-white p-1 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] via-[var(--umss-brand)] to-[var(--umss-accent)] transition-all"
                style={{ width: `${skill.progress}%` }}
              />
            </div>
          </div>

          <div className="mt-5 rounded-[22px] border border-[var(--umss-border)] bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">{linkSummaryTitle}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {skill.links.length > 0 ? (
                skill.links.map((link) => (
                  <span key={link.id} className="inline-flex items-center gap-2 rounded-full bg-[var(--umss-lavender)] px-3 py-1 text-xs font-semibold text-[var(--umss-brand)]">
                    {link.label}
                    <button type="button" onClick={() => onLinkRemove(link.id)} className="rounded-full">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">Sin vínculos todavía.</span>
              )}
            </div>

            <input
              value={linkDraft}
              onChange={(event) => onLinkDraftChange(event.target.value)}
              placeholder={linkPlaceholder}
              className="mt-4 w-full rounded-2xl border border-[var(--umss-border)] bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[var(--umss-brand)] focus:outline-none"
            />

            {linkError ? (
              <p className="mt-2 text-xs font-medium text-red-600">{linkError}</p>
            ) : null}

            <div className="mt-3 space-y-3">
              {suggestionEntries.map(([linkType, items]) => (
                items.length > 0 ? (
                  <div key={linkType}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {linkType === 'project' ? 'Proyectos sugeridos' : linkType === 'experience' ? 'Experiencias sugeridas' : 'Certificaciones sugeridas'}
                      </p>
                      <button
                        type="button"
                        onClick={() => onAttachLink(linkType)}
                        className="text-xs font-semibold text-[var(--umss-brand)]"
                      >
                        Agregar texto escrito
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {items.slice(0, 6).map((item) => (
                        <button
                          key={`${linkType}-${item.id}`}
                          type="button"
                          onClick={() => {
                            onLinkDraftChange(item.label);
                            setTimeout(() => onAttachLink(linkType), 0);
                          }}
                          className="rounded-full border border-[var(--umss-border)] bg-[var(--umss-surface)] px-3 py-1 text-xs font-semibold text-slate-700 hover:border-[var(--umss-brand)] hover:text-[var(--umss-brand)]"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null
              ))}
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
          {skill.links.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {skill.links.map((link) => (
                <span key={link.id} className="rounded-full bg-[var(--umss-lavender)] px-3 py-1 text-xs font-semibold text-[var(--umss-brand)]">
                  {link.label}
                </span>
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
