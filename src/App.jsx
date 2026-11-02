import { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react'
import './App.css'
import { profile, socials, skills, marqueeSkills, projects, timeline } from './data'
import Typewriter from './components/Typewriter'
import Icon from './components/Icon'
import ProjectDetail from './components/ProjectDetail'
import { SplitText, Cursor, Preloader } from './components/Motion'
import { useMagnetic } from './hooks/useMagnetic'
import { useScrollSpy, useScrollProgress } from './hooks/useScrollSpy'
import { useRoute } from './hooks/useRoute'
import { initSmoothScroll, getLenis, gsap, ScrollTrigger, prefersReducedMotion } from './lib/motion'

// Parçacık sahnesi ağır olduğu için tembel (lazy) yüklenir
const ParticleField = lazy(() => import('./components/ParticleField'))

/* Sosyal medya ikon linkleri — mailto linkleri yeni sekmede açılmaz */
function SocialLink({ s }) {
  const ref = useMagnetic(0.35)
  const isMail = s.url.startsWith('mailto:')
  return (
    <a
      ref={ref}
      href={s.url}
      aria-label={s.label}
      {...(isMail ? {} : { target: '_blank', rel: 'noreferrer' })}
    >
      <Icon name={s.icon} size={20} />
    </a>
  )
}

function SocialLinks() {
  return (
    <div className="hero-socials">
      {socials.map((s) => (
        <SocialLink key={s.label} s={s} />
      ))}
    </div>
  )
}

function MagneticButton({ className = '', children, ...props }) {
  const ref = useMagnetic(0.25)
  return (
    <a ref={ref} className={`btn ${className}`} {...props}>
      {children}
    </a>
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

/* Sonsuz akan teknoloji şeridi — kaydırma hızına göre hızlanır */
function TechMarquee() {
  const track = useRef(null)
  useEffect(() => {
    const el = track.current
    if (!el || prefersReducedMotion()) return
    let x = 0
    let boost = 0
    let raf = 0
    let last = window.scrollY
    const loop = () => {
      const y = window.scrollY
      const v = y - last
      last = y
      boost += (Math.abs(v) * 0.35 - boost) * 0.1
      x -= 0.45 + boost
      const half = el.scrollWidth / 2
      if (half > 0 && -x >= half) x += half
      el.style.transform = `translate3d(${x}px,0,0)`
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track" ref={track}>
        {[0, 1].map((copy) => (
          <span key={copy} className="marquee-item">
            {marqueeSkills.map((item) => (
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
  const contactRef = useMagnetic(0.25)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
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
          <a ref={contactRef} className="nav-contact" href="#contact" onClick={() => setOpen(false)}>
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
function Hero({ ready }) {
  const [first, ...rest] = profile.name.split(' ')
  return (
    <section id="about" className={`hero ${ready ? 'is-ready' : ''}`}>
      <div className="hero-inner">
        <div className="hero-text">
          <p className="hero-hello hero-fade" style={{ '--d': '0ms' }}>
            <span className="hero-hello-line" /> Hi, I'm
          </p>
          <h1 className="hero-name" aria-label={profile.name}>
            <SplitText text={first} by="char" play={ready} delay={80} stagger={45} />
            <SplitText
              text={rest.join(' ')}
              by="char"
              play={ready}
              delay={330}
              stagger={45}
              className="hero-name-accent"
            />
          </h1>
          <p className="hero-title hero-fade" style={{ '--d': '650ms' }}>
            <Typewriter words={profile.roles} />
          </p>
          <p className="hero-tagline hero-fade" style={{ '--d': '760ms' }}>
            {profile.tagline}
          </p>
          <div className="hero-actions hero-fade" style={{ '--d': '860ms' }}>
            <MagneticButton className="btn-primary" href="#projects" data-cursor="Work">
              View My Projects <Icon name="arrow" size={18} />
            </MagneticButton>
            <MagneticButton className="btn-ghost" href="#contact">
              Get in Touch
            </MagneticButton>
          </div>
          <div className="hero-fade" style={{ '--d': '960ms' }}>
            <SocialLinks />
          </div>
        </div>
      </div>

      {/* Parçacık elin yanındaki küçük "figür" açıklaması */}
      <div className="hero-hud hero-fade" style={{ '--d': '1300ms' }} aria-hidden="true">
        <span className="hud-tag">fig. 01</span>
        <span>21-point hand landmark model</span>
        <span className="hud-muted">RTMW / RTMPose · SignaTurk</span>
      </div>

      <a href="#skills" className="scroll-cue hero-fade" style={{ '--d': '1400ms' }} aria-label="Scroll down">
        <span className="scroll-cue-line" />
        <span>Scroll</span>
      </a>
    </section>
  )
}

function SectionHead({ index, eyebrow, title }) {
  return (
    <div className="section-head">
      <Reveal className="section-meta">
        <span className="section-index">{index}</span>
        <span className="eyebrow">{eyebrow}</span>
        <span className="section-rule" />
      </Reveal>
      <SplitText as="h2" className="section-title" text={title} />
    </div>
  )
}

/* ---------- YETENEKLER: editoryal liste ---------- */
function Skills() {
  return (
    <section id="skills" className="section">
      <SectionHead index="01" eyebrow="What I do" title="Skills & Technologies" />
      <div className="skills-list">
        {skills.map((group, i) => (
          <Reveal key={group.category} className="skill-row" delay={i * 60}>
            <span className="skill-index">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="skill-cat">{group.category}</h3>
            <p className="skill-items">
              {group.items.map((item, j) => (
                <span key={item}>
                  {item}
                  {j < group.items.length - 1 && <span className="skill-sep">/</span>}
                </span>
              ))}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* Projenin kapak görseli; görseli olmayan proje için tipografik kapak */
function ProjectCover({ project }) {
  if (project.cover) {
    return (
      <div className="panel-media">
        <div className="panel-chrome">
          <i />
          <i />
          <i />
          <span>{project.coverLabel || project.title}</span>
        </div>
        <div className="panel-img-wrap">
          {/* coverZoom: ekran görüntüsündeki uygulama çerçevesini kırpmak için yakınlaştırma */}
          <div
            className="panel-img-zoom"
            style={{
              transform: `scale(${project.coverZoom || 1})`,
              transformOrigin: project.coverOrigin || 'center',
            }}
          >
            <img
              src={project.cover}
              alt={project.title}
              loading="lazy"
              style={{ objectPosition: project.coverPosition || 'center' }}
            />
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="panel-media panel-media-type">
      <span className="panel-type-big">You&rsquo;re here.</span>
      <span className="panel-type-small">React · Three.js · GLSL · GSAP</span>
    </div>
  )
}

/* ---------- PROJELER: üst üste yığılan sabit paneller ---------- */
function Projects({ navigate }) {
  const wrap = useRef(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray('.project-panel')
      panels.forEach((panel, i) => {
        const next = panels[i + 1]
        if (!next) return
        // Bir sonraki panel üstüne kayarken mevcut panel geri çekilir ve kararır
        gsap.to(panel.querySelector('.panel-inner'), {
          scale: 0.9,
          opacity: 0.35,
          filter: 'blur(2px)',
          ease: 'none',
          scrollTrigger: {
            trigger: next,
            start: 'top bottom',
            end: 'top 18%',
            scrub: true,
          },
        })
      })
      // Görseller panel içinde hafif parallax yapar
      gsap.utils.toArray('.panel-img-wrap img').forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: 'none',
            scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true },
          }
        )
      })
    }, wrap)
    return () => ctx.revert()
  }, [])

  return (
    <section id="projects" className="section">
      <SectionHead index="02" eyebrow="Selected work" title="Featured Projects" />
      <div className="projects-stack" ref={wrap}>
        {projects.map((p, i) => (
          <article
            key={p.slug}
            className="project-panel"
            style={{ '--i': i }}
          >
            <div
              className="panel-inner"
              role="link"
              tabIndex={0}
              data-cursor="Open"
              onClick={() => navigate(`/projects/${p.slug}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate(`/projects/${p.slug}`)
                }
              }}
            >
              <div className="panel-text">
                <div className="panel-top">
                  <span className="panel-index">{String(i + 1).padStart(2, '0')}</span>
                  {p.status && <span className="panel-status">{p.status}</span>}
                </div>
                <h3 className="panel-title">{p.title}</h3>
                <p className="panel-desc">{p.description}</p>
                <div className="pills">
                  {p.tags.map((t) => (
                    <span key={t} className="pill pill-accent">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="panel-actions">
                  <span className="panel-cta">
                    Read case study <Icon name="arrow" size={16} />
                  </span>
                  {p.github && (
                    <a
                      className="panel-gh"
                      href={p.github}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="GitHub"
                      data-cursor="Code"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Icon name="github" size={18} />
                    </a>
                  )}
                </div>
              </div>
              <ProjectCover project={p} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ---------- DENEYİM & EĞİTİM: kaydırdıkça çizilen çizgi ---------- */
function Timeline() {
  const wrap = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduced = prefersReducedMotion()
      if (!reduced) {
        gsap.fromTo(
          '.timeline-fill',
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: '.timeline', start: 'top 65%', end: 'bottom 60%', scrub: true },
          }
        )
      }
      gsap.utils.toArray('.timeline-item').forEach((item) => {
        ScrollTrigger.create({
          trigger: item,
          start: 'top 62%',
          toggleClass: 'is-active',
        })
      })
    }, wrap)
    return () => ctx.revert()
  }, [])

  return (
    <section id="experience" className="section" ref={wrap}>
      <SectionHead index="03" eyebrow="My journey" title="Experience & Education" />
      <div className="timeline">
        <span className="timeline-fill" aria-hidden="true" />
        {timeline.map((item, i) => (
          <Reveal key={i} className={`timeline-item ${item.type}`} delay={60}>
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
                    className={`timeline-logo ${item.logoShape || ''}`}
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

/* Profildeki saat dilimine göre canlı yerel saat */
function LocalTime() {
  const fmt = useCallback(
    () =>
      new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: profile.timezone || undefined,
      }).format(new Date()),
    []
  )
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 15000)
    return () => clearInterval(id)
  }, [fmt])
  return <span>{time}</span>
}

/* ---------- İLETİŞİM ---------- */
function Contact() {
  const btn = useMagnetic(0.2)
  const [copied, setCopied] = useState(false)

  const copy = async (e) => {
    // Panoya kopyalanabiliyorsa kopyala; olmazsa mailto linki normal çalışır
    try {
      await navigator.clipboard.writeText(profile.email)
      e.preventDefault()
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      /* mailto'ya düş */
    }
  }

  return (
    <section id="contact" className="section contact-section">
      <div className="contact-inner">
        <Reveal className="section-meta contact-meta">
          <span className="section-index">04</span>
          <span className="eyebrow">Contact</span>
        </Reveal>
        <h2 className="contact-title">
          <SplitText text="Let's build" />
          <SplitText text="something together." className="contact-title-accent" delay={180} />
        </h2>
        <Reveal tag="p" className="contact-text" delay={150}>
          Feel free to reach out about a project, an internship, or a job opportunity.
          I'll get back to you as soon as I can.
        </Reveal>
        <Reveal className="contact-actions" delay={250}>
          <a
            ref={btn}
            className={`contact-email ${copied ? 'is-copied' : ''}`}
            href={`mailto:${profile.email}`}
            onClick={copy}
            data-cursor={copied ? 'Copied' : 'Copy'}
          >
            <span className="contact-email-text">{copied ? 'Copied to clipboard ✓' : profile.email}</span>
            <span className="contact-email-icon">
              <Icon name="arrow" size={22} />
            </span>
          </a>
        </Reveal>
        <Reveal className="contact-foot" delay={320}>
          <SocialLinks />
          <span className="contact-local">
            <span className="status-dot" /> {profile.location} · <LocalTime />
          </span>
        </Reveal>
      </div>
    </section>
  )
}

function Footer() {
  const toTop = (e) => {
    e.preventDefault()
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(0, { duration: 1.6 })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  return (
    <footer className="footer">
      <span>© {new Date().getFullYear()} {profile.name}</span>
      <span className="footer-mid">Designed &amp; built from scratch</span>
      <a href="#about" className="footer-top" onClick={toTop}>
        Back to top ↑
      </a>
    </footer>
  )
}

export default function App() {
  const { path, navigate } = useRoute()
  const match = path.match(/^\/projects\/([^/]+)\/?$/)
  const activeProject = match ? projects.find((p) => p.slug === match[1]) : null
  const [ready, setReady] = useState(false)
  const onIntroDone = useCallback(() => setReady(true), [])

  useEffect(() => {
    initSmoothScroll()
    // Görseller yüklenince ScrollTrigger konumlarını yeniden hesapla
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    return () => window.removeEventListener('load', refresh)
  }, [])

  // Detay sayfasından dönünce de tetikleyiciler doğru ölçülsün
  useEffect(() => {
    const id = setTimeout(() => ScrollTrigger.refresh(), 150)
    return () => clearTimeout(id)
  }, [path])

  return (
    <>
      <Preloader onDone={onIntroDone} />
      <Cursor />
      <div className="grain" aria-hidden="true" />
      {activeProject ? (
        <ProjectDetail project={activeProject} onBack={() => navigate('/')} />
      ) : (
        <>
          <Suspense fallback={null}>
            <ParticleField />
          </Suspense>
          <ScrollProgress />
          <Navbar />
          <main>
            <Hero ready={ready} />
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
      )}
    </>
  )
}
