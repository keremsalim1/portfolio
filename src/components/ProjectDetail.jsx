import { useEffect } from 'react'
import Icon from './Icon'

export default function ProjectDetail({ project, onBack }) {
  useEffect(() => {
    document.title = `${project.title} · Kerem Salim`
    return () => {
      document.title = 'Kerem Salim | Portfolio'
    }
  }, [project])

  return (
    <div className="detail-page">
      <header className="detail-nav">
        <a
          href="/"
          className="nav-logo"
          aria-label="Kerem Salim"
          onClick={(e) => {
            e.preventDefault()
            onBack()
          }}
        >
          <img src="/favicon.svg" alt="Kerem Salim" className="nav-logo-icon" />
        </a>
        <button className="btn btn-ghost btn-back" onClick={onBack}>
          <Icon name="arrow" size={16} className="icon-flip" /> Back to Portfolio
        </button>
      </header>

      <main className="detail-main">
        <section className="detail-hero">
          {project.status && <span className="badge work">{project.status}</span>}
          <h1>{project.title}</h1>
          <p className="detail-summary">{project.description}</p>
          <div className="pills">
            {project.tags.map((t) => (
              <span key={t} className="pill pill-accent">
                {t}
              </span>
            ))}
          </div>
          {(project.github || project.demo) && (
            <div className="hero-actions">
              {project.github && (
                <a className="btn btn-ghost" href={project.github} target="_blank" rel="noreferrer">
                  <Icon name="github" size={18} /> View Code
                </a>
              )}
              {project.demo && (
                <a className="btn btn-primary" href={project.demo} target="_blank" rel="noreferrer">
                  <Icon name="external" size={18} /> Live Demo
                </a>
              )}
            </div>
          )}
        </section>

        {project.stats?.length > 0 && (
          <section className="detail-stats">
            {project.stats.map((s) => (
              <div key={s.label} className="stat-card">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </section>
        )}

        <section className="detail-section">
          <h2>Overview</h2>
          <p>{project.overview}</p>
        </section>

        {project.gallery?.length > 0 && (
          <section className="detail-section">
            <h2>In Action</h2>
            <div className="detail-gallery">
              {project.gallery.map((g) => (
                <figure key={g.src} className="detail-gallery-item">
                  <img src={g.src} alt={g.caption} loading="lazy" />
                  <figcaption>{g.caption}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {project.features?.length > 0 && (
          <section className="detail-section">
            <h2>Key Features</h2>
            <ul className="detail-feature-list">
              {project.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </section>
        )}

        {project.stack?.length > 0 && (
          <section className="detail-section">
            <h2>Technologies Used</h2>
            <div className="detail-stack-grid">
              {project.stack.map((group) => (
                <div key={group.category} className="stack-group">
                  <h3>{group.category}</h3>
                  <div className="pills">
                    {group.items.map((it) => (
                      <span key={it} className="pill">
                        {it}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="detail-footer-cta">
          <button className="btn btn-primary" onClick={onBack}>
            <Icon name="arrow" size={18} className="icon-flip" /> Back to all projects
          </button>
        </div>
      </main>
    </div>
  )
}
