// src/shared/components/EmptyState.tsx

interface EmptyStateProps {
  icon: string;
  message: string;
  muted: string;
}

export const EmptyState = ({ icon, message, muted }: EmptyStateProps) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "36px 20px",
      gap: 8,
    }}
  >
    <span style={{ fontSize: 30, opacity: 0.25 }}>{icon}</span>
    <span style={{ fontSize: 13, color: muted, textAlign: "center" }}>{message}</span>
    <span style={{ fontSize: 11, color: muted, opacity: 0.5, textAlign: "center" }}>
      Los datos aparecerán aquí cuando se conecte el backend.
    </span>
  </div>
);