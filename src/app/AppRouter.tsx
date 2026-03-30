import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
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

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Temporary direct access while authentication is still pending. */}
        <Route path="/dev-dashboard" element={<DeveloperDashboardPage />} />
        {/* Compatibility route while teammates connect login and role-based redirects. */}
        <Route path="/dashboard" element={<DeveloperDashboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/explore" element={<ExplorePage />} />
      </Routes>
    </BrowserRouter>
  );
}

