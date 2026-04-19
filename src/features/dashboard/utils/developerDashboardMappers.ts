import type { ReactNode } from 'react';
import type { ProjectItem } from '@features/dashboard/components/ProjectsSection';
import type {
  DeveloperDashboardPayload,
  ProyectoRow,
  HabilidadRow,
  ExperienciaRow,
  FormacionRow,
} from '@features/dashboard/api/developerDashboard';
import { FileText, ShieldCheck, type LucideIcon } from 'lucide-react';

const ACCENT_PRESETS: Pick<ProjectItem, 'accentClassName' | 'themeClassName' | 'label'>[] = [
  {
    label: 'Stack',
    accentClassName: 'from-slate-100 via-slate-200 to-slate-300',
    themeClassName: 'bg-[rgba(56,189,248,0.12)] text-sky-600 border-sky-200',
  },
  {
    label: 'Web',
    accentClassName: 'from-violet-100 via-purple-100 to-fuchsia-100',
    themeClassName: 'bg-[rgba(168,85,247,0.12)] text-violet-600 border-violet-200',
  },
  {
    label: 'Dev',
    accentClassName: 'from-slate-100 via-slate-200 to-slate-300',
    themeClassName: 'bg-[rgba(34,197,94,0.12)] text-emerald-600 border-emerald-200',
  },
];

const ESTADO_LABEL: Record<string, string> = {
  en_desarrollo: 'EN DESARROLLO',
  completado: 'COMPLETADO',
  pausado: 'PAUSADO',
};

function formatShortDate(value: string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
}

