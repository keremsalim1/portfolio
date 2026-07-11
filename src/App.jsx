import { useState, useEffect, useRef, Suspense, lazy } from 'react'
import './App.css'
import { profile, socials, skills, projects, timeline } from './data'
import Typewriter from './components/Typewriter'
import Icon from './components/Icon'
import ProjectDetail from './components/ProjectDetail'
import { useTilt } from './hooks/useTilt'
import { useScrollSpy, useScrollProgress } from './hooks/useScrollSpy'
import { useRoute } from './hooks/useRoute'

// 3D sahne ağır olduğu için tembel (lazy) yüklenir; hazır olana kadar CSS blob gösterilir
const Hero3D = lazy(() => import('./components/Hero3D'))

/* Sosyal medya ikon linkleri — mailto linkleri yeni sekmede açılmaz */
function SocialLinks() {
  return (
    <div className="hero-socials">
      {socials.map((s) => {
        const isMail = s.url.startsWith('mailto:')
        return (
          <a
            key={s.label}
            href={s.url}
            aria-label={s.label}
            {...(isMail ? {} : { target: '_blank', rel: 'noreferrer' })}
          >
            <Icon name={s.icon} size={20} />
          </a>
        )
      })}
    </div>
  )
}

/* Kaydırınca beliren sarmalayıcı */
function Reveal({ children, className = '', delay = 0, tag = 'div' }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          io.unobserve(el)
        }
      },
      { threshold: 0.12 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const Tag = tag
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  )
}

/* İmleci takip eden ambiyans ışığı */
function Spotlight() {
  const ref = useRef(null)
  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return
    let raf = 0
    const onMove = (e) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const el = ref.current
        if (!el) return
        el.style.setProperty('--sx', `${e.clientX}px`)
        el.style.setProperty('--sy', `${e.clientY}px`)
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])
  return <div ref={ref} className="spotlight" aria-hidden="true" />
}

/* Sonsuz akan teknoloji şeridi */
function TechMarquee() {
  const items = skills.flatMap((g) => g.items)
  // Kesintisiz döngü için liste iki kez basılır
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <span key={copy} className="marquee-item">
            {items.map((item) => (
              <span key={item} className="marquee-item">
                {item}
                <span className="marquee-dot" />
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  )
}

/* Mouse'a göre eğilen (3D tilt) + ışık yansımalı kart. onClick verilirse tıklanabilir/klavye erişilebilir olur */
function TiltCard({ className = '', children, max = 8, tag = 'article', onClick }) {
  const ref = useTilt({ max })
  const Tag = tag
  const interactiveProps = onClick
    ? {
        onClick,
        role: 'link',
        tabIndex: 0,
        onKeyDown: (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick(e)
          }
        },
      }
    : {}
  return (
    <Tag ref={ref} className={`tilt-card ${className}`} {...interactiveProps}>
      {children}
      <span className="card-glare" aria-hidden="true" />
    </Tag>
  )
}

const navLinks = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
]

const spyIds = ['about', 'skills', 'projects', 'experience', 'contact']

/* Sayfa kaydırma ilerleme çubuğu (en üstte) */
function ScrollProgress() {
  const progress = useScrollProgress()
  return (
    <div className="scroll-progress" aria-hidden="true">
      <div className="scroll-progress-bar" style={{ transform: `scaleX(${progress})` }} />
    </div>
  )
}

function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const active = useScrollSpy(spyIds)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <a href="#about" className="nav-logo" aria-label={profile.name}>
          <img src="/favicon.svg" alt={profile.name} className="nav-logo-icon" />
        </a>
        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {navLinks.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className={active === l.id ? 'active' : ''}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a className="nav-contact" href="#contact" onClick={() => setOpen(false)}>
            Contact
          </a>
        </nav>
        <button className="nav-toggle" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          <span className={open ? 'x' : ''} />
        </button>
      </div>
    </header>
  )
}

