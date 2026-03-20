// src/shared/types/admin.ts

export type Role = "DESARROLLADOR" | "ALUMNO" | "MODERADOR";
export type Status = "Activo" | "Reportado" | "Pendiente";
export type Tab = "Todos los Reservas" | "Contenido Reportado" | "Logs del Sistema";

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  status: Status;
  lastActivity: string;
}

export interface SecurityEvent {
  id: number;
  color: string;
  title: string;
  subtitle: string;
}

export interface StatCard {
  icon: string;
  label: string;
  accent: string;
}