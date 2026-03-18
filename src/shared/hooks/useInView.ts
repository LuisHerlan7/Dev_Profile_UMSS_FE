import { RefObject, useEffect, useMemo, useRef, useState } from 'react';

export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit): {
  ref: RefObject<T>;
  isInView: boolean;
} {
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  const opts = useMemo<IntersectionObserverInit>(
    () => ({
      root: options?.root ?? null,
      rootMargin: options?.rootMargin ?? '0px 0px -15% 0px',
      threshold: options?.threshold ?? 0.1,
    }),
    [options?.root, options?.rootMargin, options?.threshold]
  );

  useEffect(() => {
    if (isInView) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) setIsInView(true);
    }, opts);

    observer.observe(el);
    return () => observer.disconnect();
  }, [isInView, opts]);

  return { ref, isInView };
}

