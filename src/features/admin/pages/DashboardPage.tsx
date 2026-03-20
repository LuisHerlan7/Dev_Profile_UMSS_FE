// src/features/admin/pages/DashboardPage.tsx

import { useState } from "react";
import { Tab, User, SecurityEvent } from '../../../shared/types/admin';
import { EmptyState } from '../../../shared/components/EmptyState';
import { RoleBadge } from '../../../shared/components/RoleBadge';
import { StatusDot } from '../../../shared/components/StatusDot';
import { NAV_ITEMS, STAT_DEFINITIONS } from '../services/constants';
import { USERS, SECURITY_EVENTS, BAR_DATA } from '../services/mockData';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Todos los Reservas");
  const [activeNav, setActiveNav] = useState("Estado del Sistema");

  const dark = {
    bg: "#0d1117", card: "#161b22", border: "#21262d",
    text: "#e6edf3", muted: "#8b949e", accent: "#388bfd",
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: dark.bg, color: dark.text, fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: "hidden" }}>

      {/* ── Sidebar ── */}
      <aside style={{ width: 220, minWidth: 220, background: dark.bg, borderRight: `1px solid ${dark.border}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 16px 14px", borderBottom: `1px solid ${dark.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "#1f6feb", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>U</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Perfil Dev UMSS</div>
            <div style={{ fontSize: 10, color: dark.muted }}>Admin de Plataforma</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "12px 8px" }}>
          {NAV_ITEMS.map((item) => (
            <button key={item.label} onClick={() => setActiveNav(item.label)}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 10px", borderRadius: 6, border: "none", cursor: "pointer", background: activeNav === item.label ? "#1f2937" : "transparent", color: activeNav === item.label ? dark.text : dark.muted, fontSize: 13, fontWeight: activeNav === item.label ? 600 : 400, textAlign: "left", marginBottom: 2 }}>
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "14px 16px", borderTop: `1px solid ${dark.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#1f6feb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>CM</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Carlos Mendez</div>
            <div style={{ fontSize: 10, color: dark.muted }}>Admin</div>
          </div>
          <span style={{ marginLeft: "auto", color: dark.muted, fontSize: 12, cursor: "pointer" }}>↩</span>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <div style={{ height: 52, borderBottom: `1px solid ${dark.border}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, background: dark.card }}>
          <input placeholder="Buscar reportes..." style={{ background: "#0d1117", border: `1px solid ${dark.border}`, borderRadius: 6, padding: "6px 14px", color: dark.text, fontSize: 13, width: 200, outline: "none" }} />
          <div style={{ flex: 1 }} />
          {["Analíticas", "Usuarios", "Moderación", "Reportes"].map((t, i) => (
            <span key={t} style={{ fontSize: 13, color: i === 0 ? dark.accent : dark.muted, cursor: "pointer", fontWeight: i === 0 ? 600 : 400, borderBottom: i === 0 ? `2px solid ${dark.accent}` : "none", paddingBottom: 2 }}>{t}</span>
          ))}
          <span style={{ fontSize: 18, cursor: "pointer", color: dark.muted }}>🔔</span>
          <span style={{ fontSize: 18, cursor: "pointer", color: dark.muted }}>⚙️</span>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#1f6feb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>CM</div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px 28px" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>Estado del Sistema</h1>
          <p style={{ fontSize: 13, color: dark.muted, margin: "0 0 22px" }}>Resumen operativo del estado de la plataforma UMSS.</p>

          {/* Stat cards — vacías */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
            {STAT_DEFINITIONS.map((s) => (
              <div key={s.label} style={{ background: dark.card, border: `1px solid ${dark.border}`, borderRadius: 10, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                  <span style={{ fontSize: 12, color: dark.muted }}>{s.label}</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: dark.muted, opacity: 0.35, marginBottom: 10 }}>—</div>
                <div style={{ height: 4, background: dark.border, borderRadius: 2 }} />
                <div style={{ fontSize: 10, color: dark.muted, marginTop: 6, opacity: 0.45 }}>Sin datos</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 14, gap: 4 }}>
            {(["Todos los Reservas", "Contenido Reportado", "Logs del Sistema"] as Tab[]).map((t) => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{ padding: "7px 16px", borderRadius: 6, border: "none", cursor: "pointer", background: activeTab === t ? "#1f6feb" : "transparent", color: activeTab === t ? "#fff" : dark.muted, fontSize: 13, fontWeight: activeTab === t ? 600 : 400 }}>
                {t}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <button style={{ padding: "7px 14px", borderRadius: 6, border: `1px solid ${dark.border}`, background: "transparent", color: dark.muted, fontSize: 13, cursor: "pointer" }}>⊞ Filtrar</button>
            <button style={{ padding: "7px 14px", borderRadius: 6, border: "none", background: "#1f6feb", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Nuevo Usuario</button>
          </div>

          {/* Tabla de usuarios */}
          <div style={{ background: dark.card, border: `1px solid ${dark.border}`, borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${dark.border}`, fontSize: 11, color: dark.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {["Portafolio de Usuario", "Rol", "Estado", "Última Actividad", "Acciones"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {USERS.length > 0 ? (
                  USERS.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: i < USERS.length - 1 ? `1px solid ${dark.border}` : "none", fontSize: 13 }}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#1f6feb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{u.avatar}</div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{u.name}</div>
                            <div style={{ fontSize: 11, color: dark.muted }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px" }}><RoleBadge role={u.role} /></td>
                      <td style={{ padding: "14px 16px" }}><StatusDot status={u.status} /></td>
                      <td style={{ padding: "14px 16px", color: dark.muted, fontSize: 12 }}>{u.lastActivity}</td>
                      <td style={{ padding: "14px 16px" }}><span style={{ color: dark.muted, cursor: "pointer", fontSize: 18 }}>⋮</span></td>
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
            <div style={{ padding: "10px 16px", fontSize: 12, color: dark.muted, borderTop: `1px solid ${dark.border}`, display: "flex", justifyContent: "space-between" }}>
              <span>{USERS.length > 0 ? `Mostrando ${USERS.length} usuarios` : "Sin datos disponibles"}</span>
              <span style={{ display: "flex", gap: 8 }}>
                <span style={{ cursor: "pointer" }}>‹</span>
                <span style={{ cursor: "pointer" }}>›</span>
              </span>
            </div>
          </div>

          {/* Bottom row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
            {/* Gráfico */}
            <div style={{ background: dark.card, border: `1px solid ${dark.border}`, borderRadius: 10, padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Utilización de Recursos</span>
                <select style={{ background: "#0d1117", border: `1px solid ${dark.border}`, color: dark.muted, borderRadius: 5, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>
                  <option>Últimas 24 Horas</option>
                  <option>Última semana</option>
                </select>
              </div>
              {BAR_DATA.length > 0 ? (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120 }}>
                  {BAR_DATA.map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}%`, background: h >= 80 ? "#1f6feb" : h >= 60 ? "#1a4f9e" : "#162a4e", borderRadius: "3px 3px 0 0" }} />
                  ))}
                </div>
              ) : (
                <EmptyState icon="📊" message="No hay datos de utilización disponibles." muted={dark.muted} />
              )}
            </div>

            {/* Eventos de seguridad */}
            <div style={{ background: dark.card, border: `1px solid ${dark.border}`, borderRadius: 10, padding: "18px 20px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>Eventos de Seguridad</div>
              {SECURITY_EVENTS.length > 0 ? (
                SECURITY_EVENTS.map((e) => (
                  <div key={e.id} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: e.color, flexShrink: 0, marginTop: 5 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{e.title}</div>
                      <div style={{ fontSize: 11, color: dark.muted }}>{e.subtitle}</div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState icon="🔒" message="No hay eventos de seguridad registrados." muted={dark.muted} />
              )}
              <button style={{ marginTop: 4, background: "transparent", border: "none", color: dark.accent, fontSize: 12, cursor: "pointer", padding: 0 }}>
                Ver Log de Auditoría →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}