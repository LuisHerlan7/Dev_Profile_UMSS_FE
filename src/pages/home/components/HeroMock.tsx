import { cn } from '@shared/utils/cn';

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-3 rounded-full bg-slate-200/80',
        'animate-pulse motion-reduce:animate-none',
        className
      )}
    />
  );
}

function Chip({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 shadow-sm">
      {children}
    </span>
  );
}

export function HeroMock() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[28px] bg-gradient-to-br from-[#6C63FF]/20 via-white to-transparent blur-2xl" />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_-18px_rgba(15,23,42,0.25)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-[#6C63FF]/15" />
            <div className="grid gap-1">
              <div className="text-sm font-semibold text-slate-900">Your Profile</div>
              <div className="text-xs text-slate-500">UMSS Developer</div>
            </div>
          </div>
          <Chip>Synced</Chip>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-700">Profile</div>
              <Chip>Public</Chip>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-slate-200/80" />
              <div className="flex-1">
                <SkeletonLine className="w-3/4" />
                <SkeletonLine className="mt-2 w-1/2" />
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              <SkeletonLine className="w-full" />
              <SkeletonLine className="w-11/12" />
              <SkeletonLine className="w-4/5" />
            </div>
          </div>

          <div className="grid gap-3">
            {['Project A', 'Project B', 'Project C'].map((title) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-700">{title}</div>
                  <span className="text-[11px] font-medium text-slate-500">GitHub</span>
                </div>
                <div className="mt-3 grid gap-2">
                  <SkeletonLine className="w-5/6" />
                  <SkeletonLine className="w-2/3" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Chip>React</Chip>
                  <Chip>TypeScript</Chip>
                  <Chip>API</Chip>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

