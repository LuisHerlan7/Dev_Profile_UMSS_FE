import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { VisitanteOfertaPortafolioPage } from '../pages/VisitanteOfertaPortafolioPage';
import { VisitantePortafolioPage } from '../pages/VisitantePortafolioPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';

function AdminPage() {
  return <h1>Admin</h1>;
}

function ProfilePage() {
  return <h1>Profile</h1>;
}

function ExplorePage() {
  return <h1>Explore</h1>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/visitante" element={<VisitanteOfertaPortafolioPage />} />
        <Route path="/portafolio/:id" element={<VisitantePortafolioPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/explore" element={<ExplorePage />} />
      </Routes>
    </BrowserRouter>
  );
}

