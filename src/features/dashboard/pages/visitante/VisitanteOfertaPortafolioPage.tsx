import { Fragment, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@shared/components/layout/Navbar';
import { FadeInSection } from '../../../../pages/home/components/FadeInSection';
import { fetchPublicPortfolios, type PublicPortfolioCard } from '../../api/developerDashboard';
import { useI18n } from '@shared/i18n/I18nProvider';
import {
  experienceLevelBadgeClass,
  formatExperienceLevelLabel,
  type ExperienceLevel,
} from '@shared/utils/experienceLevel';
import { Search, X, ChevronDown, Filter } from 'lucide-react';

type Portfolio = PublicPortfolioCard;

type LevelFilter = 'all' | ExperienceLevel;
type ProfileFilter = 'all' | Portfolio['type'];

const ITEMS_PER_PAGE = 9;

function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos/diacríticos
    .replace(/[^a-z0-9]/g, ''); // Elimina espacios, guiones y caracteres especiales
}

function getDisplayRole(item: Portfolio, filter: string, searchQuery: string): string {
  const normFilter = filter !== 'all' ? normalizeText(filter) : '';
  const normQuery = normalizeText(searchQuery);

  const allRoles = [item.title, ...(item.roles || [])];

  // 1. Si hay filtro de perfil activo, tiene prioridad
  if (normFilter) {
    const exact = allRoles.find(r => normalizeText(r) === normFilter);
    if (exact) return exact;
    const partial = allRoles.find(r => normalizeText(r).includes(normFilter));
    if (partial) return partial;
  }

  // 2. Si no hay filtro pero hay texto en la barra de búsqueda, adaptamos al rol que coincida con el texto
  if (normQuery) {
    const exact = allRoles.find(r => normalizeText(r) === normQuery);
    if (exact) return exact;
    const partial = allRoles.find(r => normalizeText(r).includes(normQuery));
    if (partial) return partial;
  }

  return item.title;
}

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

  const profileTypeOptions = useMemo(() => {
    const allTypes = new Set<string>();
    portfolios.forEach(p => {
      if (p.type) allTypes.add(p.type);
      if (p.title) allTypes.add(p.title);
      if (Array.isArray(p.roles)) {
        p.roles.forEach(r => {
          if (r) allTypes.add(r);
        });
      }
    });
    return Array.from(allTypes).sort();
  }, [portfolios]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const searchWords = q.split(/\s+/).filter(Boolean);

    const getMatchesFilter = (item: Portfolio, filter: string): boolean => {
      if (filter === 'all') return true;
      
      const normFilter = normalizeText(filter);
      
      // Coincidencia exacta de forma normalizada
      if (item.type && normalizeText(item.type) === normFilter) return true;
      if (item.title && normalizeText(item.title) === normFilter) return true;
      if (item.roles && item.roles.some(r => normalizeText(r) === normFilter)) return true;

      // Coincidencia parcial de forma normalizada
      const allRoles = [item.title, item.type, ...(item.roles || [])].map(r => normalizeText(r));
      return allRoles.some(r => r.includes(normFilter));
    };

    return portfolios.filter((item) => {
      const levelMatch = levelFilter === 'all' || item.experienceLevel === levelFilter;
      const technologyMatch = technologyFilter === 'all' || item.tags.some((tag) => tag === technologyFilter);
      const profileMatch = getMatchesFilter(item, profileFilter);
      
      const textMatch = searchWords.every((word) => {
        const normWord = normalizeText(word);
        if (!normWord) return true;
        return (
          normalizeText(item.name).includes(normWord) ||
          normalizeText(item.title).includes(normWord) ||
          normalizeText(item.type).includes(normWord) ||
          (item.roles || []).some(r => normalizeText(r).includes(normWord)) ||
          item.tags.some((tag) => normalizeText(tag).includes(normWord))
        );
      });

      return levelMatch && technologyMatch && profileMatch && (searchWords.length === 0 || textMatch);
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

        .vp-search-box { position: relative; width: 100%; margin-bottom: 24px; }
        .vp-input { width: 100%; min-height: 52px; border: 1px solid #e2e8f0; border-radius: 16px; padding: 12px 48px 12px 48px; font-size: 1rem; background: #fff; transition: all .2s ease; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
        .vp-input:focus { border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99,102,241,0.1); outline: none; }
        .vp-search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; width: 20px; height: 20px; }
        .vp-filters-grid { display: grid; gap: 16px; width: 100%; margin-bottom: 32px; grid-template-columns: 1fr; }
        @media (min-width: 640px) {
          .vp-filters-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .vp-filters-grid { grid-template-columns: 240px repeat(2, 1fr) auto; }
        }
        .vp-filter-group { display: flex; flex-direction: column; gap: 8px; }
        .vp-filter-label { font-weight: 700; color: #475569; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .vp-select-wrap { position: relative; width: 100%; }
        .vp-select { width: 100%; border: 1px solid #818cf8; border-radius: 14px; padding: 10px 36px 10px 14px; background: #fff; color: #1e293b; font-size: 0.9rem; font-weight: 600; appearance: none; cursor: pointer; transition: all 0.2s ease; }
        .vp-select:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); outline: none; }
        
        .vp-clear-btn { align-self: flex-end; display: inline-flex; items-center justify-content: center; gap: 6px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 18px; background: #f8fafc; color: #475569; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all .2s ease; min-height: 44px; margin-top: auto; }
        .vp-clear-btn:hover { border-color: #cbd5e1; background: #f1f5f9; color: #0f172a; }
        .vp-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 16px; }
        .vp-card { border: 1px solid #e2e8f0; border-radius: 14px; background: #fff; padding: 16px; box-shadow: 0 2px 8px rgba(15,23,42,0.05); transition: transform .2s ease, box-shadow .2s ease; }
        .vp-card:hover { transform: scale(1.03); box-shadow: 0 8px 20px rgba(15,23,42,0.18); }
        .vp-card-top { display: flex; align-items: center; gap: 12px; }
        .vp-avatar { width: 46px; height: 46px; border-radius: 50%; background: #e0e7ff; display: grid; place-items: center; color: #3730a3; font-weight: 700; overflow: hidden; }
        .vp-name { margin: 0; font-size: 1.05rem; font-weight: 700; }
        .vp-role { margin: 2px 0 8px; color: #64748b; font-size: 0.95rem; }

        .vp-level { display: inline-block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 999px; }
        .vp-level--senior { background: #dcfce7; color: #166534; }
        .vp-level--semi_senior { background: #fef9c3; color: #854d0e; }
        .vp-level--junior { background: #f1f5f9; color: #334155; }
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

          <div className="vp-search-box">
            <Search className="vp-search-icon" />
            <input
              aria-label={t('common.search')}
              className="vp-input"
              placeholder={t('visitor.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>          <div className="vp-filters-grid">
            <div className="vp-filter-group">
              <label className="vp-filter-label">{t('visitor.technology')}</label>
              <div className="vp-select-wrap">
                <select value={technologyFilter} onChange={(e) => setTechnologyFilter(e.target.value)} className="vp-select">
                  <option value="all">{t('visitor.allFemale')}</option>
                  {technologyOptions.map((tech) => (
                    <option value={tech} key={tech}>{tech}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="vp-filter-group">
              <label className="vp-filter-label">{t('visitor.level')}</label>
              <div className="vp-select-wrap">
                <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value as LevelFilter)} className="vp-select">
                  <option value="all">{t('visitor.all')}</option>
                  <option value="senior">Senior</option>
                  <option value="semi-senior">Semi-Senior</option>
                  <option value="junior">Junior</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="vp-filter-group">
              <label className="vp-filter-label">{t('visitor.profileType')}</label>
              <div className="vp-select-wrap">
                <select value={profileFilter} onChange={(e) => setProfileFilter(e.target.value as ProfileFilter)} className="vp-select">
                  <option value="all">{t('visitor.all')}</option>
                  {profileTypeOptions.map((type) => (
                    <option value={type} key={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <button
              type="button"
              className="vp-clear-btn"
              onClick={() => {
                setQuery('');
                setTechnologyFilter('all');
                setLevelFilter('all');
                setProfileFilter('all');
              }}
            >
              <X className="h-4 w-4" />
              {t('visitor.clearFilters')}
            </button>
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
                  <p className="vp-role">{getDisplayRole(portfolio, profileFilter, query)}</p>
                </div>
              </div>

              <span className={experienceLevelBadgeClass(portfolio.experienceLevel)}>
                {formatExperienceLevelLabel(portfolio.experienceLevel)}
              </span>

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
