import type { ReactNode } from 'react';

export function SectionHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-[var(--umss-border)] bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.2)] sm:p-6 xl:flex-row xl:items-end xl:justify-between">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-[var(--umss-brand)]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
