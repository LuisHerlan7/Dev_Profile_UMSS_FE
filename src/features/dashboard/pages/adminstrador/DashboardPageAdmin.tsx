import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  ClipboardCheck,
  Filter,
  Flag,
  LayoutGrid,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { DashboardLayout } from '@shared/components/dashboard/DashboardLayout';
import { DashboardCard } from '@shared/components/dashboard/DashboardCard';
import { DashboardBadge } from '@shared/components/dashboard/DashboardBadge';
import { Button } from '@shared/components/ui/Button';
import { logoutUser, resolveRoleLabel } from '@services/auth';
import { fetchAdminDashboard, type AdminDashboardData } from '@services/dashboard';
import { useAuthSession } from '@shared/hooks/useAuthSession';
import { fetchAdminEvidences, updateEvidenceStatus, type EvidencePage } from '@services/admin';

type AdminSection = 'dashboard' | 'users' | 'moderation' | 'analytics' | 'settings' | 'security';

type SidebarItem = {
  id: AdminSection;
  label: string;
  icon: JSX.Element;
};

const sidebarItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Resumen del Sistema', icon: <LayoutGrid className="h-4 w-4" /> },
  { id: 'users', label: 'Gestión de Usuarios', icon: <Users className="h-4 w-4" /> },
  { id: 'moderation', label: 'Moderación de Contenido', icon: <Flag className="h-4 w-4" /> },
  { id: 'analytics', label: 'Analíticas del Sistema', icon: <ClipboardCheck className="h-4 w-4" /> },
  { id: 'settings', label: 'Configuración', icon: <Settings className="h-4 w-4" /> },
  { id: 'security', label: 'Auditoría de Seguridad', icon: <ShieldCheck className="h-4 w-4" /> },
];

