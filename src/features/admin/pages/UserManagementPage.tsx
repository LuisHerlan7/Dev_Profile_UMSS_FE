// src/features/admin/pages/UserManagementPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from '../../../shared/components/EmptyState';
import { RoleBadge } from '../../../shared/components/RoleBadge';
import { StatusDot } from '../../../shared/components/StatusDot';

// ── Types ──────────────────────────────────────────────────────────────────
type Role = "Desarrollador" | "Reclutador" | "Admin";
type Status = "Activo" | "Inactivo" | "Suspendido";
type FilterTab = "Todos" | "Desarrolladores" | "Reclutadores" | "Admins";

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  status: Status;
  lastConnection: string;
}

interface StatCard {
  label: string;
  accent: string;
}

// ── Nav items ──────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: "⊞", label: "Resumen del Sistema" },
  { icon: "👥", label: "Gestión de Usuarios", active: true },
  { icon: "🛡️", label: "Moderación de Contenido" },
  { icon: "📊", label: "Analíticas del Sistema" },
  { icon: "🔒", label: "Auditoría de Seguridad" },
  { icon: "⚙️", label: "Configuración" },
];

// Solo estructura — sin valores hardcodeados
const STAT_DEFINITIONS: StatCard[] = [
  { label: "Total Usuarios",    accent: "#22c55e" },
  { label: "Desarrolladores",   accent: "#3b82f6" },
  { label: "Reclutadores",      accent: "#3b82f6" },
  { label: "Suspendidos",       accent: "#ef4444" },
];

// Arrays vacíos — conectar al backend
const USERS: User[] = [];

// ── Role badge ─────────────────────────────────────────────────────────────
const LocalRoleBadge = ({ role }: { role: Role }) => {
  const map: Record<Role, { bg: string; color: string }> = {
    Desarrollador: { bg: "#1e3a5f", color: "#60a5fa" },
    Reclutador:    { bg: "#3b1f5e", color: "#a78bfa" },
    Admin:         { bg: "#2e1a1a", color: "#f87171" },
  };
  const s = map[role];
  return (
    <span style={{ background: s.bg, color: s.color, padding: "3px 12px", borderRadius: 4, fontSize: 12, fontWeight: 700 }}>
      {role}
    </span>
  );
};

// ── Status dot ─────────────────────────────────────────────────────────────
const LocalStatusDot = ({ status }: { status: Status }) => {
  const map: Record<Status, string> = { Activo: "#22c55e", Inactivo: "#94a3b8", Suspendido: "#ef4444" };
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: map[status], display: "inline-block" }} />
      <span style={{ color: map[status], fontSize: 13 }}>{status}</span>
    </span>
  );
};