function normalizeTags(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map(String).filter(Boolean);
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function mapProyectosToProjectItems(rows: ProyectoRow[]): ProjectItem[] {
  return rows.map((p, index) => {
    const preset = ACCENT_PRESETS[index % ACCENT_PRESETS.length];
    const tags = normalizeTags(p.tecnologias);
    const label = tags[0] ?? preset.label;
    return {
      id: String(p.id_proyecto),
      title: p.nombre_proyecto,
      subtitle: p.descripcion_proyecto || '',
      status: ESTADO_LABEL[p.estado_proyecto] ?? p.estado_proyecto.toUpperCase(),
      tags: tags.length > 0 ? tags : ['Proyecto'],
      label,
      accentClassName: preset.accentClassName,
      themeClassName: preset.themeClassName,
      visible: (p.visibilidad ?? 'publico') === 'publico',
      liveUrl: p.enlace_proyecto_activo || null,
      repoUrl: p.enlace_repositorio || null,
    };
  });
}

const NIVEL_ES: Record<string, string> = {
  basico: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
  experto: 'Experto',
};

const NIVEL_PROGRESS: Record<string, number> = {
  basico: 25,
  intermedio: 50,
  avanzado: 75,
  experto: 100,
};

export type TechnicalSkillState = {
  id: string;
  name: string;
  level: string;
  progress: number;
};

export type SoftSkillState = { id: string; name: string; progress: number };

export function mapHabilidades(rows: HabilidadRow[]): {
  technical: TechnicalSkillState[];
  soft: SoftSkillState[];
} {
  const technical: TechnicalSkillState[] = [];
  const soft: SoftSkillState[] = [];

  for (const h of rows) {
    const nivel = (h.nivel_dominio ?? 'intermedio').toLowerCase();
    if (h.tipo_habilidad === 'tecnica') {
      technical.push({
        id: `db-hab-${h.id_habilidad}`,
        name: h.nombre_habilidad,
        level: NIVEL_ES[nivel] ?? 'Intermedio',
        progress: h.porcentaje ?? NIVEL_PROGRESS[nivel] ?? 50,
      });
    } else {
      soft.push({
        id: `db-hab-${h.id_habilidad}`,
        name: h.nombre_habilidad,
        progress: h.porcentaje ?? 0,
      });
    }
  }

  return { technical, soft };
}

export type ExperienceRecord = {
  id: string;
  recordType: 'Experiencia' | 'Certificación';
  badge: string;
  title: string;
  description: string;
  tone: 'brand' | 'neutral' | 'success' | 'warning' | 'info';
  icon: LucideIcon;
  footer: string;
  fileSize?: string;
  evidenceUrl?: string;
  isCurrent?: boolean;
  durationYears?: string;
  position?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
};

function calculateDurationYears(start: string | null | undefined, end: string | null | undefined, isCurrent: boolean): string {
  if (!start) return '';
  const startDate = new Date(start);
  if (isNaN(startDate.getTime())) return '';
  
  const endDate = isCurrent ? new Date() : (end ? new Date(end) : new Date());
  if (isNaN(endDate.getTime())) return '';

  let years = endDate.getFullYear() - startDate.getFullYear();
  const m = endDate.getMonth() - startDate.getMonth();
  if (m < 0 || (m === 0 && endDate.getDate() < startDate.getDate())) {
    years--;
  }
  
  if (years < 0) return '';
  return years === 1 ? '1 año' : (years > 1 ? `${years} años` : '< 1 año');
}

const TONE_CYCLE: ExperienceRecord['tone'][] = [
  'brand',
  'neutral',
  'success',
  'warning',
  'info',
];

export function mapExperienciaYFormacion(
  experiencias: ExperienciaRow[],
  formaciones: FormacionRow[]
): ExperienceRecord[] {
  const exp: ExperienceRecord[] = experiencias.map((e, i) => {
    const isCurrent = !!e.es_trabajo_actual;
    return {
      id: `db-exp-${e.id_experiencia}`,
      recordType: 'Experiencia',
      badge: (e.tipo_experiencia || e.tipo_contrato || 'EXPERIENCIA').replace(/_/g, ' ').toUpperCase(),
      title: `${e.titulo_puesto} @ ${e.nombre_empresa}`,
      description: e.descripcion_puesto ?? '',
      tone: TONE_CYCLE[i % TONE_CYCLE.length],
      icon: FileText,
      footer: (e.fileSize || e.evidenceUrl) ? (e.fileSize ?? 'Documento adjunto') : 
        ([formatShortDate(e.fecha_inicio), formatShortDate(e.fecha_fin)]
          .filter(Boolean)
          .join(' — ') || (isCurrent ? 'Actualidad' : '')),
      fileSize: e.fileSize,
      evidenceUrl: e.evidenceUrl,
      isCurrent,
      durationYears: isCurrent ? '' : calculateDurationYears(e.fecha_inicio, e.fecha_fin, isCurrent),
      position: e.titulo_puesto,
      company: e.nombre_empresa,
      startDate: e.fecha_inicio,
      endDate: e.fecha_fin,
    };
  });

  const cert: ExperienceRecord[] = formaciones.map((f, i) => {
    const isCurrent = !!f.actualmente_estudiante;
    return {
      id: `db-form-${f.id_formacion}`,
      recordType: 'Certificación',
      badge: (f.tipo_formacion || f.nivel_estudio || 'CERTIFICACIÓN').replace(/_/g, ' ').toUpperCase(),
      title: f.carrera_especialidad,
      description: [f.institucion, f.descripcion].filter(Boolean).join(' · ') || f.institucion,
      tone: TONE_CYCLE[(i + exp.length) % TONE_CYCLE.length],
      icon: ShieldCheck,
      footer: (f.fileSize || f.evidenceUrl) ? (f.fileSize ?? 'Documento adjunto') : (f.visibilidad === 'privado' ? 'Privado' : 'Público'),
      fileSize: f.fileSize,
      evidenceUrl: f.evidenceUrl,
      isCurrent,
      position: f.carrera_especialidad,
      company: f.institucion,
      startDate: f.fecha_inicio,
      endDate: f.fecha_fin,
    };
  });

  return [...exp, ...cert];
}

export type OverviewMetric = {
  label: string;
  value: string;
  iconId: 'folder' | 'sparkles' | 'briefcase';
  trend: string;
  trendTone: 'success' | 'warning' | 'info';
};

export type OverviewRecentProject = {
  id: string;
  name: string;
  stack: string;
  updatedAt: string;
  accentClassName: string;
};

export function buildOverviewMetrics(
  payload: DeveloperDashboardPayload
): OverviewMetric[] {
  const nProj = payload.proyectos?.length ?? 0;
  const nSkills = payload.habilidades?.length ?? 0;
  const nExperience = (payload.experiencias?.length ?? 0) + (payload.formaciones?.length ?? 0);
  
  return [
    {
      label: 'Total de Proyectos',
      value: String(nProj),
      iconId: 'folder',
      trend: nProj > 0 ? 'Activo' : 'Sin datos',
      trendTone: nProj > 0 ? 'success' : 'info',
    },
    {
      label: 'Habilidades',
      value: String(nSkills),
      iconId: 'sparkles',
      trend: nSkills > 0 ? 'Activo' : 'Sin datos',
      trendTone: nSkills > 0 ? 'success' : 'info',
    },
    {
      label: 'Trayectoria',
      value: String(nExperience),
      iconId: 'briefcase',
      trend: nExperience > 0 ? 'Verificada' : 'Por completar',
      trendTone: nExperience > 0 ? 'success' : 'warning',
    },
  ];
}

export function buildRecentProjects(rows: ProyectoRow[]): OverviewRecentProject[] {
  const sorted = [...rows].sort((a, b) => {
    const ta = a.fecha_creacion ? new Date(a.fecha_creacion).getTime() : 0;
    const tb = b.fecha_creacion ? new Date(b.fecha_creacion).getTime() : 0;
    return tb - ta;
  });
   return sorted.slice(0, 4).map((p, i) => {
    const t = normalizeTags(p.tecnologias);
    const stack = t[0] ?? 'Proyecto';
    const accents = [
      'bg-[rgba(80,72,229,0.12)] text-[var(--umss-brand)]',
      'bg-[rgba(16,185,129,0.12)] text-[var(--umss-success)]',
    ];
    return {
      id: String(p.id_proyecto),
      name: p.nombre_proyecto,
      stack,
      updatedAt: p.fecha_creacion
        ? `Actualizado ${formatShortDate(p.fecha_creacion)}`
        : 'Sin fecha',
      accentClassName: accents[i % accents.length],
    };
  });
}

export function buildTopSkillBadges(habilidades: HabilidadRow[], limit = 6): string[] {
  return habilidades
    .filter((h) => h.tipo_habilidad === 'tecnica')
    .slice(0, limit)
    .map((h) => h.nombre_habilidad);
}

export function estimateProfileCompletion(payload: DeveloperDashboardPayload): number {
  const u = payload.usuario;
  if (!u) return 10;
  let score = 20;
  const checks = [
    u.nombre_completo,
    u.correo,
    u.profesion,
    u.biografia,
    u.telefono,
    payload.portafolio,
    (payload.proyectos?.length ?? 0) > 0,
    (payload.habilidades?.length ?? 0) > 0,
    (payload.experiencias?.length ?? 0) > 0,
  ];
  const per = 80 / checks.length;
  for (const c of checks) {
    if (c) score += per;
  }
  return Math.min(100, Math.round(score));
}

export function splitNombreCompleto(full: string): {
  firstName: string;
  lastName: string;
  maternalLastName: string;
} {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: '', lastName: '', maternalLastName: '' };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '', maternalLastName: '' };
  }
  if (parts.length === 2) {
    return { firstName: parts[0], lastName: parts[1], maternalLastName: '' };
  }
  return {
    firstName: parts[0],
    lastName: parts[1],
    maternalLastName: parts.slice(2).join(' '),
  };
}

