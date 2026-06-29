import { Fragment, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@shared/components/layout/Navbar';
import { FadeInSection } from '../../../../pages/home/components/FadeInSection';
import { fetchPublicPortfolios } from '../../api/developerDashboard';
import { useI18n } from '@shared/i18n/I18nProvider';

type Portfolio = {
  id: number;
  name: string;
  title: string;
  level: 'Senior' | 'Semi-Senior' | 'Junior';
  type: 'Full Stack' | 'Frontend' | 'Backend' | 'Data';
  tags: string[];
  avatarUrl?: string;
};

type LevelFilter = 'all' | Portfolio['level'];
type ProfileFilter = 'all' | Portfolio['type'];

const ITEMS_PER_PAGE = 9;

export function VisitanteOfertaPortafolioPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [technologyFilter, setTechnologyFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [profileFilter, setProfileFilter] = useState<ProfileFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await fetchPublicPortfolios();
        setPortfolios(data);
      } catch (err) {
        console.error('Error al cargar portafolios', err);
        setError('No se pudieron cargar los portafolios. Por favor, intenta de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const technologyOptions = useMemo(() => {
    const allTags = new Set<string>();
    portfolios.forEach(p => p.tags.forEach(t => allTags.add(t)));
    return Array.from(allTags).sort();
  }, [portfolios]);

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
  }, [query, levelFilter, technologyFilter, profileFilter, portfolios]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const visiblePortfolios = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filtered]);

  const pageItems = useMemo(() => {
    const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
    return Array.from(pages)
      .filter((page) => page >= 1 && page <= totalPages)
      .sort((a, b) => a - b);
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, levelFilter, technologyFilter, profileFilter]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

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
        .vp-avatar { width: 46px; height: 46px; border-radius: 50%; background: #e0e7ff; display: grid; place-items: center; color: #3730a3; font-weight: 700; overflow: hidden; }
        .vp-name { margin: 0; font-size: 1.05rem; font-weight: 700; }
        .vp-role { margin: 2px 0 8px; color: #64748b; font-size: 0.95rem; }

        .vp-level { display: inline-block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 999px; background: #f1f5f9; color: #334155; }
        .vp-tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0; }
        .vp-tag { font-size: 0.78rem; padding: 4px 8px; border-radius: 999px; background: #eef2ff; color: #3730a3; border: 1px solid #c7d2fe; }

        .vp-link { border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 8px; text-decoration: none; display: inline-block; color: #3b82f6; font-weight: 700; }
        .vp-link:hover { background: #eff6ff; }

        .vp-pagination { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; margin-top: 24px; padding-bottom: 8px; }
        .vp-page { border: 1px solid #cbd5e1; background: #fff; color: #0f172a; padding: 8px 13px; border-radius: 8px; min-width: 38px; min-height: 38px; text-align: center; cursor: pointer; font-weight: 700; transition: all .2s ease; }
        .vp-page:hover:not(:disabled) { border-color: #6366f1; color: #3730a3; transform: translateY(-1px); }
        .vp-page.active { background: #6366f1; border-color: #6366f1; color: #fff; }
        .vp-page:disabled { cursor: not-allowed; opacity: .45; }
        .vp-page-label { min-width: 92px; }
        .vp-page-ellipsis { color: #64748b; font-weight: 700; padding: 0 2px; }

        @media (min-width: 640px) { .vp-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (min-width: 1024px) { .vp-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (max-width: 520px) {
          .vp-container { padding: 12px; }
          .vp-title { font-size: 1.65rem; }
          .vp-filter-group, .vp-clear { width: 100%; min-width: 0; margin-left: 0; }
          .vp-clear { margin-top: 4px; }
          .vp-page { min-width: 36px; padding: 8px 10px; }
          .vp-page-label { min-width: 44px; font-size: 0; }
          .vp-page-label[data-short-label]::after { content: attr(data-short-label); font-size: 0.95rem; }
        }
      `}</style>

      <div className="-mt-[10px]">
        <Navbar />
      </div>

      <FadeInSection>
        <section className="vp-header">
          <h1 className="vp-title">{t('visitor.exploreTitle')}</h1>
          <p className="vp-subtitle">{t('visitor.exploreSubtitle')}</p>

          <div className="vp-search-wrap">
            <input
              aria-label={t('common.search')}
              className="vp-input"
              placeholder={t('visitor.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <div className="vp-filters">
              <div className="vp-filter-group">
                <label>{t('visitor.technology')}</label>
                <select value={technologyFilter} onChange={(e) => setTechnologyFilter(e.target.value)} className="vp-select">
                  <option value="all">{t('visitor.allFemale')}</option>
                  {technologyOptions.map((tech) => (
                    <option value={tech} key={tech}>{tech}</option>
                  ))}
                </select>
              </div>

              <div className="vp-filter-group">
                <label>{t('visitor.level')}</label>
                <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value as LevelFilter)} className="vp-select">
                  <option value="all">{t('visitor.all')}</option>
                  <option value="Senior">Senior</option>
                  <option value="Semi-Senior">Semi-Senior</option>
                  <option value="Junior">Junior</option>
                </select>
              </div>

              <div className="vp-filter-group">
                <label>{t('visitor.profileType')}</label>
                <select value={profileFilter} onChange={(e) => setProfileFilter(e.target.value as ProfileFilter)} className="vp-select">
                  <option value="all">{t('visitor.all')}</option>
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
                {t('visitor.clearFilters')}
              </button>
            </div>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section className="vp-grid">
          {isLoading && <p className="col-span-full py-12 text-center text-slate-500">{t('visitor.loading')}</p>}
          {!isLoading && error && <p className="col-span-full py-12 text-center text-red-500">{error}</p>}
          
          {!isLoading && !error && visiblePortfolios.map((portfolio) => (
            <article key={portfolio.id} className="vp-card">
              <div className="vp-card-top">
                <div className="vp-avatar">
                  {portfolio.avatarUrl ? (
                    <img 
                      src={portfolio.avatarUrl} 
                      alt={portfolio.name} 
                      className="h-full w-full object-cover rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const span = (e.target as HTMLImageElement).parentElement?.querySelector('.avatar-initials');
                        if (span) (span as HTMLElement).style.display = 'grid';
                      }}
                    />
                  ) : null}
                  <span className="avatar-initials" style={{ display: portfolio.avatarUrl ? 'none' : 'grid' }}>
                    {portfolio.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                  </span>
                </div>
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
                {t('visitor.viewPortfolio')}
              </button>
            </article>
          ))}

          {!isLoading && !error && filtered.length === 0 && (
            <p className="col-span-full py-12 text-center text-slate-500">
              {t('visitor.empty')}
            </p>
          )}
        </section>
      </FadeInSection>

      {!isLoading && !error && filtered.length > ITEMS_PER_PAGE && (
        <nav className="vp-pagination" aria-label="Paginación">
          <button
            className="vp-page vp-page-label"
            type="button"
            data-short-label="‹"
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            {t('visitor.previous')}
          </button>

          {pageItems.map((page, index) => {
            const previousPage = pageItems[index - 1];
            const showEllipsis = previousPage !== undefined && page - previousPage > 1;

            return (
              <Fragment key={page}>
                {showEllipsis && <span className="vp-page-ellipsis">...</span>}
                <button
                  className={`vp-page${page === currentPage ? ' active' : ''}`}
                  type="button"
                  aria-current={page === currentPage ? 'page' : undefined}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </button>
              </Fragment>
            );
          })}

          <button
            className="vp-page vp-page-label"
            type="button"
            data-short-label="›"
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            {t('visitor.next')}
          </button>
        </nav>
      )}
    </main>
  );
}
