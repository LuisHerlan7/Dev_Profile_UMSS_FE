import type { PropsWithChildren } from 'react';
import { cn } from '@shared/utils/cn';
import { useInView } from '@shared/hooks/useInView';

export function FadeInSection({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  const { ref, isInView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn(
        'transition duration-700 will-change-transform',
        isInView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        className
      )}
    >
      {children}
    </div>
  );
}

