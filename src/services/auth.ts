export type UserRole = 'desarrollador' | 'visitante' | 'admin' | 'administrador' | string;

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  provider?: string | null;
};

export type DashboardSection = {
  id: string;
  label: string;
};

export type DashboardPayload = {
  type: string;
  route: string;
  title: string;
  subtitle: string;
  profile_role_label: string;
  profile_badge?: string;
  welcome_title: string;
  welcome_message: string;
  sections: DashboardSection[];
};

export type AuthSession = {
  token?: string;
  user: AuthUser;
  dashboard?: DashboardPayload;
};

type AuthApiResponse = AuthSession & {
  message?: string;
  errors?: Record<string, string[]>;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  role: 'desarrollador' | 'visitante';
  password: string;
  password_confirmation: string;
};

const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || '';
const TOKEN_STORAGE_KEY = 'auth_token';
const USER_STORAGE_KEY = 'auth_user';
const DASHBOARD_STORAGE_KEY = 'auth_dashboard';

function buildApiUrl(path: string) {
  return `${apiBase}${path}`;
}

function getStorage() {
  return typeof window !== 'undefined' ? window.localStorage : null;
}

function readJsonStorage<T>(key: string): T | null {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  const rawValue = storage.getItem(key);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    storage.removeItem(key);
    return null;
  }
}

async function parseJsonResponse(response: Response): Promise<AuthApiResponse> {
  const rawBody = await response.text();

  if (!rawBody) {
    return {} as AuthApiResponse;
  }

  try {
    return JSON.parse(rawBody) as AuthApiResponse;
  } catch {
    return {
      message: rawBody,
    } as AuthApiResponse;
  }
}

export function extractErrorMessage(
  payload: Pick<AuthApiResponse, 'message' | 'errors'> | null | undefined,
  fallback: string
) {
  const firstValidationError = payload?.errors ? Object.values(payload.errors)[0] : null;
  const validationMessage = Array.isArray(firstValidationError) ? firstValidationError[0] : null;

  return validationMessage || payload?.message || fallback;
}

export function getStoredAuthToken() {
  const storage = getStorage();

  return storage?.getItem(TOKEN_STORAGE_KEY) || '';
}

export function readStoredAuthSession(): AuthSession | null {
  const user = readJsonStorage<AuthUser>(USER_STORAGE_KEY);

  if (!user) {
    return null;
  }

  return {
    token: getStoredAuthToken() || undefined,
    user,
    dashboard: readJsonStorage<DashboardPayload>(DASHBOARD_STORAGE_KEY) || undefined,
  };
}

export function persistAuthSession(session: AuthSession) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  if (session.token) {
    storage.setItem(TOKEN_STORAGE_KEY, session.token);
  }

  storage.setItem(USER_STORAGE_KEY, JSON.stringify(session.user));

  if (session.dashboard) {
    storage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(session.dashboard));
  }
}

export function clearStoredAuthSession() {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(TOKEN_STORAGE_KEY);
  storage.removeItem(USER_STORAGE_KEY);
  storage.removeItem(DASHBOARD_STORAGE_KEY);
}

export function resolveRoleLabel(role?: string) {
  if (role === 'desarrollador') return 'Desarrollador';
  if (role === 'visitante') return 'Visitante';
  if (role === 'admin' || role === 'administrador') return 'Administrador';

  return 'Usuario';
}

export function getRedirectPathForRole(role?: string, dashboard?: DashboardPayload) {
  if (dashboard?.route) {
    return dashboard.route;
  }

  if (role === 'desarrollador') return '/desarrollador';
  if (role === 'admin' || role === 'administrador') return '/admin';

  return '/visitante';
}

export async function loginUser(payload: LoginPayload) {
  const response = await fetch(buildApiUrl('/api/auth/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(data, 'No se pudo iniciar sesion.'));
  }

  return data;
}

export async function registerUser(payload: RegisterPayload) {
  const response = await fetch(buildApiUrl('/api/auth/register'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(data, 'No se pudo registrar la cuenta.'));
  }

  return data;
}

export async function fetchDashboardSession(token = getStoredAuthToken()) {
  if (!token) {
    throw new Error('No existe una sesion activa.');
  }

  const response = await fetch(buildApiUrl('/api/auth/dashboard'), {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(data, 'No se pudo cargar la sesion actual.'));
  }

  return {
    token,
    user: data.user,
    dashboard: data.dashboard,
  } as AuthSession;
}