// ── Main ───────────────────────────────────────────────────────────────────
export default function UserManagementPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("Todos");
  const [activeNav, setActiveNav]       = useState("Gestión de Usuarios");
  const navigate = useNavigate();

  const dark = {
    bg: "#0d1117", card: "#161b22", border: "#21262d",
    text: "#e6edf3", muted: "#8b949e", accent: "#388bfd",
  };

  const FILTER_TABS: { label: FilterTab; icon: string }[] = [
    { label: "Todos",          icon: "" },
    { label: "Desarrolladores",icon: "<>" },
    { label: "Reclutadores",   icon: "🏢" },
    { label: "Admins",         icon: "🔑" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", background: dark.bg, color: dark.text, fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: "hidden" }}>

      {/* ── Sidebar ── */}
      <aside style={{ width: 220, minWidth: 220, background: dark.bg, borderRight: `1px solid ${dark.border}`, display: "flex", flexDirection: "column" }}>
        {/* Logo */}
        <div style={{ padding: "18px 16px 14px", borderBottom: `1px solid ${dark.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "#1f6feb", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>U</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Perfil Dev UMSS</div>
            <div style={{ fontSize: 10, color: dark.muted }}>Admin de Plataforma</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 8px" }}>
          {NAV_ITEMS.map((item) => (
            <button key={item.label} onClick={() => {
              setActiveNav(item.label);
              if (item.label === "Resumen del Sistema") {
                navigate("/admin");
              }
            }}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 10px", borderRadius: 6, border: "none", cursor: "pointer", background: activeNav === item.label ? "#1f2937" : "transparent", color: activeNav === item.label ? dark.accent : dark.muted, fontSize: 13, fontWeight: activeNav === item.label ? 600 : 400, textAlign: "left", marginBottom: 2 }}>
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: "14px 16px", borderTop: `1px solid ${dark.border}`, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#1f6feb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>CM</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Carlos Mendez</div>
              <div style={{ fontSize: 10, color: dark.muted }}>Administrador Root</div>
            </div>
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: `1px solid ${dark.border}`, color: dark.muted, borderRadius: 6, padding: "7px 12px", fontSize: 12, cursor: "pointer", width: "100%" }}>
            ↩ Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <div style={{ height: 52, borderBottom: `1px solid ${dark.border}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, background: dark.card }}>
          <input placeholder="Buscar reportes..." style={{ background: "#0d1117", border: `1px solid ${dark.border}`, borderRadius: 6, padding: "6px 14px", color: dark.text, fontSize: 13, width: 200, outline: "none" }} />
          <div style={{ flex: 1 }} />
          {["Dashboard", "Usuarios", "Moderación", "Reportes"].map((t, i) => (
            <span key={t} style={{ fontSize: 13, color: i === 1 ? dark.accent : dark.muted, cursor: "pointer", fontWeight: i === 1 ? 600 : 400, borderBottom: i === 1 ? `2px solid ${dark.accent}` : "none", paddingBottom: 2 }}>{t}</span>
          ))}
          <span style={{ fontSize: 18, cursor: "pointer", color: dark.muted }}>🔔</span>
          <span style={{ fontSize: 18, cursor: "pointer", color: dark.muted }}>⚙️</span>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#1f6feb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>CM</div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px 28px" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>Gestión de Usuarios</h1>
          <p style={{ fontSize: 13, color: dark.muted, margin: "0 0 22px" }}>
            Administra los roles, permisos y estados de todos los miembros de la plataforma Dev Profile.
          </p>

          {/* ── Stat cards vacías ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
            {STAT_DEFINITIONS.map((s) => (
              <div key={s.label} style={{ background: dark.card, border: `1px solid ${dark.border}`, borderRadius: 10, padding: "16px 18px" }}>
                <div style={{ fontSize: 11, color: dark.muted, marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: dark.muted, opacity: 0.35, marginBottom: 10 }}>—</div>
                <div style={{ height: 4, background: dark.border, borderRadius: 2 }} />
                <div style={{ fontSize: 10, color: dark.muted, marginTop: 6, opacity: 0.45 }}>Sin datos</div>
              </div>
            ))}
          </div>

          {/* ── Filtros + acciones ── */}
          <div style={{ background: dark.card, border: `1px solid ${dark.border}`, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${dark.border}`, gap: 4 }}>
              {FILTER_TABS.map(({ label, icon }) => (
                <button key={label} onClick={() => setActiveFilter(label)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer", background: activeFilter === label ? "#1f6feb" : "transparent", color: activeFilter === label ? "#fff" : dark.muted, fontSize: 13, fontWeight: activeFilter === label ? 600 : 400 }}>
                  {icon && <span style={{ fontSize: 12 }}>{icon}</span>}
                  {label}
                </button>
              ))}
              <div style={{ flex: 1 }} />
              {/* Estado dropdown */}
              <select style={{ background: "#0d1117", border: `1px solid ${dark.border}`, color: dark.muted, borderRadius: 6, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>
                <option>Estado: Todos</option>
                <option>Activo</option>
                <option>Inactivo</option>
                <option>Suspendido</option>
              </select>
              {/* Icono filtro */}
              <button style={{ background: "transparent", border: `1px solid ${dark.border}`, color: dark.muted, borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: 14 }}>⊟</button>
              {/* Icono descarga */}
              <button style={{ background: "transparent", border: `1px solid ${dark.border}`, color: dark.muted, borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: 14 }}>⬇</button>
            </div>

            {/* ── Tabla ── */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ fontSize: 11, color: dark.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {["Usuario", "Rol", "Estado", "Última Conexión", "Acciones"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, borderBottom: `1px solid ${dark.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {USERS.length > 0 ? (
                  USERS.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: i < USERS.length - 1 ? `1px solid ${dark.border}` : "none", fontSize: 13 }}>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#1f6feb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{u.avatar}</div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{u.name}</div>
                            <div style={{ fontSize: 11, color: dark.muted }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "13px 16px" }}><LocalRoleBadge role={u.role} /></td>
                      <td style={{ padding: "13px 16px" }}><LocalStatusDot status={u.status} /></td>
                      <td style={{ padding: "13px 16px", color: dark.muted, fontSize: 12 }}>{u.lastConnection}</td>
                      <td style={{ padding: "13px 16px" }}>
                        <span style={{ color: dark.muted, cursor: "pointer", fontSize: 18 }}>⋮</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState icon="👥" message="No hay usuarios para mostrar de momento." muted={dark.muted} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Paginación */}
            <div style={{ padding: "12px 16px", borderTop: `1px solid ${dark.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: dark.muted }}>
              <span>{USERS.length > 0 ? `Mostrando 1-${USERS.length} usuarios` : "Sin datos disponibles"}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button style={{ padding: "4px 10px", borderRadius: 5, border: `1px solid ${dark.border}`, background: "transparent", color: dark.muted, cursor: "pointer", fontSize: 12 }}>Anterior</button>
                {[1, 2, 3].map((n) => (
                  <button key={n} style={{ width: 28, height: 28, borderRadius: 5, border: n === 1 ? "none" : `1px solid ${dark.border}`, background: n === 1 ? "#1f6feb" : "transparent", color: n === 1 ? "#fff" : dark.muted, cursor: "pointer", fontSize: 12 }}>{n}</button>
                ))}
                <span style={{ padding: "0 4px" }}>...</span>
                <button style={{ width: 28, height: 28, borderRadius: 5, border: `1px solid ${dark.border}`, background: "transparent", color: dark.muted, cursor: "pointer", fontSize: 12 }}>32</button>
                <button style={{ padding: "4px 10px", borderRadius: 5, border: `1px solid ${dark.border}`, background: "transparent", color: dark.muted, cursor: "pointer", fontSize: 12 }}>Siguiente</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}