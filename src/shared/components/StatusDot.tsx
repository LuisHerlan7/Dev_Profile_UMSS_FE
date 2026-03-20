// src/shared/components/StatusDot.tsx

import { Status } from '../types/admin';

interface StatusDotProps {
  status: Status;
}

export const StatusDot = ({ status }: StatusDotProps) => {
  const colors: Record<Status, string> = { Activo: "#22c55e", Reportado: "#f59e0b", Pendiente: "#94a3b8" };
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: colors[status], display: "inline-block" }} />
      <span style={{ color: colors[status], fontSize: 13 }}>{status}</span>
    </span>
  );
};