/* ---------- HERO ---------- */
function Hero() {
  const visualRef = useRef(null)

  // Mouse'a göre chip/avatar katmanlarını kaydıran parallax
  useEffect(() => {
    const el = visualRef.current
    if (!el) return
    if (window.matchMedia('(hover: none)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width - 0.5 // -0.5..0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--px', px.toFixed(3))
        el.style.setProperty('--py', py.toFixed(3))
      })
    }
    const onLeave = () => {
      el.style.setProperty('--px', '0')
      el.style.setProperty('--py', '0')
    }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <section id="about" className="hero">
      <div className="hero-aurora" aria-hidden="true">
        <div className="aurora-blob aurora-1" />
        <div className="aurora-blob aurora-2" />
      </div>
      <div className="hero-grid">
        <div className="hero-text">
          <Reveal delay={80} tag="p">
            <span className="hero-hello">Hi, I'm</span>
          </Reveal>
          <Reveal delay={140} tag="h1">
            <span className="hero-name">{profile.name}</span>
          </Reveal>
          <Reveal delay={200} tag="p">
            <span className="hero-title">
              <Typewriter words={profile.roles} />
            </span>
          </Reveal>
          <Reveal delay={260} tag="p">
            <span className="hero-tagline">{profile.tagline}</span>
          </Reveal>
          <Reveal className="hero-actions" delay={340}>
            <a className="btn btn-primary" href="#projects">
              View My Projects <Icon name="arrow" size={18} />
            </a>
            <a className="btn btn-ghost" href="#contact">
              Get in Touch
            </a>
          </Reveal>
          <Reveal delay={420}>
            <SocialLinks />
          </Reveal>
        </div>
        <Reveal className="hero-visual" delay={200}>
          <div className="hero-visual-inner" ref={visualRef}>
            <Suspense fallback={<div className="avatar-blob" />}>
              <Hero3D />
            </Suspense>
            <div className="avatar">{profile.initials}</div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

const SectionHead = ({ eyebrow, title }) => (
  <Reveal className="section-head">
    <span className="eyebrow">{eyebrow}</span>
    <h2 className="section-title">{title}</h2>
  </Reveal>
)

/* ---------- YETENEKLER ---------- */
function Skills() {
  return (
    <section id="skills" className="section">
      <SectionHead eyebrow="What I do" title="Skills & Technologies" />
      <div className="skills-grid">
        {skills.map((group, i) => (
          <Reveal key={group.category} delay={i * 80}>
            <TiltCard className="skill-card">
              <h3>{group.category}</h3>
              <div className="pills">
                {group.items.map((item) => (
                  <span key={item} className="pill">
                    {item}
                  </span>
                ))}
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ---------- PROJELER ---------- */
function Projects({ navigate }) {
  return (
    <section id="projects" className="section">
      <SectionHead eyebrow="My work" title="Featured Projects" />
      <div className="projects-grid">
        {projects.map((p, i) => (
          <Reveal key={p.title} delay={i * 90}>
            <TiltCard className="project-card" onClick={() => navigate(`/projects/${p.slug}`)}>
            <div className="project-top">
              <span className="project-index">0{i + 1}</span>
              <div className="project-links">
                {p.github && (
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHub"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Icon name="github" size={20} />
                  </a>
                )}
                {p.demo && (
                  <a
                    href={p.demo}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Demo"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Icon name="external" size={20} />
                  </a>
                )}
              </div>
            </div>
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            <div className="pills">
              {p.tags.map((t) => (
                <span key={t} className="pill pill-accent">
                  {t}
                </span>
              ))}
            </div>
            <span className="project-cta">
              Read case study <Icon name="arrow" size={16} />
            </span>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ---------- DENEYİM & EĞİTİM ---------- */
function Timeline() {
  return (
    <section id="experience" className="section">
      <SectionHead eyebrow="My journey" title="Experience & Education" />
      <div className="timeline">
        {timeline.map((item, i) => (
          <Reveal key={i} className={`timeline-item ${item.type}`} delay={i * 90}>
            <div className="timeline-dot" />
            <div className="timeline-card">
              <div className="timeline-topline">
                <span className={`badge ${item.type}`}>
                  {item.type === 'work' ? 'Experience' : 'Education'}
                </span>
                <span className="timeline-date">{item.date}</span>
              </div>
              <div className="timeline-head">
                {item.logo && (
                  <img
                    className="timeline-logo"
                    src={item.logo}
                    alt={item.logoAlt || item.place}
                    loading="lazy"
                  />
                )}
                <div className="timeline-head-text">
                  <h3>{item.title}</h3>
                  <span className="timeline-place">{item.place}</span>
                </div>
              </div>
              {item.accreditation && (
                <span className="timeline-accredited">
                  <Icon name="verified" size={15} />
                  {item.accreditation}
                </span>
              )}
              <p>{item.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ---------- İLETİŞİM ---------- */
function Contact() {
  return (
    <section id="contact" className="section contact-section">
      <Reveal className="contact-card">
        <span className="eyebrow">Contact</span>
        <h2 className="contact-title">Let's work together</h2>
        <p className="contact-text">
          Feel free to reach out about a project, an internship, or a job
          opportunity. I'll get back to you as soon as I can.
        </p>
        <SocialLinks />
      </Reveal>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <span>© {new Date().getFullYear()} {profile.name}</span>
      <span className="footer-sep">·</span>
      <span>All rights reserved.</span>
    </footer>
  )
}

export default function App() {
  const { path, navigate } = useRoute()
  const match = path.match(/^\/projects\/([^/]+)\/?$/)
  const activeProject = match ? projects.find((p) => p.slug === match[1]) : null

  if (activeProject) {
    return <ProjectDetail project={activeProject} onBack={() => navigate('/')} />
  }

  return (
    <>
      <Spotlight />
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <TechMarquee />
        <div className="container">
          <Skills />
          <Projects navigate={navigate} />
          <Timeline />
        </div>
        <Contact />
      </main>
      <Footer />
    </>
  )
}
