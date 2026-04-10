export type DeveloperDashboardPayload = {
  auth_user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  usuario: Record<string, unknown> | null;
  portafolio: Record<string, unknown> | null;
  proyectos: ProyectoRow[];
  habilidades: HabilidadRow[];
  experiencias: ExperienciaRow[];
  formaciones: FormacionRow[];
  visibilidad: Record<string, unknown> | null;
  redes: RedProfesionalRow[];
};

export type ProyectoRow = {
  id_proyecto: number;
  id_portafolio: number | null;
  nombre_proyecto: string;
  descripcion_proyecto: string;
  descripcion_tecnica: string | null;
  fecha_fin: string | null;
  enlace_repositorio: string | null;
  enlace_proyecto_activo: string | null;
  estado_proyecto: string;
  rol_desarrollador: string | null;
  fecha_inicio: string | null;
  visibilidad: string;
  fecha_creacion: string | null;
  tecnologias: string[];
  evidenceUrl?: string;
  fileSize?: string;
};

export type HabilidadRow = {
  id_habilidad: number;
  id_usuario: number | null;
  nombre_habilidad: string;
  tipo_habilidad: string;
  descripcion: string | null;
  nivel_dominio: string | null;
  anos_experiencia: number | null;
  fecha_adquisicion: string | null;
  estado: string | null;
};

export type ExperienciaRow = {
  id_experiencia: number;
  titulo_puesto: string;
  id_usuario: number | null;
  nombre_empresa: string;
  descripcion_puesto: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  es_trabajo_actual: boolean;
  ubicacion: string | null;
  tipo_contrato: string | null;
  visibilidad: string | null;
  evidenceUrl?: string;
  fileSize?: string;
};

export type FormacionRow = {
  id_formacion: number;
  id_usuario: number | null;
  institucion: string;
  nivel_estudio: string;
  carrera_especialidad: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  actualmente_estudiante: boolean;
  descripcion: string | null;
  visibilidad: string | null;
  evidenceUrl?: string;
  fileSize?: string;
};

export type RedProfesionalRow = {
  id_red: number;
  nombre_red: string;
  enlace_perfil: string;
  usuario_red: string | null;
};

export async function fetchDeveloperDashboard(): Promise<DeveloperDashboardPayload> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    throw new Error('No hay sesión.');
  }

  const res = await fetch('/api/developer/dashboard', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (res.status === 401) {
    throw new Error('Sesión expirada.');
  }

  if (res.status === 403) {
    throw new Error('No tienes permiso para este panel.');
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Error al cargar el panel.');
  }

  return res.json() as Promise<DeveloperDashboardPayload>;
}

// Helper para llamadas con FormData
async function fetchWithFormData(url: string, method: string, formData: FormData) {
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('No hay sesión.');

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Error al guardar los datos.');
  }

  return res.json();
}

export async function saveExperience(formData: FormData) {
  return fetchWithFormData('/api/developer/experiencia', 'POST', formData);
}

export async function deleteExperience(id: string | number) {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(`/api/developer/experiencia/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al eliminar experiencia');
  return res.json();
}

export async function saveFormation(formData: FormData) {
  return fetchWithFormData('/api/developer/formacion', 'POST', formData);
}

export async function deleteFormation(id: string | number) {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(`/api/developer/formacion/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al eliminar formación');
  return res.json();
}

export async function saveProject(formData: FormData) {
  return fetchWithFormData('/api/developer/proyecto', 'POST', formData);
}

export async function deleteProject(id: string | number) {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(`/api/developer/proyecto/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al eliminar proyecto');
  return res.json();
}

export async function updateAvatar(formData: FormData) {
  return fetchWithFormData('/api/developer/settings/avatar', 'POST', formData);
}

export async function updateProfile(payload: {
  firstName: string;
  lastName?: string;
  maternalLastName?: string;
  role?: string;
  bio?: string;
}) {
  const token = localStorage.getItem('auth_token');
  const res = await fetch('/api/developer/settings/profile', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al actualizar perfil');
  return res.json();
}

export async function syncSkills(payload: {
  technical: { name: string; level: string; progress: number }[];
  soft: { name: string }[];
}) {
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('No hay sesión.');

  const res = await fetch('/api/developer/habilidades/sync', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Error al guardar habilidades.');
  }

  return res.json();
}