function findRedUrl(
  redes: DeveloperDashboardPayload['redes'],
  needles: string[]
): string {
  const lower = needles.map((n) => n.toLowerCase());
  const hit = redes.find((r) => {
    const name = (r.nombre_red ?? '').toLowerCase();
    return lower.some((n) => name.includes(n));
  });
  return hit?.enlace_perfil ?? '';
}

export type SettingsProfileState = {
  firstName: string;
  lastName: string;
  maternalLastName: string;
  role: string;
  bio: string;
  github: string;
  linkedin: string;
  website: string;
  phone: string;
  email: string;
  password: string;
  newPassword: string;
  avatar: string | null;
};

export function buildSettingsProfile(payload: DeveloperDashboardPayload): SettingsProfileState {
  const auth = payload.auth_user;
  const u = payload.usuario;
  const name = typeof u?.nombre_completo === 'string' ? u.nombre_completo : auth.name;
  const { firstName, lastName, maternalLastName } = splitNombreCompleto(name);
  const redes = payload.redes ?? [];

  return {
    firstName,
    lastName,
    maternalLastName,
    role: typeof u?.profesion === 'string' && u.profesion ? u.profesion : 'Desarrollador',
    bio: typeof u?.biografia === 'string' ? u.biografia : '',
    github: findRedUrl(redes, ['github', 'git']),
    linkedin: findRedUrl(redes, ['linkedin']),
    website: findRedUrl(redes, ['web', 'sitio', 'portfolio', 'portafolio']),
    phone: typeof u?.telefono === 'string' ? u.telefono : '',
    email: auth.email,
    password: '**********',
    newPassword: '',
    avatar: (u?.fotografiaUrl as string | undefined) ?? null,
  };
}