function clampRatio(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

function formatShare(value: number, total: number) {
  if (total <= 0) return 'Sin datos';
  return `${clampRatio(value, total)}% del total`;
}

function formatSystemLoad(load: number | null) {
  if (load === null) return { label: 'Pendiente', tone: 'neutral' as const, width: 0 };
  if (load >= 80) return { label: 'Alta', tone: 'warning' as const, width: load };
  if (load >= 50) return { label: 'Media', tone: 'brand' as const, width: load };
  return { label: 'Estable', tone: 'success' as const, width: load };
}

function formatDateLabel(value?: string | null) {
  if (!value) return 'Sin fecha';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function DashboardPageAdmin() {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [dashboardError, setDashboardError] = useState('');
  const [evidenceQueue, setEvidenceQueue] = useState<EvidencePage | null>(null);
  const [evidenceStatus, setEvidenceStatus] = useState<'en_revision' | 'verificado' | 'rechazado'>('en_revision');
  const [evidencePage, setEvidencePage] = useState(1);
  const [evidenceError, setEvidenceError] = useState('');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const { session, isLoading, error } = useAuthSession({
    requiredRole: ['admin', 'administrador'],
    redirectTo: '/login',
  });

  useEffect(() => {
    const sessionToken = session?.token;
    if (!sessionToken) {
      return;
    }

    let cancelled = false;

    async function loadAdminDashboard() {
      try {
        const data = await fetchAdminDashboard(sessionToken);
        if (!cancelled) {
          setDashboardData(data);
          setDashboardError('');
        }
      } catch (requestError) {
        if (!cancelled) {
          setDashboardError(
            requestError instanceof Error
              ? requestError.message
              : 'No se pudo cargar el panel administrativo.'
          );
        }
      }
    }

    loadAdminDashboard();

    return () => {
      cancelled = true;
    };
  }, [session?.token]);

  const refreshAdminDashboard = async () => {
    if (!session?.token) {
      return;
    }

    try {
      const data = await fetchAdminDashboard(session.token);
      setDashboardData(data);
      setDashboardError('');
    } catch (requestError) {
      setDashboardError(
        requestError instanceof Error ? requestError.message : 'No se pudo cargar el panel administrativo.'
      );
    }
  };

  const stats = dashboardData?.stats || {
    total_users: 0,
    developers: 0,
    recruiters: 0,
    suspended: 0,
    admins: 0,
  };
  const system = dashboardData?.system || {
    active_portfolios: 0,
    system_load: null,
    pending_reports: 0,
  };
  const recentUsers = dashboardData?.recent_users || [];
  const moderation = dashboardData?.moderation || {
    pending: 0,
    verified: 0,
    rejected: 0,
    latest: [],
  };
  const analytics = dashboardData?.analytics || {
    technology_popularity: [],
    user_growth: [],
    project_status: [],
    evidence_status: [],
  };
  const security = dashboardData?.security || [];

  const profileName = session?.user.name || 'Administrador';
  const profileRole = resolveRoleLabel(session?.user.role);

  useEffect(() => {
    const sessionToken = session?.token;
    if (activeSection !== 'moderation' || !sessionToken) {
      return;
    }

    let cancelled = false;

    async function loadEvidenceQueue() {
      try {
        const data = await fetchAdminEvidences(
          { status: evidenceStatus, page: evidencePage, perPage: 6 },
          sessionToken
        );
        if (!cancelled) {
          setEvidenceQueue(data);
          setEvidenceError('');
        }
      } catch (requestError) {
        if (!cancelled) {
          setEvidenceError(
            requestError instanceof Error
              ? requestError.message
              : 'No se pudo cargar la cola de evidencias.'
          );
        }
      }
    }

    loadEvidenceQueue();

    return () => {
      cancelled = true;
    };
  }, [activeSection, evidenceStatus, evidencePage, session?.token]);

  const refreshEvidenceQueue = async () => {
    if (!session?.token) {
      return;
    }

    try {
      const data = await fetchAdminEvidences(
        { status: evidenceStatus, page: evidencePage, perPage: 6 },
        session.token
      );
      setEvidenceQueue(data);
      setEvidenceError('');
    } catch (requestError) {
      setEvidenceError(
        requestError instanceof Error ? requestError.message : 'No se pudo cargar la cola de evidencias.'
      );
    }
  };

  if (isLoading && !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--umss-surface)] p-6">
        <div className="rounded-2xl border border-[var(--umss-border)] bg-white px-6 py-4 text-sm text-slate-600">
          Cargando panel administrativo...
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--umss-surface)] p-6">
        <div className="rounded-2xl border border-red-200 bg-white px-6 py-4 text-sm text-red-600">
          {error || 'No se pudo validar la sesión.'}
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      sidebarCollapsed={isSidebarCollapsed}
      sidebar={
        <aside className={`flex h-full flex-col gap-6 ${isSidebarCollapsed ? 'items-center px-3 py-4' : 'p-6'}`}>
          <div className={`flex w-full items-start ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isSidebarCollapsed ? (
              <div>
                <p className="text-lg font-semibold text-slate-900">Perfil Dev UMSS</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Admin de Plataforma</p>
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--umss-lavender)] text-[var(--umss-brand)]">
                {profileName
                  .split(' ')
                  .slice(0, 2)
                  .map((name) => name[0])
                  .join('')}
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--umss-border)] bg-white text-slate-500 transition hover:text-[var(--umss-brand)]"
              aria-label={isSidebarCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>

          <nav className={`space-y-2 ${isSidebarCollapsed ? 'w-full' : ''}`}>
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                title={isSidebarCollapsed ? item.label : undefined}
                className={`flex w-full items-center rounded-2xl text-sm font-medium transition ${
                  isSidebarCollapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-3'
                } ${
                  activeSection === item.id
                    ? 'bg-[var(--umss-lavender)] text-[var(--umss-brand)]'
                    : 'text-slate-600 hover:bg-[var(--umss-surface)] hover:text-slate-900'
                }`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500">
                  {item.icon}
                </span>
                {!isSidebarCollapsed ? item.label : null}
              </button>
            ))}
          </nav>

          <div className={`mt-auto rounded-2xl border border-[var(--umss-border)] bg-white p-4 ${isSidebarCollapsed ? 'w-full' : ''}`}>
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--umss-lavender)] text-[var(--umss-brand)]">
                {profileName
                  .split(' ')
                  .slice(0, 2)
                  .map((name) => name[0])
                  .join('')}
              </div>
              {!isSidebarCollapsed ? (
                <div>
                  <p className="text-sm font-semibold text-slate-900">{profileName}</p>
                  <p className="text-xs text-slate-500">{profileRole}</p>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={async () => {
                await logoutUser();
                window.location.assign('/login');
              }}
              className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--umss-brand)] px-3 py-2 text-sm font-semibold text-white ${
                isSidebarCollapsed ? 'text-xs' : ''
              }`}
            >
              <LogOut className="h-4 w-4" />
              {isSidebarCollapsed ? null : 'Cerrar Sesión'}
            </button>
          </div>
        </aside>
      }
      topbar={
        <div className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <label className="relative w-full max-w-xl">
              <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Buscar reportes..."
                value={adminSearchQuery}
                onChange={(event) => setAdminSearchQuery(event.target.value)}
                className="h-11 w-full rounded-2xl border border-[var(--umss-border)] bg-[var(--umss-surface)] pr-4 pl-11 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[rgba(80,72,229,0.3)] focus:ring-2 focus:ring-[rgba(80,72,229,0.15)]"
              />
            </label>

          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setActiveSection('moderation')}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--umss-border)] bg-white text-slate-500 transition hover:text-[var(--umss-brand)]"
              aria-label="Notificaciones"
            >
              <Bell className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('settings')}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--umss-border)] bg-white text-slate-500 transition hover:text-[var(--umss-brand)]"
              aria-label="Configuracion"
            >
              <Settings className="h-4 w-4" />
            </button>
            <AdminUserMenu
              name={profileName}
              role={profileRole}
              onLogout={async () => {
                await logoutUser();
                window.location.assign('/login');
              }}
            />
          </div>
        </div>
      }
    >
      {dashboardError ? (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {dashboardError}
        </div>
      ) : null}

      {activeSection === 'dashboard' ? (
        <AdminSummarySection stats={stats} system={system} />
      ) : null}
      {activeSection === 'users' ? (
        <AdminUsersSection stats={stats} recentUsers={recentUsers} searchQuery={adminSearchQuery} />
      ) : null}
      {activeSection === 'moderation' ? (
        <AdminModerationSection
          moderation={moderation}
          evidenceQueue={evidenceQueue}
          evidenceStatus={evidenceStatus}
          evidenceError={evidenceError}
          searchQuery={adminSearchQuery}
          onStatusChange={(status) => {
            setEvidenceStatus(status);
            setEvidencePage(1);
          }}
          onPageChange={setEvidencePage}
          onEvidenceAction={async (evidenceId, status) => {
            try {
              await updateEvidenceStatus(evidenceId, status, session.token);
              await refreshEvidenceQueue();
              await refreshAdminDashboard();
            } catch (requestError) {
              setEvidenceError(
                requestError instanceof Error
                  ? requestError.message
                  : 'No se pudo actualizar la evidencia.'
              );
            }
          }}
        />
      ) : null}
      {activeSection === 'analytics' ? (
        <AdminAnalyticsSection stats={stats} system={system} analytics={analytics} />
      ) : null}
      {activeSection === 'settings' ? (
        <AdminSettingsSection name={profileName} email={session.user.email} />
      ) : null}
      {activeSection === 'security' ? (
        <AdminSecuritySection events={security} searchQuery={adminSearchQuery} />
      ) : null}
    </DashboardLayout>
  );
}

