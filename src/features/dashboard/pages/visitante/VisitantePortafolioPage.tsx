import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FadeInSection } from '../../../../pages/home/components/FadeInSection';
import { fetchPublicPortfolioDetail } from '../../api/developerDashboard';

interface Project {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  liveUrl?: string;
  repoUrl?: string;
}

interface TimelineItem {
  id: string;
  period: string;
  title: string;
  company: string;
  detail: string;
  type: 'experience' | 'education';
}

interface PortfolioData {
  profile: {
    id: number;
    name: string;
    title: string;
    summary: string;
    avatarUrl: string;
    email?: string | null;
    phone?: string | null;
    titleHierarchy?: string[];
    roleHierarchy?: string[];
  };
  social: Record<string, string>;
  skills: {
    id_habilidad: number;
    nombre_habilidad: string;
    tipo_habilidad: string;
    nivel_dominio: string;
    porcentaje_dominio?: number | null;
    vinculos?: Array<{
      id: number;
      tipo_referencia: string;
      etiqueta_referencia: string;
      referencia_id: number | null;
    }> | string;
  }[];
  projects: Project[];
  timeline: TimelineItem[];
  config: any;
}

function parseLinks(value: PortfolioData['skills'][number]['vinculos']) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function VisitantePortafolioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [data, setData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) {
        setError('ID de portafolio no proporcionado.');
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const result = await fetchPublicPortfolioDetail(id);
        setData(result);
      } catch (err: any) {
        console.error('Error loading portfolio detail:', err);
        setError(err.message || 'Error al cargar el portafolio.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-xl font-semibold text-slate-500 animate-pulse">Cargando portafolio del desarrollador...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Ups! Ocurrió un error</h2>
        <p className="text-lg text-slate-600 mb-8 max-w-md">{error || 'No pudimos encontrar el portafolio solicitado.'}</p>
        <button 
          onClick={() => navigate('/visitante')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          Volver al Listado
        </button>
      </div>
    );
  }

  const { profile, social, skills, projects, timeline, config } = data;
  const skillProgressByLevel: Record<string, number> = {
    basico: 25,
    intermedio: 50,
    avanzado: 75,
    experto: 100,
  };
  const technicalSkills = skills.filter((skill) => skill.tipo_habilidad === 'tecnica');
  const softSkills = skills.filter((skill) => skill.tipo_habilidad === 'blanda');

  return (
    <main className="vp-landing">
      <style>{`
        .vp-landing {font-family: 'Inter', 'Segoe UI', Helvetica, Arial, sans-serif; color: #0f172a; background: #f8fbff;}

        .vp-nav {display: flex; justify-content: space-between; align-items: center; padding: 20px 27px; border-bottom: 1px solid #e7efff; background: #fff; position: sticky; top: 0; z-index: 10;}
        .vp-nav__brand {font-size: 18px; font-weight: 800; color: #2939ff;}
        .vp-nav__list {display: flex; gap: 20px; list-style: none; margin: 0; padding: 0;}
        .vp-nav__item a {font-weight: 600; color: #32435b; text-decoration: none;}
        .vp-nav__cta {padding: 10px 16px; border-radius: 10px; border: 1px solid #2534fa; color: #fff; background: linear-gradient(90deg, #2f45ff 0%, #3949ff 100%); font-weight: 700; text-decoration: none;}

        .vp-hero {display: grid; grid-template-columns: 1fr; gap: 30px; padding: 56px 24px 44px; max-width: 1140px; margin: 0 auto;}
        .vp-hero__info {max-width: 650px; margin: 0 auto;}
        .vp-tagline {font-size: 12px; font-weight: 700; text-transform: uppercase; color: #5455ff; letter-spacing: .08em; background: rgba(94, 120, 255, 0.12); border: 1px solid rgba(89, 118, 255, 0.3); border-radius: 999px; display: inline-block; padding: 8px 14px; margin-bottom: 16px;}
        .vp-hero__title {font-size: clamp(34px, 7vw, 62px); line-height: 1.05; font-weight: 800; margin: 0; color: #1c2d73;}
        .vp-hero__title span {color: #2b4cff;}
        .vp-subtitle {font-size: clamp(16px, 2vw, 21px); color: #55617b; margin: 12px 0 22px; max-width: 620px;}

        .vp-btn-group {display: flex; gap: 12px; flex-wrap: wrap; margin-top: 18px;}
        .vp-btn--primary {background: linear-gradient(90deg, #2f45ff 0%, #3952ff 100%); border: none; color: #fff; padding: 12px 20px; border-radius: 10px; font-size: 15px; font-weight: 700; box-shadow: 0 10px 20px rgba(47, 69, 255, 0.2); text-decoration: none;}
        .vp-btn--secondary {background: #fff; border: 1px solid #dfe9ff; color: #2f45ff; padding: 12px 20px; border-radius: 10px; font-size: 15px; font-weight: 700; text-decoration: none; cursor: pointer;}

        .vp-hero__hero-box {border: 1px solid #e9efff; border-radius: 24px; padding: 24px; background: #fff; display: grid; place-items: center; max-width: 320px; margin: auto; overflow: hidden;}
        .vp-image-container {width: 210px; height: 210px; border-radius: 50%; background: linear-gradient(180deg, #3155f8, #b4c9ff); border: 6px solid #fff; box-shadow: 0 12px 30px rgba(58, 79, 205, 0.22); overflow: hidden; display: flex; align-items: center; justify-content: center;}
        .vp-image-container img {width: 100%; height: 100%; object-fit: cover;}
        .vp-initials {font-size: 78px; color: #fff; font-weight: 800;}

        .vp-section {padding: 50px 24px; max-width: 1140px; margin: 0 auto;}
        .vp-section h2 {font-size: 32px; margin: 0 0 8px; text-align: center; color: #142d60;}
        .vp-section p {text-align: center; max-width: 760px; margin: 12px auto 30px; color: #4b5f84;}

        .vp-skills {display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px;}
        .vp-skill-card {background: #fff; border: 1px solid #e3ebff; border-radius: 13px; padding: 16px; min-height: 120px; transition: transform 0.3s ease; display: flex; flex-direction: column; justify-content: center;}
        .vp-skill-card:hover {transform: scale(1.03);}
        .vp-skill-card h3 {margin: 0; font-size: 16px; color: #233675; font-weight: 700;}
        .vp-skill-card p {margin: 8px 0 0; font-size: 12px; font-weight: 700; color: #5565a8; text-transform: uppercase; letter-spacing: 0.05em;}
        .vp-skill-card__meta {display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: 12px; font-size: 13px; color: #55617b;}
        .vp-skill-card__bar {margin-top: 10px; height: 10px; border-radius: 999px; background: #eef2ff; overflow: hidden;}
        .vp-skill-card__bar span {display: block; height: 100%; border-radius: 999px; background: linear-gradient(90deg, #2f45ff 0%, #6c63ff 100%);}

        .vp-projects {display: grid; grid-template-columns: 1fr; gap: 18px;}
        .vp-project {background: #fff; border: 1px solid #e5edff; border-radius: 16px; padding: 18px; transition: transform 0.3s ease; display: flex; flex-direction: column;}
        .vp-project:hover {transform: scale(1.03);}
        .vp-project-subtitle {color: #7181ab; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;}
        .vp-project-title {font-size: 20px; font-weight: 800; margin: 0 0 10px;}
        .vp-project-desc {color: #4d5e83; margin: 0 0 12px; line-height: 1.45; flex-grow: 1;}
        .vp-project-tags {display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto;}
        .vp-badge {background: #eef2ff; color: #4155b0; border-radius: 999px; font-size: 12px; padding: 6px 10px; border: 1px solid #d3defe;}

        .vp-timeline {display: grid; gap: 16px;}
        .vp-timeline-item {background: #fff; border: 1px solid #e9efff; border-radius: 14px; padding: 18px; transition: transform 0.3s ease;}
        .vp-timeline-item:hover {transform: scale(1.03);}
        .vp-timeline-item h4 {margin: 0; font-size: 18px; color: #21376d;}
        .vp-timeline-item .period {color: #63779a; font-size: 13px; font-weight: 700; text-transform: uppercase; margin-bottom: 5px;}
        .vp-timeline-item p {margin: 6px 0 0; color: #506286; line-height: 1.5;}

        .vp-cta-section {background: linear-gradient(90deg, #2c44ff 0%, #454ef5 100%); color: #fff; text-align: center; border-radius: 20px; padding: 44px 22px; margin: 50px 24px;}
        .vp-cta-section h3 {margin: 0 0 14px; font-size: 36px; line-height: 1.08;}
        .vp-cta-section p {font-size: 16px; max-width: 600px; margin: 0 auto 22px; color: rgba(255,255,255,.95);}
        .vp-cta-buttons {display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;}
        .vp-cta-btn {border-radius: 12px; font-weight: 700; border: none; padding: 12px 22px; min-width: 160px; cursor: pointer; text-decoration: none;}
        .vp-cta-btn--white {background: #fff; color: #2c44ff;}
        .vp-cta-btn--outline {background: rgba(255,255,255,.12); color: #fff; border: 1px solid rgba(255,255,255,.5);}

        .vp-footer {background: #fff; border-top: 1px solid #e4ecff; padding: 20px 24px; text-align: center; color: #6b7c9e;}

        @media (min-width: 768px) {
          .vp-hero {grid-template-columns: 1.2fr 0.8fr; align-items: center;}
          .vp-nav {padding: 20px 42px;}
          .vp-skills {grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));}
          .vp-projects {grid-template-columns: repeat(2, minmax(0, 1fr));}
        }

        @media (min-width: 1024px) {
          .vp-nav__list {gap: 25px;}
          .vp-section {padding: 72px 26px;}
          .vp-timeline {grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));}
        }
      `}</style>

      <header className="vp-nav">
        <a href="/" style={{ textDecoration: 'none' }}>
          <div className="vp-nav__brand">Dev Profile UMSS</div>
        </a>
        <ul className="vp-nav__list">
          {skills.length > 0 && <li className="vp-nav__item"><a href="#skills">Habilidades</a></li>}
          {projects.length > 0 && <li className="vp-nav__item"><a href="#projects">Proyectos</a></li>}
          {timeline.length > 0 && <li className="vp-nav__item"><a href="#trajectory">Trayectoria</a></li>}
          <li className="vp-nav__item"><a href="#contact">Contacto</a></li>
        </ul>
        {profile.email ? <a className="vp-nav__cta" href={`mailto:${profile.email}`}>Contactar</a> : <span className="vp-nav__cta" style={{ opacity: 0.65 }}>Perfil publico</span>}
      </header>

      <FadeInSection>
        <section className="vp-hero">
          <div className="vp-hero__info">
            <div className="vp-btn-group" style={{ marginBottom: '20px',marginTop: '-30px' }}>
              <button onClick={() => navigate('/visitante')} className="vp-btn--secondary">
                Volver al listado
              </button>
            </div>
            <span className="vp-tagline">Disponible para proyectos</span>
            <h1 className="vp-hero__title">Hola, soy <span>{profile.name}</span></h1>
            <p className="vp-subtitle" style={{ fontWeight: 700, color: '#1c2d73' }}>{profile.title}</p>
            <p className="vp-subtitle">{profile.summary}</p>
            {Array.isArray(profile.titleHierarchy) && profile.titleHierarchy.length > 0 ? (
              <div className="vp-btn-group" style={{ marginTop: '8px' }}>
                {profile.titleHierarchy.map((item) => (
                  <span key={`title-${item}`} className="vp-badge">{item}</span>
                ))}
              </div>
            ) : null}
            {Array.isArray(profile.roleHierarchy) && profile.roleHierarchy.length > 0 ? (
              <div className="vp-btn-group" style={{ marginTop: '8px' }}>
                {profile.roleHierarchy.map((item) => (
                  <span key={`role-${item}`} className="vp-badge" style={{ background: '#eef2ff' }}>{item}</span>
                ))}
              </div>
            ) : null}
            
            <div className="vp-btn-group">
              {config?.mostrar_redes_sociales !== false && social.github && (
                <a className="vp-btn--primary" href={social.github} target="_blank" rel="noopener noreferrer">GitHub</a>
              )}
              {config?.mostrar_redes_sociales !== false && social.linkedin && (
                <a className="vp-btn--secondary" href={social.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
              )}
              {config?.mostrar_redes_sociales !== false && social.website && (
                <a className="vp-btn--secondary" href={social.website} target="_blank" rel="noopener noreferrer">Website</a>
              )}
            </div>
          </div>

          <div className="vp-hero__hero-box">
            <div className="vp-image-container">
              {profile.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt={profile.name} 
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const span = (e.target as HTMLImageElement).parentElement?.querySelector('.vp-initials');
                    if (span) (span as HTMLElement).style.display = 'block';
                  }}
                />
              ) : null}
              <span className="vp-initials" style={{ display: profile.avatarUrl ? 'none' : 'block' }}>
                {profile.name.split(' ').map(p => p[0]).join('').slice(0, 2)}
              </span>
            </div>
          </div>
        </section>
      </FadeInSection>

      {skills.length > 0 && (
        <FadeInSection>
          <section id="skills" className="vp-section">
            <h2>Habilidades</h2>
            <p>Competencias técnicas y blandas con su nivel de dominio.</p>

            {technicalSkills.length > 0 && (
              <>
                <h3 style={{ textAlign: 'left', color: '#142d60', marginBottom: '14px', fontSize: '22px' }}>Habilidades Técnicas</h3>
                <div className="vp-skills">
                  {technicalSkills.map((skill) => {
                    const progress =
                      typeof skill.porcentaje_dominio === 'number'
                        ? Math.max(0, Math.min(100, skill.porcentaje_dominio))
                        : skillProgressByLevel[(skill.nivel_dominio || 'intermedio').toLowerCase()] ?? 50;
                    return (
                      <div key={skill.id_habilidad} className="vp-skill-card">
                        <h3>{skill.nombre_habilidad}</h3>
                        <p>{skill.nivel_dominio || 'Intermedio'}</p>
                        <div className="vp-skill-card__meta">
                          <span>Dominio</span>
                          <strong>{progress}%</strong>
                        </div>
                        <div className="vp-skill-card__bar">
                          <span style={{ width: `${progress}%` }} />
                        </div>
                        {skill.vinculos ? (
                          <div className="vp-project-tags" style={{ marginTop: '12px' }}>
                            {parseLinks(skill.vinculos).map((link: any) => (
                              <span key={`tech-link-${skill.id_habilidad}-${link.id}`} className="vp-badge">
                                {link.etiqueta_referencia}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {softSkills.length > 0 && (
              <>
                <h3 style={{ textAlign: 'left', color: '#142d60', margin: '26px 0 14px', fontSize: '22px' }}>Habilidades Blandas</h3>
                <div className="vp-skills">
                  {softSkills.map((skill) => {
                    const progress =
                      typeof skill.porcentaje_dominio === 'number'
                        ? Math.max(0, Math.min(100, skill.porcentaje_dominio))
                        : skillProgressByLevel[(skill.nivel_dominio || 'intermedio').toLowerCase()] ?? 50;
                    return (
                      <div key={skill.id_habilidad} className="vp-skill-card">
                        <h3>{skill.nombre_habilidad}</h3>
                        <p>{skill.nivel_dominio || 'Intermedio'}</p>
                        <div className="vp-skill-card__meta">
                          <span>Dominio</span>
                          <strong>{progress}%</strong>
                        </div>
                        <div className="vp-skill-card__bar">
                          <span style={{ width: `${progress}%` }} />
                        </div>
                        {skill.vinculos ? (
                          <div className="vp-project-tags" style={{ marginTop: '12px' }}>
                            {parseLinks(skill.vinculos).map((link: any) => (
                              <span key={`soft-link-${skill.id_habilidad}-${link.id}`} className="vp-badge">
                                {link.etiqueta_referencia}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </FadeInSection>
      )}

      {projects.length > 0 && (
        <FadeInSection>
          <section id="projects" className="vp-section">
            <h2>Proyectos Seleccionados</h2>
            <p>Una muestra de mis trabajos más recientes y exitosos.</p>
            <div className="vp-projects">
              {projects.map((project) => (
                <article key={project.id} className="vp-project">
                  <p className="vp-project-subtitle">{project.subtitle}</p>
                  <h3 className="vp-project-title">{project.title}</h3>
                  <p className="vp-project-desc">{project.description}</p>
                  
                  <div className="vp-project-tags">
                    {project.tags.map((tag) => <span key={tag} className="vp-badge">{tag}</span>)}
                  </div>

                  <div className="vp-btn-group" style={{ marginTop: '16px' }}>
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="vp-badge" style={{ background: '#3949ff', color: '#fff', border: 'none' }}>Ver Vivo →</a>
                    )}
                    {project.repoUrl && (
                      <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="vp-badge">Repositorio</a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </FadeInSection>
      )}

      {timeline.length > 0 && (
        <FadeInSection>
          <section id="trajectory" className="vp-section">
            <h2>Trayectoria Profesional</h2>
            <p>Mi camino y evolución en el mundo de la tecnología.</p>
            <div className="vp-timeline">
              {timeline.map((item) => (
                <article key={item.id} className="vp-timeline-item">
                  <p className="period">{item.period}</p>
                  <h4>{item.title}</h4>
                  <strong style={{ color: '#2b4cff', fontSize: '0.9rem' }}>{item.company}</strong>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </section>
        </FadeInSection>
      )}

      <FadeInSection>
        <section id="contact" className="vp-cta-section">
          <h3>¿Alguna idea en mente?</h3>
          <p>Estoy siempre abierto a colaborar en proyectos innovadores. Conectemos por los canales oficiales.</p>
          <div className="vp-cta-buttons">
            {profile.email ? <a href={`mailto:${profile.email}`} className="vp-cta-btn vp-cta-btn--white">Contactar por Email</a> : null}
            {profile.phone ? <a href={`https://wa.me/${profile.phone.replace(/\\D/g, '')}`} className="vp-cta-btn vp-cta-btn--outline" target="_blank" rel="noopener noreferrer">WhatsApp</a> : null}
            {config?.mostrar_redes_sociales !== false && social.linkedin && (
              <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="vp-cta-btn vp-cta-btn--outline">LinkedIn</a>
            )}
          </div>
        </section>
      </FadeInSection>

      <footer className="vp-footer">© 2026 Dev Profile UMSS. Todos los derechos reservados.</footer>
    </main>
  );
}
