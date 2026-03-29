import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FadeInSection } from './home/components/FadeInSection';

interface Project {
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
}

type Portfolio = {
  id: number;
  name: string;
  title: string;
  level: string;
  tags: string[];
  summary: string;
};

const portfolios: Portfolio[] = [
  { id: 1, name: 'Alejandro Vargas', title: 'Arquitecto Full Stack', level: 'Senior', tags: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'], summary: 'Especialista en aplicaciones empresariales con enfoque en escalabilidad y seguridad.' },
  { id: 2, name: 'Mariana Rios', title: 'Diseñadora UI/UX y Dev Frontend', level: 'Semi-Senior', tags: ['Figma', 'Vue.js', 'Tailwind', 'Next.js'], summary: 'Diseño de experiencias modernas y accesibles para productos web y móviles.' },
  { id: 3, name: 'Carlos Mendez', title: 'Especialista Backend', level: 'Junior', tags: ['Python', 'Django', 'PostgreSQL', 'Docker'], summary: 'Desarrollo de APIs robustas y microservicios con foco en rendimiento.' },
];

const projects: Project[] = [
  {
    title: 'Nexus Analytics Dashboard',
    subtitle: 'Full Stack • AI Integration',
    description: 'Plataforma de análisis de datos en tiempo real procesando más de 1M de eventos diarios con integración de IA para predicciones.',
    tags: ['React', 'Redis', 'Python'],
  },
  {
    title: 'EcoCommerce PWA',
    subtitle: 'Mobile First • E-Commerce',
    description: 'Aplicación web progresiva optimizada para móviles enfocada en la venta de productos sostenibles con checkout ultrarrápido.',
    tags: ['Next.js', 'Stripe', 'Tailwind'],
  },
];

const timeline = [
  { period: '2021 — Presente', title: 'Senior Full Stack Developer', company: 'TechNova Solutions', detail: 'Liderazgo técnico de equipos frontend y optimización de flujos de despliegue continuo en la nube.' },
  { period: '2019 — 2021', title: 'Junior Developer', company: 'Digital Horizon', detail: 'Desarrollo de interfaces dinámicas y mantenimiento de servicios backend basados en microservicios.' },
  { period: '2014 — 2019', title: 'Ingeniería de Sistemas', company: 'Universidad Mayor de San Simón (UMSS)', detail: 'Especialización en desarrollo de software y gestión de bases de datos relacionales.' },
];

export function VisitantePortafolioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const selected = id ? portfolios.find((p) => p.id === Number(id)) : undefined;

  const profile = selected ?? {
    name: 'Alex Rivera',
    title: 'Full Stack Developer',
    level: 'Senior',
    tags: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
    summary: 'Apasionado por crear soluciones escalables y experiencias de usuario excepcionales. Especializado en arquitecturas modernas y rendimiento optimizado.',
  };

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
        .vp-btn--secondary {background: #fff; border: 1px solid #dfe9ff; color: #2f45ff; padding: 12px 20px; border-radius: 10px; font-size: 15px; font-weight: 700; text-decoration: none;}

        .vp-hero__hero-box {border: 1px solid #e9efff; border-radius: 24px; padding: 24px; background: #fff; display: grid; place-items: center; max-width: 320px; margin: auto;}
        .vp-image {width: 210px; height: 210px; border-radius: 50%; background: linear-gradient(180deg, #3155f8, #b4c9ff); border: 6px solid #fff; box-shadow: 0 12px 30px rgba(58, 79, 205, 0.22); display: flex; align-items: center; justify-content: center; font-size: 78px; color: #fff;}

        .vp-section {padding: 50px 24px; max-width: 1140px; margin: 0 auto;}
        .vp-section h2 {font-size: 32px; margin: 0 0 8px; text-align: center; color: #142d60;}
        .vp-section p {text-align: center; max-width: 760px; margin: 12px auto 30px; color: #4b5f84;}

        .vp-skills {display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px;}
        .vp-skill-card {background: #fff; border: 1px solid #e3ebff; border-radius: 13px; padding: 16px; text-align: center; min-height: 96px; transition: transform 0.3s ease;}
        .vp-skill-card:hover {transform: scale(1.03);}
        .vp-skill-card h3 {margin: 0; font-size: 14px; color: #5565a8; font-weight: 700;}
        .vp-skill-card p {margin: 8px 0 0; font-size: 16px; font-weight: 700; color: #233675;}

        .vp-projects {display: grid; grid-template-columns: 1fr; gap: 18px;}
        .vp-project {background: #fff; border: 1px solid #e5edff; border-radius: 16px; padding: 18px; transition: transform 0.3s ease;}
        .vp-project:hover {transform: scale(1.03);}
        .vp-project-subtitle {color: #7181ab; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;}
        .vp-project-title {font-size: 20px; font-weight: 800; margin: 0 0 10px;}
        .vp-project-desc {color: #4d5e83; margin: 0 0 12px; line-height: 1.45;}
        .vp-project-tags {display: flex; flex-wrap: wrap; gap: 8px;}
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
        .vp-cta-btn {border-radius: 12px; font-weight: 700; border: none; padding: 12px 22px; min-width: 160px;}
        .vp-cta-btn--white {background: #fff; color: #2c44ff;}
        .vp-cta-btn--outline {background: rgba(255,255,255,.12); color: #fff; border: 1px solid rgba(255,255,255,.5);}

        .vp-footer {background: #fff; border-top: 1px solid #e4ecff; padding: 20px 24px; text-align: center; color: #6b7c9e;}

        @media (min-width: 768px) {
          .vp-hero {grid-template-columns: 1.2fr 0.8fr; align-items: center;}
          .vp-nav {padding: 20px 42px;}
          .vp-skills {grid-template-columns: repeat(6, minmax(0, 1fr));}
          .vp-projects {grid-template-columns: repeat(2, minmax(0, 1fr));}
        }

        @media (min-width: 1024px) {
          .vp-nav__list {gap: 25px;}
          .vp-section {padding: 72px 26px;}
          .vp-projects {grid-template-columns: repeat(2, minmax(0, 1fr));}
          .vp-timeline {grid-template-columns: repeat(3, minmax(0, 1fr));}
        }
      `}</style>

      <header className="vp-nav">
        <a href='/'>
          <div className="vp-nav__brand">Dev Profile UMSS</div>
        </a>
        <ul className="vp-nav__list">
          <li className="vp-nav__item"><a href="#skills">Habilidades</a></li>
          <li className="vp-nav__item"><a href="#projects">Proyectos</a></li>
          <li className="vp-nav__item"><a href="#trajectory">Trayectoria</a></li>
          <li className="vp-nav__item"><a href="#contact">Contacto</a></li>
        </ul>
        <a className="vp-nav__cta" href="#contact">Descargar CV</a>
      </header>

      <FadeInSection>
        <section className="vp-hero">
          <div className="vp-hero__info">
            <div className="vp-btn-group" style={{ marginBottom: '20px',marginTop: '-30px' }}>
              <button onClick={() => navigate('/visitante')} className="vp-btn--secondary" style={{ cursor: 'pointer' }}>
                Volver al listado
              </button>
            </div>
            <span className="vp-tagline">Disponible para proyectos</span>
            <h1 className="vp-hero__title">Hola, soy <span>{profile.name}</span></h1>
            <p className="vp-subtitle">{profile.title}</p>
            <p className="vp-subtitle">{profile.summary}</p>
            <div className="vp-btn-group">
              <a className="vp-btn--primary" href="#">GitHub</a>
              <a className="vp-btn--secondary" href="#">LinkedIn</a>
            </div>

          </div>

          <div className="vp-hero__hero-box">
            <div className="vp-image">AR</div>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section id="skills" className="vp-section">
          <h2>Habilidades Técnicas</h2>
          <p>Herramientas y tecnologías que domino para dar vida a grandes ideas.</p>
          <div className="vp-skills">
            <div className="vp-skill-card"><h3>HTML</h3><p>React</p></div>
            <div className="vp-skill-card"><h3>React</h3><p>Node.js</p></div>
            <div className="vp-skill-card"><h3>Node.js</h3><p>PostgreSQL</p></div>
            <div className="vp-skill-card"><h3>PostgreSQL</h3><p>AWS</p></div>
            <div className="vp-skill-card"><h3>AWS</h3><p>Docker</p></div>
            <div className="vp-skill-card"><h3>Docker</h3><p>TypeScript</p></div>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section id="projects" className="vp-section">
          <h2>Proyectos Destacados</h2>
          <p>Una selección de mis trabajos más recientes y desafiantes.</p>
          <div className="vp-projects">
            {projects.map((project) => (
              <article key={project.title} className="vp-project">
                <p className="vp-project-subtitle">{project.subtitle}</p>
                <h3 className="vp-project-title">{project.title}</h3>
                <p className="vp-project-desc">{project.description}</p>
                <div className="vp-project-tags">
                  {project.tags.map((tag) => <span key={tag} className="vp-badge">{tag}</span>)}
                </div>
              </article>
            ))}
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section id="trajectory" className="vp-section">
          <h2>Trayectoria</h2>
          <p>Mi camino profesional y académico hasta hoy.</p>
          <div className="vp-timeline">
            {timeline.map((item) => (
              <article key={item.period} className="vp-timeline-item">
                <p className="period">{item.period}</p>
                <h4>{item.title}</h4>
                <strong>{item.company}</strong>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section id="contact" className="vp-cta-section">
          <h3>¿Tienes un proyecto en mente?</h3>
          <p>Hagamos realidad tu idea con la tecnología adecuada. Estoy disponible para nuevas oportunidades y colaboraciones.</p>
          <div className="vp-cta-buttons">
            <button className="vp-cta-btn vp-cta-btn--white">Contactar por Email</button>
            <button className="vp-cta-btn vp-cta-btn--outline">Agendar Llamada</button>
          </div>
        </section>
      </FadeInSection>

      <footer className="vp-footer">© 2026 Dev Profile UMSS. Todos los derechos reservados.</footer>
    </main>
  );
}