function AdminUserMenu({
  name,
  role,
  onLogout,
}: {
  name: string;
  role: string;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-3 rounded-2xl border border-[var(--umss-border)] bg-white px-3 py-2 shadow-sm"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-900">{name}</p>
          <p className="text-xs text-slate-500">{role}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--umss-brand)] to-[var(--umss-accent)] text-sm font-semibold text-white">
          {name
            .split(' ')
            .slice(0, 2)
            .map((part) => part[0])
            .join('')}
        </div>
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-44 rounded-2xl border border-[var(--umss-border)] bg-white p-2 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.45)]">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-[var(--umss-surface)] hover:text-slate-900"
          >
            Cerrar sesión
          </button>
        </div>
      ) : null}
    </div>
  );
}

function AdminSummarySection({
  stats,
  system,
}: {
  stats: AdminDashboardData['stats'];
  system: AdminDashboardData['system'];
}) {
  const totalUsersWidth = clampRatio(stats.total_users, Math.max(stats.total_users, system.active_portfolios, 1));
  const activePortfoliosWidth = clampRatio(system.active_portfolios, Math.max(stats.total_users, system.active_portfolios, 1));
  const pendingReportsWidth = clampRatio(system.pending_reports, Math.max(system.pending_reports, stats.total_users, 1));
  const loadState = formatSystemLoad(system.system_load);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Estado del Sistema</h1>
        <p className="mt-1 text-sm text-slate-500">
          Resumen operativo del estado de la plataforma UMSS.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <DashboardCard>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Usuarios Totales</p>
            <DashboardBadge tone={stats.total_users > 0 ? 'success' : 'neutral'}>
              {stats.total_users > 0 ? 'Datos reales' : 'Sin registros'}
            </DashboardBadge>
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{stats.total_users}</p>
          <div className="mt-3 h-1.5 w-full rounded-full bg-[var(--umss-surface)]">
            <div className="h-full rounded-full bg-[var(--umss-brand)]" style={{ width: `${totalUsersWidth}%` }} />
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Portafolios Activos</p>
            <DashboardBadge tone={system.active_portfolios > 0 ? 'success' : 'neutral'}>
              {formatShare(system.active_portfolios, Math.max(stats.total_users, 1))}
            </DashboardBadge>
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{system.active_portfolios}</p>
          <div className="mt-3 h-1.5 w-full rounded-full bg-[var(--umss-surface)]">
            <div className="h-full rounded-full bg-[var(--umss-success)]" style={{ width: `${activePortfoliosWidth}%` }} />
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Carga del Sistema</p>
            <DashboardBadge tone={loadState.tone}>{loadState.label}</DashboardBadge>
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {system.system_load !== null ? `${system.system_load}%` : 'Pendiente'}
          </p>
          <div className="mt-3 h-1.5 w-full rounded-full bg-[var(--umss-surface)]">
            <div className="h-full rounded-full bg-[var(--umss-warning)]" style={{ width: `${loadState.width}%` }} />
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Reportes Pendientes</p>
            <DashboardBadge tone={system.pending_reports > 0 ? 'warning' : 'success'}>
              {system.pending_reports > 0 ? 'Requiere atención' : 'Al día'}
            </DashboardBadge>
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{system.pending_reports}</p>
          <div className="mt-3 h-1.5 w-full rounded-full bg-[var(--umss-surface)]">
            <div className="h-full rounded-full bg-[var(--umss-brand)]" style={{ width: `${pendingReportsWidth}%` }} />
          </div>
        </DashboardCard>
      </div>

      <DashboardCard
        title="Todos los Usuarios"
        description="Vista resumida para verificar actividad reciente."
      >
        <div className="space-y-3">
          {stats.total_users === 0 ? (
            <p className="text-sm text-slate-500">No hay usuarios registrados todavía.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { label: 'Desarrolladores', value: stats.developers },
                { label: 'Administradores', value: stats.admins },
                { label: 'Suspendidos', value: stats.suspended },
                { label: 'Reclutadores', value: stats.recruiters },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[var(--umss-border)] bg-[var(--umss-surface)] p-4"
                >
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardCard>
    </div>
  );
}

function AdminUsersSection({
  stats,
  recentUsers,
  searchQuery,
}: {
  stats: AdminDashboardData['stats'];
  recentUsers: AdminDashboardData['recent_users'];
  searchQuery: string;
}) {
  const filteredUsers = recentUsers.filter((user) => {
    const query = searchQuery.trim().toLocaleLowerCase('es');
    if (!query) return true;

    return [user.name, user.email, resolveRoleLabel(user.role)]
      .filter(Boolean)
      .some((value) => value.toLocaleLowerCase('es').includes(query));
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Gestión de Usuarios</h1>
        <p className="mt-1 text-sm text-slate-500">
          Administra roles, permisos y estados de todos los miembros de la plataforma.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <DashboardCard>
          <p className="text-sm text-slate-500">Total Usuarios</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{stats.total_users}</p>
          <p className="mt-2 text-xs text-slate-500">Base consolidada del sistema.</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-sm text-slate-500">Desarrolladores</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{stats.developers}</p>
          <div className="mt-3 h-1.5 rounded-full bg-[var(--umss-surface)]">
            <div
              className="h-full rounded-full bg-[var(--umss-brand)]"
              style={{ width: `${clampRatio(stats.developers, Math.max(stats.total_users, 1))}%` }}
            />
          </div>
        </DashboardCard>
        <DashboardCard>
          <p className="text-sm text-slate-500">Reclutadores</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{stats.recruiters}</p>
          <div className="mt-3 h-1.5 rounded-full bg-[var(--umss-surface)]">
            <div
              className="h-full rounded-full bg-[var(--umss-brand)]"
              style={{ width: `${clampRatio(stats.recruiters, Math.max(stats.total_users, 1))}%` }}
            />
          </div>
        </DashboardCard>
        <DashboardCard>
          <p className="text-sm text-slate-500">Suspendidos</p>
          <p className="mt-3 text-2xl font-semibold text-rose-600">{stats.suspended}</p>
          <p className="mt-2 text-xs text-slate-500">{formatShare(stats.suspended, Math.max(stats.total_users, 1))}</p>
        </DashboardCard>
      </div>

      <DashboardCard
        title="Usuarios recientes"
        description="Resumen de cuentas creadas recientemente."
      >
        <div className="overflow-hidden rounded-2xl border border-[var(--umss-border)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--umss-surface)] text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Creado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-500" colSpan={4}>
                    {searchQuery ? 'No hay usuarios que coincidan con la búsqueda.' : 'Sin usuarios recientes.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t border-[var(--umss-border)]">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <DashboardBadge tone="brand">{resolveRoleLabel(user.role)}</DashboardBadge>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDateLabel(user.created_at)}</td>
                    <td className="px-4 py-3 text-right text-slate-400">···</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Mostrando {filteredUsers.length} de {stats.total_users} usuarios.
        </p>
      </DashboardCard>
    </div>
  );
}

function AdminModerationSection({
  moderation,
  evidenceQueue,
  evidenceStatus,
  evidenceError,
  searchQuery,
  onStatusChange,
  onPageChange,
  onEvidenceAction,
}: {
  moderation: AdminDashboardData['moderation'];
  evidenceQueue: EvidencePage | null;
  evidenceStatus: 'en_revision' | 'verificado' | 'rechazado';
  evidenceError: string;
  searchQuery: string;
  onStatusChange: (status: 'en_revision' | 'verificado' | 'rechazado') => void;
  onPageChange: (page: number) => void;
  onEvidenceAction: (id: number, status: 'en_revision' | 'verificado' | 'rechazado') => Promise<void>;
}) {
  const items = evidenceQueue?.data || [];
  const filteredItems = items.filter((item) => {
    const query = searchQuery.trim().toLocaleLowerCase('es');
    if (!query) return true;

    return [
      item.title,
      item.project?.name ?? '',
      item.owner?.name ?? '',
      item.owner?.email ?? '',
      item.status,
    ]
      .filter(Boolean)
      .some((value) => value.toLocaleLowerCase('es').includes(query));
  });
  const meta = evidenceQueue?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Moderación de Contenido</h1>
          <p className="mt-1 text-sm text-slate-500">
            Revisión de evidencias y verificación de proyectos publicados.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DashboardBadge tone="brand">
            {meta ? `${meta.total} evidencias` : 'Cargando'}
          </DashboardBadge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard>
          <p className="text-sm text-slate-500">En revisión</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{moderation.pending}</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-sm text-slate-500">Verificadas</p>
          <p className="mt-3 text-2xl font-semibold text-emerald-600">{moderation.verified}</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-sm text-slate-500">Rechazadas</p>
          <p className="mt-3 text-2xl font-semibold text-rose-600">{moderation.rejected}</p>
        </DashboardCard>
      </div>

      <DashboardCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4 text-slate-500" />
            <span className="text-slate-500">Estado:</span>
            <div className="flex flex-wrap gap-2">
              {([
                { id: 'en_revision', label: 'En revisión' },
                { id: 'verificado', label: 'Verificadas' },
                { id: 'rechazado', label: 'Rechazadas' },
              ] as const).map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => onStatusChange(filter.id)}
                  className={`rounded-xl px-3 py-1 text-xs font-semibold ${
                    evidenceStatus === filter.id
                      ? 'bg-[var(--umss-lavender)] text-[var(--umss-brand)]'
                      : 'border border-[var(--umss-border)] bg-white text-slate-600'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          <div className="text-xs text-slate-500">
            {meta ? `Mostrando ${filteredItems.length} de ${meta.total} evidencias.` : 'Cargando evidencias...'}
          </div>
        </div>

        {evidenceError ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {evidenceError}
          </div>
        ) : null}

        <div className="mt-4 space-y-4">
          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--umss-border)] bg-[var(--umss-surface)] p-6 text-sm text-slate-500">
              {searchQuery ? 'No hay evidencias que coincidan con la búsqueda actual.' : 'No hay evidencias en este estado.'}
            </div>
          ) : (
            filteredItems.map((item) => (
              <ModerationCard
                key={item.id}
                title={item.title}
                project={item.project?.name || 'Proyecto'}
                owner={item.owner?.email || 'Sin correo'}
                status={item.status}
                fileUrl={item.file_url || undefined}
                onApprove={() => onEvidenceAction(item.id, 'verificado')}
                onReject={() => onEvidenceAction(item.id, 'rechazado')}
                onReview={() => onEvidenceAction(item.id, 'en_revision')}
              />
            ))
          )}
        </div>

        {meta && meta.last_page > 1 ? (
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(meta.page - 1, 1))}
              className="rounded-xl border border-[var(--umss-border)] bg-white px-3 py-2 text-xs font-semibold text-slate-600"
              disabled={meta.page === 1}
            >
              Anterior
            </button>
            <div className="text-xs text-slate-500">
              Página {meta.page} de {meta.last_page}
            </div>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(meta.page + 1, meta.last_page))}
              className="rounded-xl border border-[var(--umss-border)] bg-white px-3 py-2 text-xs font-semibold text-slate-600"
              disabled={meta.page >= meta.last_page}
            >
              Siguiente
            </button>
          </div>
        ) : null}
      </DashboardCard>
    </div>
  );
}

function AdminAnalyticsSection({
  stats,
  system,
  analytics,
}: {
  stats: AdminDashboardData['stats'];
  system: AdminDashboardData['system'];
  analytics: AdminDashboardData['analytics'];
}) {
  const maxGrowth = Math.max(1, ...analytics.user_growth.map((item) => item.value));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Analíticas del Sistema</h1>
          <p className="mt-1 text-sm text-slate-500">
            Métricas reales del ecosistema Dev Profile UMSS.
          </p>
        </div>
        <DashboardBadge tone="success">Datos sincronizados</DashboardBadge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <DashboardCard>
          <p className="text-sm text-slate-500">Total Usuarios</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{stats.total_users}</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-sm text-slate-500">Portafolios Activos</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{system.active_portfolios}</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-sm text-slate-500">Proyectos verificados</p>
          <p className="mt-3 text-2xl font-semibold text-emerald-600">
            {analytics.project_status.find((item) => item.label.includes('Verificados'))?.value ?? 0}
          </p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-sm text-slate-500">Evidencias en revisión</p>
          <p className="mt-3 text-2xl font-semibold text-amber-600">
            {analytics.evidence_status.find((item) => item.label.includes('En revisión'))?.value ?? 0}
          </p>
        </DashboardCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <DashboardCard title="Tecnologías Populares">
          <div className="space-y-4">
            {analytics.technology_popularity.length === 0 ? (
              <p className="text-sm text-slate-500">Sin tecnologias registradas.</p>
            ) : (
              analytics.technology_popularity.map((tech) => (
                <div key={tech.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>{tech.label}</span>
                    <span>{tech.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--umss-surface)]">
                    <div
                      className="h-full rounded-full bg-[var(--umss-brand)]"
                      style={{ width: `${tech.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </DashboardCard>

        <DashboardCard title="Crecimiento de Usuarios">
          <div className="h-56 rounded-2xl bg-[var(--umss-surface)] p-4">
            <div className="flex h-full items-end gap-3">
              {analytics.user_growth.map((item) => (
                <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-xl bg-[rgba(80,72,229,0.25)]"
                    style={{ height: `${(item.value / maxGrowth) * 100}%` }}
                  />
                  <span className="text-xs text-slate-400">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}

function AdminSettingsSection({ name, email }: { name: string; email: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Configuración de Perfil</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gestiona tu información personal, privacidad e integraciones externas.
        </p>
      </div>

      <DashboardCard>
        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--umss-border)] bg-[var(--umss-surface)] p-4">
            <p className="text-sm font-semibold text-slate-900">Información General</p>
            <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-slate-400">Nombre</p>
                <p className="mt-1 font-semibold text-slate-900">{name}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Correo</p>
                <p className="mt-1 font-semibold text-slate-900">{email}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--umss-border)] bg-[var(--umss-surface)] p-4">
            <p className="text-sm font-semibold text-slate-900">Privacidad y Visibilidad</p>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
              <span>Perfil administrativo visible en el sistema</span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
                Activo
              </span>
            </div>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}

function AdminSecuritySection({
  events,
  searchQuery,
}: {
  events: AdminDashboardData['security'];
  searchQuery: string;
}) {
  const filteredEvents = events.filter((item) => {
    const query = searchQuery.trim().toLocaleLowerCase('es');
    if (!query) return true;

    return [item.title, item.user, item.details, item.date ?? '']
      .filter(Boolean)
      .some((value) => value.toLocaleLowerCase('es').includes(query));
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Auditoría de Seguridad</h1>
        <p className="mt-1 text-sm text-slate-500">
          Registro detallado de actividades y eventos críticos del sistema.
        </p>
      </div>

      <DashboardCard>
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--umss-border)] bg-rose-50 p-4 text-sm text-rose-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Eventos recientes del sistema
          </div>
          <p>Listado real de actividad registrada en la plataforma.</p>
        </div>

        <div className="mt-4 space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--umss-border)] bg-[var(--umss-surface)] p-4 text-sm text-slate-500">
              {searchQuery ? 'No hay eventos que coincidan con la búsqueda actual.' : 'No hay eventos de seguridad registrados.'}
            </div>
          ) : (
            filteredEvents.map((item) => (
              <div key={`${item.title}-${item.date}`} className="flex items-center justify-between rounded-2xl border border-[var(--umss-border)] bg-white p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.user}</p>
                  <p className="text-xs text-slate-400">{item.details}</p>
                  {item.date ? <p className="text-xs text-slate-400">{formatDateLabel(item.date)}</p> : null}
                </div>
                <DashboardBadge tone="neutral">Auditoría</DashboardBadge>
              </div>
            ))
          )}
        </div>
      </DashboardCard>
    </div>
  );
}

function ModerationCard({
  title,
  project,
  owner,
  status,
  fileUrl,
  onApprove,
  onReject,
  onReview,
}: {
  title: string;
  project: string;
  owner: string;
  status: string;
  fileUrl?: string;
  onApprove: () => void;
  onReject: () => void;
  onReview: () => void;
}) {
  return (
    <div className="rounded-3xl border border-[var(--umss-border)] bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.22)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold text-[var(--umss-brand)]">EVIDENCIA</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{title}</h3>
          <div className="mt-3 rounded-2xl border border-[var(--umss-border)] bg-[var(--umss-surface)] p-3 text-sm text-slate-600">
            Proyecto: {project}
          </div>
          <p className="mt-3 text-xs text-slate-500">Autor: {owner}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>Estado:</span>
            {status === 'verificado' ? (
              <DashboardBadge tone="success">Verificado</DashboardBadge>
            ) : status === 'rechazado' ? (
              <DashboardBadge className="border border-rose-200 bg-rose-50 text-rose-600">
                Rechazado
              </DashboardBadge>
            ) : (
              <DashboardBadge tone="warning">En revisión</DashboardBadge>
            )}
            {fileUrl ? (
              <a href={fileUrl} target="_blank" rel="noreferrer" className="text-[var(--umss-brand)]">
                Ver archivo
              </a>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" className="h-9 rounded-xl px-3 text-xs font-semibold" onClick={onApprove}>
            Aprobar
          </Button>
          <Button size="sm" variant="secondary" className="h-9 rounded-xl px-3 text-xs font-semibold" onClick={onReview}>
            En revisión
          </Button>
          <Button size="sm" className="h-9 rounded-xl px-3 text-xs font-semibold" onClick={onReject}>
            Rechazar
          </Button>
        </div>
      </div>
    </div>
  );
}
