import { DashboardCard } from '@shared/components/dashboard/DashboardCard';
import { ExperienceTimelineCard, type ExperienceEntry } from './ExperienceTimelineCard';
import { SectionHeading } from './SectionHeading';

const quickSettings = [
  {
    title: 'Privacidad del perfil',
    description: 'Define que secciones del portafolio seran visibles al publico.',
  },
  {
    title: 'Preferencias de contacto',
    description: 'Prepara la base para correo institucional, LinkedIn y GitHub.',
  },
  {
    title: 'Notificaciones',
    description: 'Base UI lista para alertas de visitas, mensajes y colaboraciones.',
  },
] as const;

export function ExperienceSection({ entries }: { entries: ExperienceEntry[] }) {
  const workCount = entries.filter((entry) => entry.type === 'work').length;
  const studyCount = entries.filter((entry) => entry.type === 'study').length;

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Experiencia profesional"
        title="Experiencia y Formacion"
        description="Vista resumida para revisar cargos, periodos y formacion antes de conectar edicion real."
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_320px]">
        <ExperienceTimelineCard entries={entries} showEmptyState />

        <DashboardCard title="Resumen del perfil" description="Puntos fuertes visibles para reclutadores.">
          <div className="space-y-3">
            <HighlightRow
              title={`${workCount || 0} experiencias clave`}
              description={
                workCount > 0
                  ? 'Tus cargos recientes ya estan visibles en el panel.'
                  : 'Agrega tu primera experiencia laboral para mostrar tu trayectoria.'
              }
            />
            <HighlightRow
              title={`${studyCount || 0} formaciones registradas`}
              description={
                studyCount > 0
                  ? 'Tu formacion academica ya aparece en el perfil.'
                  : 'Incluye tu formacion academica para completar tu historial.'
              }
            />
            <HighlightRow
              title="Disponibilidad"
              description="Perfil listo para ser conectado a postulaciones y networking."
            />
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}

export function SettingsSection() {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Configuracion"
        title="Configuracion de Perfil"
        description="Base frontend preparada para que tu equipo conecte preferencias, privacidad y notificaciones mas adelante."
      />

      <DashboardCard title="Preferencias disponibles" description="Controles UI listos para conectar con backend.">
        <div className="grid gap-4 md:grid-cols-3">
          {quickSettings.map((setting) => (
            <div
              key={setting.title}
              className="rounded-[24px] border border-[var(--umss-border)] bg-[var(--umss-surface)] p-4"
            >
              <p className="text-sm font-semibold text-slate-900">{setting.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{setting.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[24px] border border-dashed border-[rgba(80,72,229,0.22)] bg-[rgba(240,240,255,0.45)] p-4 text-sm text-slate-600">
          Esta seccion se dejo intencionalmente desacoplada de rutas y servicios para que
          despues puedan conectar control de privacidad, notificaciones y datos del perfil
          sin rehacer la UI.
        </div>
      </DashboardCard>
    </div>
  );
}

function HighlightRow({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-[var(--umss-border)] bg-[var(--umss-surface)] p-4">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}
