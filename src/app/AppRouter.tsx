import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { VisitanteOfertaPortafolioPage } from '../pages/VisitanteOfertaPortafolioPage';
import { VisitantePortafolioPage } from '../pages/VisitantePortafolioPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { DeveloperDashboardPage } from '../features/dashboard/pages/DeveloperDashboardPage';

function AdminPage() {
  return <h1>Admin</h1>;
}

function ProfilePage() {
  return <h1>Profile</h1>;
}

function ExplorePage() {
  return <h1>Explore</h1>;
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      // Si el elemento aún no está montado, intenta un poco después.
      const timeout = window.setTimeout(() => {
        const delayedEl = document.getElementById(id);
        delayedEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);

      return () => window.clearTimeout(timeout);
    }

    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Temporary direct access while authentication is still pending. */}
        <Route path="/dev-dashboard" element={<DeveloperDashboardPage />} />
        {/* Compatibility route while teammates connect login and role-based redirects. */}
        <Route path="/dashboard" element={<DeveloperDashboardPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/visitante" element={<VisitanteOfertaPortafolioPage />} />
        <Route path="/portafolio/:id" element={<VisitantePortafolioPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/explore" element={<ExplorePage />} />
      </Routes>
    </BrowserRouter>
  );
}

