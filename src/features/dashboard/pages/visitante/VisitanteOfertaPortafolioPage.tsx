import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@shared/components/layout/Navbar';
import { DashboardBadge } from '@shared/components/dashboard/DashboardBadge';
import { DashboardCard } from '@shared/components/dashboard/DashboardCard';
import { useAuthSession } from '@shared/hooks/useAuthSession';
import { resolveRoleLabel } from '@services/auth';
import { FadeInSection } from '../../../../pages/home/components/FadeInSection';



type Portfolio = {
  id: number;
  name: string;
  title: string;
  level: 'Senior' | 'Semi-Senior' | 'Junior';
  type: 'Full Stack' | 'Frontend' | 'Backend' | 'Data';
  tags: string[];
};

const portfolios: Portfolio[] = [
  { id: 1, name: 'Alejandro Vargas', title: 'Arquitecto Full Stack', level: 'Senior', type: 'Full Stack', tags: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'] },
  { id: 2, name: 'Mariana Rios', title: 'Diseñadora UI/UX y Dev Frontend', level: 'Semi-Senior', type: 'Frontend', tags: ['Figma', 'Vue.js', 'Tailwind', 'Next.js'] },
  { id: 3, name: 'Carlos Mendez', title: 'Especialista Backend', level: 'Junior', type: 'Backend', tags: ['Python', 'Django', 'PostgreSQL', 'Docker'] },
  { id: 4, name: 'Sofía Blanco', title: 'Ingeniera de Datos', level: 'Senior', type: 'Data', tags: ['PySpark', 'AWS', 'SQL', 'Airflow'] },
  { id: 5, name: 'Mateo Flores', title: 'Desarrollador Móvil', level: 'Semi-Senior', type: 'Frontend', tags: ['Flutter', 'Dart', 'Firebase', 'API'] },
  { id: 6, name: 'Valentina Gomez', title: 'Ingeniera DevOps', level: 'Senior', type: 'Backend', tags: ['Kubernetes', 'Docker', 'Terraform', 'CI/CD'] },
  { id: 7, name: 'Julián Salazar', title: 'Especialista en Ciberseguridad', level: 'Senior', type: 'Backend', tags: ['Rust', 'Linux', 'Go', 'Pentesting'] },
  { id: 8, name: 'Lucía Fernández', title: 'Investigadora de IA / ML', level: 'Semi-Senior', type: 'Data', tags: ['PyTorch', 'Scikit-learn', 'OpenCV', 'Data Science'] },
];

export function VisitanteOfertaPortafolioPage() {
  const navigate = useNavigate();
  const { session, isLoading, error } = useAuthSession({
    requiredRole: 'visitante',
    redirectTo: '/login',
  });
  const [query, setQuery] = useState('');
  const [technologyFilter, setTechnologyFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | 'Senior' | 'Semi-Senior' | 'Junior'>('all');
  const [profileFilter, setProfileFilter] = useState<'all' | 'Full Stack' | 'Frontend' | 'Backend' | 'Data'>('all');

  const technologyOptions = ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Figma', 'Vue.js', 'Tailwind', 'Next.js', 'Python', 'Django', 'Docker', 'AWS'];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
      return portfolios.filter((item) => {
        const levelMatch = levelFilter === 'all' || item.level === levelFilter;
        const technologyMatch = technologyFilter === 'all' || item.tags.some((tag) => tag === technologyFilter);
        const profileMatch = profileFilter === 'all' || item.type === profileFilter;
        const textMatch =
          item.name.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.tags.some((tag) => tag.toLowerCase().includes(q));
        return levelMatch && technologyMatch && profileMatch && (q.length === 0 || textMatch);
      });
  }, [query, levelFilter, technologyFilter, profileFilter]);

  if (isLoading && !session) {
    return (
      <main className="min-h-screen bg-[var(--umss-surface)]">
        <Navbar />
        <div className="container-page py-10">
          <DashboardCard title="Cargando tu panel" description="Estamos preparando tu vista de visitante.">
            <p className="text-sm text-slate-600">
              Validamos tu sesion antes de mostrar los perfiles disponibles.
            </p>
          </DashboardCard>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-[var(--umss-surface)]">
        <Navbar />
        <div className="container-page py-10">
          <DashboardCard title="No pudimos cargar tu sesion" description={error || 'Vuelve a iniciar sesion para continuar.'}>
            <p className="text-sm text-slate-600">
              El explorador de portafolios requiere una sesion activa de visitante.
            </p>
          </DashboardCard>
        </div>
      </main>
    );
  }

  const profileRole = session.dashboard?.profile_role_label || resolveRoleLabel(session.user.role);
  const profileInitials = session.user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <main className="vp-container">
      <style>{`
        .vp-container {
          padding: 16px;
          max-width: 1200px;
          margin: 0 auto;
          font-family: Inter, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
        }

        .vp-header { margin-bottom: 24px; }
        .vp-title { font-size: 2rem; font-weight: 700; margin: 0 0 8px; }
        .vp-subtitle { margin: 0 0 16px; color: #475569; }

        .vp-search-wrap { display: grid; gap: 12px; width: 100%; margin-bottom: 16px; }
        .vp-input { width: 100%; min-height: 44px; border: 1px solid #cbd5e1; border-radius: 12px; padding: 12px 14px; font-size: 1rem; }

        .vp-filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
        .vp-btn { border: 1px solid #cbd5e1; border-radius: 100px; padding: 8px 14px; background: #fff; color: #0f172a; cursor: pointer; font-weight: 500; transition: all .2s ease; }
        .vp-btn:hover { transform: translateY(-1px); border-color: #6366f1; color: #1e40af; }
        .vp-btn.active { background: #6366f1; border-color: #6366f1; color: #fff; }
        .vp-filter-group { display: flex; flex-direction: column; gap: 6px; min-width: 190px; }
        .vp-filter-group label { font-weight: 700; color: #4f5f7d; font-size: 0.85rem; }
        .vp-select { width: 100%; border: 1px solid #cbd5e1; border-radius: 10px; padding: 8px 10px; background: #fff; color: #1f2a45; }
        .vp-clear { display: grid;height: 35px; width: 190px;margin-top: 25px;margin-left: 40px; background: #f8fafc; color: #1f2a45; border: 1px solid #cbd5e1;}
        .vp-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 16px; }
        .vp-card { border: 1px solid #e2e8f0; border-radius: 14px; background: #fff; padding: 16px; box-shadow: 0 2px 8px rgba(15,23,42,0.05); transition: transform .2s ease, box-shadow .2s ease; }
        .vp-card:hover { transform: scale(1.03); box-shadow: 0 8px 20px rgba(15,23,42,0.18); }
        .vp-card-top { display: flex; align-items: center; gap: 12px; }
        .vp-avatar { width: 46px; height: 46px; border-radius: 50%; background: #e0e7ff; display: grid; place-items: center; color: #3730a3; font-weight: 700; }
        .vp-name { margin: 0; font-size: 1.05rem; font-weight: 700; }
        .vp-role { margin: 2px 0 8px; color: #64748b; font-size: 0.95rem; }

        .vp-level { display: inline-block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 999px; background: #f1f5f9; color: #334155; }
        .vp-tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0; }
        .vp-tag { font-size: 0.78rem; padding: 4px 8px; border-radius: 999px; background: #eef2ff; color: #3730a3; border: 1px solid #c7d2fe; }

        .vp-link { border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 8px; text-decoration: none; display: inline-block; color: #3b82f6; font-weight: 700; }
        .vp-link:hover { background: #eff6ff; }

        .vp-pagination { display: flex; justify-content: center; gap: 10px; margin-top: 24px; }
        .vp-page { border: 1px solid #cbd5e1; background: #fff; color: #0f172a; padding: 8px 13px; border-radius: 8px; min-width: 36px; text-align: center; cursor: pointer; }

        @media (min-width: 640px) { .vp-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (min-width: 1024px) { .vp-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
      `}</style>

      <div className="-mt-[10px]">
        <Navbar />
      </div>

      <FadeInSection>
        <div className="mb-6">
          <DashboardCard
            title={session.dashboard?.welcome_title || 'Tu panel de visitante'}
            description={session.dashboard?.welcome_message || 'Explora portafolios y perfiles de la comunidad UMSS.'}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--umss-brand)]">Sesion activa</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">{session.user.name}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  <DashboardBadge tone="brand">{profileRole}</DashboardBadge>
                  <DashboardBadge>{session.user.email}</DashboardBadge>
                </div>
              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#6C63FF] via-[var(--umss-brand)] to-[var(--umss-accent)] text-lg font-semibold text-white shadow-lg shadow-[rgba(80,72,229,0.28)]">
                {profileInitials || 'VU'}
              </div>
            </div>
          </DashboardCard>
        </div>
      </FadeInSection>

      <FadeInSection>
        <section className="vp-header">
          <h1 className="vp-title">Explorador de Portafolios</h1>
          <p className="vp-subtitle">Descubre y conecta con los mejores talentos de la comunidad UMSS.</p>

          <div className="vp-search-wrap">
            <input
              aria-label="Buscar portafolios"
              className="vp-input"
              placeholder="Buscar por nombre, lenguaje, especialidad..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <div className="vp-filters">
              <div className="vp-filter-group">
                <label>Tecnología</label>
                <select value={technologyFilter} onChange={(e) => setTechnologyFilter(e.target.value)} className="vp-select">
                  <option value="all">Todas</option>
                  {technologyOptions.map((tech) => (
                    <option value={tech} key={tech}>{tech}</option>
                  ))}
                </select>
              </div>

              <div className="vp-filter-group">
                <label>Nivel de Experiencia</label>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value as 'all' | 'Senior' | 'Semi-Senior' | 'Junior')}
                  className="vp-select"
                >
                  <option value="all">Todos</option>
                  <option value="Senior">Senior</option>
                  <option value="Semi-Senior">Semi-Senior</option>
                  <option value="Junior">Junior</option>
                </select>
              </div>

              <div className="vp-filter-group">
                <label>Tipo de Perfil</label>
                <select
                  value={profileFilter}
                  onChange={(e) => setProfileFilter(e.target.value as 'all' | 'Full Stack' | 'Frontend' | 'Backend' | 'Data')}
                  className="vp-select"
                >
                  <option value="all">Todos</option>
                  <option value="Full Stack">Full Stack</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Data">Data</option>
                </select>
              </div>

              <button type="button" className="vp-btn vp-clear" onClick={() => {
                setQuery('');
                setTechnologyFilter('all');
                setLevelFilter('all');
                setProfileFilter('all');
              }}>
                Limpiar Filtros
              </button>
            </div>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section className="vp-grid">
          {filtered.map((portfolio) => (
            <article key={portfolio.id} className="vp-card">
              <div className="vp-card-top">
                <span className="vp-avatar">{portfolio.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}</span>
                <div>
                  <p className="vp-name">{portfolio.name}</p>
                  <p className="vp-role">{portfolio.title}</p>
                </div>
              </div>

              <span className="vp-level">{portfolio.level}</span>

              <div className="vp-tags">
                {portfolio.tags.map((tag) => (
                  <span key={tag} className="vp-tag">{tag}</span>
                ))}
              </div>

              <button
                type="button"
                className="vp-link"
                onClick={() => navigate(`/portafolio/${portfolio.id}`)}
              >
                Ver Portafolio →
              </button>
            </article>
          ))}

          {filtered.length === 0 && <p>No se encontraron resultados.</p>}
        </section>
      </FadeInSection>

      <nav className="vp-pagination" aria-label="Paginación">
        <button className="vp-page" type="button">1</button>
        <button className="vp-page" type="button">2</button>
        <button className="vp-page" type="button">3</button>
        <button className="vp-page" type="button">Siguiente</button>
      </nav>
    </main>
  );
}
