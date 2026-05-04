import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { VisitanteOfertaPortafolioPage } from '../features/dashboard/pages/visitante/VisitanteOfertaPortafolioPage';
import { NewProjectPage } from '../features/dashboard/pages/desarrollador/NewProjectPage';
import { VisitantePortafolioPage } from '../features/dashboard/pages/visitante/VisitantePortafolioPage';
import { VisitanteProyectoDetallePage } from '../features/dashboard/pages/visitante/VisitanteProyectoDetallePage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { AuthCallbackPage } from '../features/auth/pages/AuthCallbackPage';
import { DeveloperDashboardPage } from '../features/dashboard/pages/desarrollador/DeveloperDashboardPage';
import { EditProjectPage } from '../features/dashboard/pages/desarrollador/EditProjectPage';
import { ProjectDetailsPage } from '../features/dashboard/pages/desarrollador/ProjectDetailsPage';
import { DashboardPageAdmin } from '../features/dashboard/pages/adminstrador/DashboardPageAdmin';
import { getRedirectPathForRole, readStoredAuthSession } from '@services/auth';

function ProfilePage() {
  return <h1>Profile</h1>;
}

function ExplorePage() {
  return <h1>Explore</h1>;
}

function DashboardEntryPage() {
  const storedSession = readStoredAuthSession();

  if (!storedSession?.user) {
    return <Navigate to="/login" replace />;
  }

  const role = storedSession.user.role;

  // Si es administrador, renderizamos su dashboard (o redirigimos si prefieres /admin)
  if (role === 'admin' || role === 'administrador') {
    return <DashboardPageAdmin />;
  }

  // Por defecto (si es desarrollador), renderizamos su dashboard
  return <DeveloperDashboardPage />;
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
        <Route path="/dashboard" element={<DashboardEntryPage />} />
        <Route path="/desarrollador" element={<DashboardEntryPage />} />
        <Route path="/admin" element={<DashboardPageAdmin />} />
        <Route path="/visitante" element={<VisitanteOfertaPortafolioPage />} />
        <Route path="/portafolio/:id" element={<VisitantePortafolioPage />} />
        <Route path="/portafolio/:portfolioId/proyecto/:projectId" element={<VisitanteProyectoDetallePage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/nuevo-proyecto" element={<NewProjectPage />} />
        <Route path="/editar-proyecto/:projectId" element={<EditProjectPage />} />
        <Route path="/proyecto/:projectId" element={<ProjectDetailsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

