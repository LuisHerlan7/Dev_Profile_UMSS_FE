// src/features/admin/services/constants.ts

import { StatCard } from '../../../shared/types/admin';

export const NAV_ITEMS = [
  { icon: "⊞", label: "Estado del Sistema" },
  { icon: "👥", label: "Gestión de Usuarios" },
  { icon: "🛡️", label: "Moderación de Contenido" },
  { icon: "📊", label: "Analíticas del Sistema" },
  { icon: "🔒", label: "Auditoría de Seguridad" },
  { icon: "⚙️", label: "Configuración" },
];

// Solo estructura de cards — sin valores hardcodeados
export const STAT_DEFINITIONS: StatCard[] = [
  { icon: "👤", label: "Usuarios Totales",    accent: "#3b82f6" },
  { icon: "📁", label: "Portafolios Activos", accent: "#8b5cf6" },
  { icon: "⚡", label: "Carga del Sistema",   accent: "#f59e0b" },
  { icon: "⚠️", label: "Reportes Pendientes", accent: "#ef4444" },
];