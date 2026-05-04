import { Eye } from 'lucide-react';

export function SidebarVisibilityCard({
  collapsed,
  enabled,
  onToggle,
  mode = 'publico',
}: {
  collapsed: boolean;
  enabled: boolean;
  onToggle: () => void;
  mode?: 'publico' | 'privado' | 'personalizado';
}) {
  const description =
    mode === 'privado'
      ? 'Tu perfil no es visible para visitantes.'
      : mode === 'personalizado'
        ? 'Tu perfil usa una visibilidad personalizada por secciones.'
        : 'Tu perfil es publico y visible para reclutadores.';

  return (
    <div
      className={`rounded-[24px] border border-[rgba(80,72,229,0.12)] bg-[rgba(240,240,255,0.82)] shadow-[0_16px_35px_-34px_rgba(80,72,229,0.45)] ${
        collapsed ? 'p-2.5' : 'p-4'
      }`}
    >
      <div
        className={`flex ${
          collapsed ? 'flex-col items-center gap-2' : 'items-start justify-between gap-3'
        }`}
      >
        <div
          className={
            collapsed
              ? 'flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[var(--umss-brand)]'
              : ''
          }
        >
          {collapsed ? <Eye className="h-4 w-4" /> : null}

          {!collapsed ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--umss-brand)]">
                Visibilidad {mode === 'personalizado' ? 'personalizada' : ''}
              </p>
              <p className="mt-2 max-w-[180px] text-[11px] leading-relaxed text-slate-500">
                {description}
              </p>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-pressed={enabled}
          aria-label={enabled ? 'Desactivar visibilidad publica' : 'Activar visibilidad publica'}
          title={enabled ? 'Perfil publico' : 'Perfil privado'}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
            enabled ? 'bg-[var(--umss-brand)]' : 'bg-slate-300'
          }`}
        >
          <span
            className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
