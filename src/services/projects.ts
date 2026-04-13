import { getStoredAuthToken } from './auth';

type CreateProjectPayload = {
  name: string;
  description: string;
  role?: string;
  repo_url?: string;
  live_url?: string;
  visibility?: 'publico' | 'privado';
  start_date?: string;
  end_date?: string;
  technologies?: string[];
  evidences: File[];
};

function buildApiUrl(path: string) {
  const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || '';
  return `${apiBase}${path}`;
}

export async function createProject(payload: CreateProjectPayload, token = getStoredAuthToken()) {
  if (!token) {
    throw new Error('No existe una sesion activa.');
  }

  const form = new FormData();
  form.append('name', payload.name);
  form.append('description', payload.description);

  if (payload.role) form.append('role', payload.role);
  if (payload.repo_url) form.append('repo_url', payload.repo_url);
  if (payload.live_url) form.append('live_url', payload.live_url);
  if (payload.visibility) form.append('visibility', payload.visibility);
  if (payload.start_date) form.append('start_date', payload.start_date);
  if (payload.end_date) form.append('end_date', payload.end_date);

  (payload.technologies || []).forEach((tech) => form.append('technologies[]', tech));
  payload.evidences.forEach((file) => form.append('evidences[]', file));

  const response = await fetch(buildApiUrl('/api/projects'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!response.ok) {
    const raw = await response.text();
    let message = raw;
    try {
      const parsed = JSON.parse(raw) as { message?: string };
      message = parsed.message || raw;
    } catch {
      // ignore parse errors
    }
    throw new Error(message || 'No se pudo crear el proyecto.');
  }

  return response.json();
}

export async function uploadProjectEvidence(projectId: string, files: File[], token = getStoredAuthToken()) {
  if (!token) {
    throw new Error('No existe una sesion activa.');
  }

  const form = new FormData();
  files.forEach((file) => form.append('evidences[]', file));

  const response = await fetch(buildApiUrl(`/api/projects/${projectId}/evidences`), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!response.ok) {
    const raw = await response.text();
    let message = raw;
    try {
      const parsed = JSON.parse(raw) as { message?: string };
      message = parsed.message || raw;
    } catch {
      // ignore parse errors
    }
    throw new Error(message || 'No se pudo subir la evidencia.');
  }

  return response.json();
}

export async function updateEvidence(evidenceId: string, data: any, token = getStoredAuthToken()) {
  if (!token) {
    throw new Error('No existe una sesion activa.');
  }

  const response = await fetch(buildApiUrl(`/api/developer/evidencias/${evidenceId}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const raw = await response.text();
    let message = raw;
    try {
      const parsed = JSON.parse(raw) as { message?: string };
      message = parsed.message || raw;
    } catch {
      // ignore
    }
    throw new Error(message || 'No se pudo actualizar la evidencia.');
  }

  return response.json();
}
