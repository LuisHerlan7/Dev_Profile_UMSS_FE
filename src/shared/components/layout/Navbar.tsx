import { useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@shared/utils/cn';
import { Button } from '@shared/components/ui/Button';

function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn('h-9 w-9', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M20 3.5c9.1 0 16.5 7.4 16.5 16.5S29.1 36.5 20 36.5 3.5 29.1 3.5 20 10.9 3.5 20 3.5Z"
        stroke="#6C63FF"
        strokeWidth="2.4"
      />
      <path
        d="M12.2 22.3c2.7-6.2 5.7-9.4 8.9-9.4 3.9 0 6.6 4.6 8.1 13.9"
        stroke="#6C63FF"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M12.2 22.3h15.6"
        stroke="#6C63FF"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {open ? (
        <path
          d="M6 6l12 12M18 6 6 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M4 7h16M4 12h16M4 17h16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

type NavItem = { label: string; href: string; kind: 'hash' | 'route' };

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const navItems = useMemo<NavItem[]>(
    () => [
      { label: 'Beneficios', href: '#benefits', kind: 'hash' },
      { label: 'Cómo funciona', href: '#how-it-works', kind: 'hash' },
      { label: 'Explorar', href: '/visitante', kind: 'route' },
    ],
    []
  );

  function onHashClick(href: string) {
    setOpen(false);

    // Si no estamos en Home, vamos a Home con hash. Al llegar se hará el scroll.
    if (location.pathname !== '/') {
      navigate({ pathname: '/', hash: href });
      return;
    }

    const id = href.replace('#', '');
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/70 backdrop-blur">
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <LogoMark />
            <span className="text-sm font-semibold tracking-tight sm:text-base">
              Dev Profile UMSS
            </span>
          </Link>

          <nav className="hidden items-center justify-center gap-8 md:flex">
            {navItems.map((item) =>
              item.kind === 'hash' ? (
                <button
                  key={item.href}
                  onClick={() => onHashClick(item.href)}
                  className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
                >
                  {item.label}
                </button>
              ) : (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'text-sm font-medium transition',
                      isActive ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link to="/login" className="rounded-lg px-2 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Iniciar sesión
            </Link>
            <Link to="/register">
              <Button size="sm">Registrarse</Button>
            </Link>
          </div>

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <MenuIcon open={open} />
          </button>
        </div>

        {open ? (
          <div className="md:hidden">
            <div className="grid gap-1 pb-4">
              {navItems.map((item) =>
                item.kind === 'hash' ? (
                  <button
                    key={item.href}
                    onClick={() => onHashClick(item.href)}
                    className="rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    {item.label}
                  </Link>
                )
              )}

              <div className="mt-2 grid gap-2 px-1">
                <Link to="/login" onClick={() => setOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setOpen(false)}>
                  <Button className="w-full">Registrarse</Button>
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

