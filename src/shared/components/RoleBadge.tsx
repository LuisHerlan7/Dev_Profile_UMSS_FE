// src/shared/components/RoleBadge.tsx

import { Role } from '../types/admin';

interface RoleBadgeProps {
  role: Role;
}

export const RoleBadge = ({ role }: RoleBadgeProps) => {
  const styles: Record<Role, { bg: string; color: string }> = {
    DESARROLLADOR: { bg: "#1e3a5f", color: "#60a5fa" },
    ALUMNO:        { bg: "#3b1f5e", color: "#a78bfa" },
    MODERADOR:     { bg: "#1e4d3b", color: "#34d399" },
  };
  const s = styles[role];
  return (
    <span style={{ background: s.bg, color: s.color, padding: "2px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em" }}>
      {role}
    </span>
  );
};