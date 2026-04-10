import { getStoredAuthToken } from './auth';

export type EvidenceRecord = {
  id: number;
  title: string;
  type: string;
  status: string;
  file_url?: string | null;
  file_name?: string | null;
  mime?: string | null;
  size?: number | null;
  project?: {
    id?: number | null;
    name?: string | null;
    status?: string | null;
  };
  owner?: {
    name?: string | null;
    email?: string | null;
  };
  created_at?: string | null;
};

export type EvidencePage = {
  data: EvidenceRecord[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    last_page: number;
  };
};

function buildApiUrl(path: string) {
  const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || '';
  return `${apiBase}${path}`;
}

export async function fetchAdminEvidences(
  {
    status = 'en_revision',
    page = 1,
    perPage = 6,
  }: { status?: string; page?: number; perPage?: number },
  token = getStoredAuthToken()
) {
  if (!token) {
    throw new Error('No existe una sesion activa.');
  }

  const query = new URLSearchParams({
    status,
    page: String(page),
    per_page: String(perPage),
  }).toString();

  const response = await fetch(buildApiUrl(`/api/admin/evidences?${query}`), {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'No se pudo cargar la cola de evidencias.');
  }

  return response.json() as Promise<EvidencePage>;
}

export async function updateEvidenceStatus(
  evidenceId: number,
  status: 'en_revision' | 'verificado' | 'rechazado',
  token = getStoredAuthToken()
) {
  if (!token) {
    throw new Error('No existe una sesion activa.');
  }

  const response = await fetch(buildApiUrl(`/api/admin/evidences/${evidenceId}`), {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'No se pudo actualizar la evidencia.');
  }

  return response.json();
}
