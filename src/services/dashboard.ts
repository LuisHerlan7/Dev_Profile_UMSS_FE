import { getStoredAuthToken } from './auth';

export type DeveloperMetricData = {
  projects: number;
  skills: number;
  profile_views: number;
};

export type DeveloperProfileData = {
  completion: number;
  next_step: string;
};

export type DeveloperRecentProject = {
  id: string;
  name: string;
  stack: string;
  updated_at: string;
};

export type DeveloperSkill = {
  name: string;
  level: string;
  progress: number;
};

export type DeveloperDashboardData = {
  metrics: DeveloperMetricData;
  profile: DeveloperProfileData;
  recent_projects: DeveloperRecentProject[];
  projects: Array<{
    id: string;
    title: string;
    category: string;
    summary: string;
    role: string;
    tags: string[];
    status: 'en_revision' | 'verificado' | 'rechazado' | string;
    evidence_summary: {
      total: number;
      pending: number;
      verified: number;
      rejected: number;
    };
  }>;
  evidences: Array<{
    id: string;
    title: string;
    type: 'imagen' | 'documento' | 'video' | 'enlace' | string;
    status: 'en_revision' | 'verificado' | 'rechazado' | string;
    file_url?: string | null;
    project: string;
    created_at?: string | null;
  }>;
  skills: {
    technical: DeveloperSkill[];
    soft: string[];
  };
  experience: Array<{
    id: string;
    type: 'work' | 'study';
    title: string;
    subtitle: string;
    period: string;
    description: string;
  }>;
};

export type AdminDashboardData = {
  stats: {
    total_users: number;
    developers: number;
    recruiters: number;
    suspended: number;
    admins: number;
  };
  system: {
    active_portfolios: number;
    system_load: number | null;
    pending_reports: number;
  };
  recent_users: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string | null;
  }>;
  moderation: {
    pending: number;
    verified: number;
    rejected: number;
    latest: Array<{
      id: number;
      title: string;
      type: string;
      status: string;
      file_url?: string | null;
      project?: string | null;
      owner?: string | null;
      created_at?: string | null;
    }>;
  };
  analytics: {
    technology_popularity: Array<{
      label: string;
      count: number;
      percentage: number;
    }>;
    user_growth: Array<{
      label: string;
      value: number;
    }>;
    project_status: Array<{
      label: string;
      value: number;
    }>;
    evidence_status: Array<{
      label: string;
      value: number;
    }>;
  };
  security: Array<{
    title: string;
    user: string;
    details: string;
    date?: string | null;
  }>;
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const rawBody = await response.text();

  if (!rawBody) {
    return {} as T;
  }

  try {
    return JSON.parse(rawBody) as T;
  } catch {
    return {} as T;
  }
}

function buildApiUrl(path: string) {
  const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || '';
  return `${apiBase}${path}`;
}

export async function fetchDeveloperDashboard(token = getStoredAuthToken()) {
  if (!token) {
    throw new Error('No existe una sesion activa.');
  }

  const response = await fetch(buildApiUrl('/api/dashboard/developer'), {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await parseJsonResponse<DeveloperDashboardData>(response);

  if (!response.ok) {
    throw new Error('No se pudo cargar el dashboard del desarrollador.');
  }

  return data;
}

export async function fetchAdminDashboard(token = getStoredAuthToken()) {
  if (!token) {
    throw new Error('No existe una sesion activa.');
  }

  const response = await fetch(buildApiUrl('/api/admin/dashboard'), {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await parseJsonResponse<AdminDashboardData>(response);

  if (!response.ok) {
    throw new Error('No se pudo cargar el dashboard de administracion.');
  }

  return data;
}