export type VisibilityHighlightsState = {
  projects: string[];
  skills: string[];
  trajectory: string[];
};

export function buildVisibilityHighlights(payload: DeveloperDashboardPayload): VisibilityHighlightsState {
  const u = payload.usuario as Record<string, unknown> | null;

  // Read the highlights_json column saved by syncHighlights
  const raw = u?.highlights_json;
  if (raw && typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw) as { projects?: unknown; skills?: unknown; trajectory?: unknown };
      const toStringArray = (v: unknown) => Array.isArray(v) ? v.map(String).filter(Boolean) : [];
      const projects   = toStringArray(parsed.projects);
      const skills     = toStringArray(parsed.skills);
      const trajectory = toStringArray(parsed.trajectory);
      if (projects.length > 0 || skills.length > 0 || trajectory.length > 0) {
        return { projects, skills, trajectory };
      }
    } catch { /* fall through to derived */ }
  }

  // Fallback: derive from existing data (first time / highlights_json not yet saved)
  const proyectos = payload.proyectos?.slice(0, 3).map((p) => p.nombre_proyecto) ?? [];
  const skills = payload.habilidades
    ?.filter((h) => h.tipo_habilidad === 'tecnica')
    .slice(0, 3)
    .map((h) => h.nombre_habilidad) ?? [];
  const tray: string[] = [];
  for (const e of payload.experiencias?.slice(0, 2) ?? []) {
    tray.push(`${e.titulo_puesto} @ ${e.nombre_empresa}`);
  }
  for (const f of payload.formaciones?.slice(0, 1) ?? []) {
    tray.push(`${f.carrera_especialidad} · ${f.institucion}`);
  }

  return {
    projects:   proyectos,
    skills:     skills,
    trajectory: tray,
  };
}

export function welcomeFirstName(payload: DeveloperDashboardPayload): string {
  const u = payload.usuario;
  const full =
    typeof u?.nombre_completo === 'string' && u.nombre_completo
      ? u.nombre_completo
      : payload.auth_user.name;
  return splitNombreCompleto(full).firstName || full.split(' ')[0] || 'desarrollador';
}

export function sidebarHeadline(payload: DeveloperDashboardPayload): string {
  const prof = payload.usuario?.profesion;
  if (typeof prof === 'string' && prof.trim()) {
    return prof;
  }
  return payload.auth_user.role === 'desarrollador' ? 'Desarrollador' : payload.auth_user.role;
}
