// ============================================================
//  KİŞİSEL BİLGİLER — Sitenin tüm içeriğini buradan düzenle
// ============================================================
import handLandmarks from './assets/case-studies/signaturk/hand-landmarks.png'
import signaturkPanel from './assets/case-studies/signaturk/panel.png'
import signaturkDictionary from './assets/case-studies/signaturk/dictionary.png'
import signaturkHayir from './assets/case-studies/signaturk/live-hayir.png'
import signaturkKemer from './assets/case-studies/signaturk/live-kemer.png'
import vbaDashboard from './assets/case-studies/value-bet-analyzer/dashboard.png'
import vbaBacktest from './assets/case-studies/value-bet-analyzer/backtest.png'
import emuLogo from './assets/emu-logo.png'

export const profile = {
  name: 'Kerem Salim',
  title: 'Software Engineering Student',
  // Daktilo efektiyle sırayla yazılan roller (istediğin kadar ekle/çıkar)
  roles: [
    'Software Engineering Student',
    'Full-Stack Developer',
    'Problem Solver',
    'Lifelong Learner',
  ],
  // Kısa tanıtım yazısı (ana ekranda görünür)
  tagline:
    'Final-year software engineering student with an emphasis on clean, maintainable code.',
  location: 'Cyprus',
  email: 'salimkerem22@gmail.com',
  // Baş harfler avatar için kullanılır (foto koymak istersen App.jsx'e bak)
  initials: 'KS',
}

export const socials = [
  { label: 'GitHub', url: 'https://github.com/keremsalim1', icon: 'github' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/kerem-salim-7ba065299/', icon: 'linkedin' },
  { label: 'Email', url: 'mailto:salimkerem22@gmail.com', icon: 'mail' },
]

// Yetenekler — kategorilere ayrılmış
export const skills = [
  {
    category: 'Languages',
    items: ['Python', 'Java', 'C', 'SQL', 'JavaScript'],
  },
  {
    category: 'Frontend',
    items: ['React', 'Three.js', 'React Three Fiber', 'Vite', 'HTML5', 'CSS3'],
  },
  {
    category: 'Backend & Data',
    items: ['FastAPI', 'TensorFlow / Keras', 'PostgreSQL', 'Docker', 'REST APIs', 'WebSockets'],
  },
  {
    category: 'Concepts & Tools',
    items: ['Data Structures & Algorithms', 'OOP', 'Machine Learning', 'Computer Vision', 'Git', 'Linux', 'Pytest'],
  },
]

// Projeler — github/demo linki varsa ekle, yoksa boş bırak (ikon gizlenir)
// slug: proje detay sayfasının URL'i (/projects/<slug>)
// stats: detay sayfasının üstünde gösterilen kısa istatistik kartları
// features: "Key Features" bölümündeki madde listesi
// stack: "Technologies Used" bölümünde kategorilere ayrılmış teknoloji listesi
export const projects = [
  {
    slug: 'signaturk',
    status: 'Graduation Project',
    title: 'SignaTurk — Sign Language Translator',
    description:
      'Graduation project: real-time Turkish Sign Language recognition that translates webcam gestures into text and speech. A FastAPI/WebSocket backend streams body and hand landmarks through an RTMW/RTMPose pipeline, and a Keras ensemble classifies 226 sign classes with confidence scoring.',
    overview:
      'SignaTurk is my graduation project: a system that recognizes Turkish Sign Language in real time and turns it into text and speech, aiming to make everyday communication more accessible for the deaf and hard-of-hearing community.',
    tags: ['Python', 'FastAPI', 'TensorFlow / Keras', 'Computer Vision', 'React', 'Three.js', 'PostgreSQL'],
    github: 'https://github.com/keremsalim1/SignaTurk',
    demo: '',
    stats: [
      { label: 'Sign classes', value: '226' },
      { label: 'Dataset', value: 'AUTSL' },
      { label: 'Landmark pipeline', value: 'RTMW / RTMPose' },
      { label: 'Status', value: 'Completed' },
    ],
    features: [
      'Streams live webcam frames into a FastAPI/WebSocket backend for low-latency processing',
      'Extracts full-body and hand landmarks through an RTMW/RTMPose pipeline',
      'Classifies 226 sign classes with a Keras ensemble trained on the AUTSL dataset, with confidence scoring',
      'Ships a React front end with a Three.js 3D avatar, user authentication, prediction history and a searchable sign dictionary',
    ],
    stack: [
      { category: 'ML & Backend', items: ['Python', 'FastAPI', 'TensorFlow / Keras', 'ONNX Runtime', 'WebSocket'] },
      { category: 'Computer Vision', items: ['RTMW / RTMPose', 'AUTSL Dataset', 'Computer Vision'] },
      { category: 'Frontend & Data', items: ['React.js', 'Three.js', 'PostgreSQL'] },
    ],
    gallery: [
      {
        src: signaturkPanel,
        caption: 'Main dashboard: live model status, an active MediaPipe extractor, the 16-frame prediction window, and recent database-backed predictions at a glance.',
      },
      {
        src: signaturkHayir,
        caption: 'The 3D avatar signing "hayır" (no) — reconstructed from recorded landmark data and rendered in real time with Three.js.',
      },
      {
        src: signaturkKemer,
        caption: 'The same avatar signing "kemer" (belt), showing how the system reproduces distinct two-handed gestures.',
      },
      {
        src: signaturkDictionary,
        caption: 'The searchable sign dictionary — each of the 226 model classes mapped to its Turkish label and English translation.',
      },
      {
        src: handLandmarks,
        caption: 'The 21-point hand landmark layout (MediaPipe/RTMW) used to track finger and wrist positions for every frame.',
      },
    ],
  },
  {
    slug: 'value-bet-analyzer',
    status: 'Independent Project',
    title: 'Value Bet Analyzer',
    description:
      'Modular football value-betting engine that flags bets where model probability × offered odds beats a configurable edge. Combines a Dixon-Coles Poisson model, Glicko-2 ratings and adaptive Kelly staking with walk-forward backtesting, served through FastAPI + React and backed by 257 tests.',
    overview:
      'A modular football value-betting engine that compares model-implied probabilities against bookmaker odds to surface bets with a genuine statistical edge, rather than chasing gut feeling.',
    tags: ['Python', 'FastAPI', 'NumPy', 'React', 'Docker', 'Pytest'],
    github: 'https://github.com/keremsalim1/ValueBetAnalyzer',
    demo: '',
    stats: [
      { label: 'Automated tests', value: '257' },
      { label: 'Staking model', value: 'Adaptive Kelly' },
      { label: 'Rating system', value: 'Glicko-2' },
      { label: 'Validation', value: 'Walk-forward backtest' },
    ],
    features: [
      'Combines a Dixon-Coles Poisson model with time-weighted team strengths and Bayesian shrinkage for stable probability estimates',
      'Cross-checks fixtures against real odds pulled from multiple APIs, using fuzzy matching to line them up automatically',
      'Sizes bets with adaptive Kelly staking under configurable risk caps, guarded by a trust gate before any bet is flagged',
      'Validated through walk-forward backtesting — ROI, Brier score and Monte-Carlo simulations — and covered by 257 automated tests',
    ],
    stack: [
      { category: 'Modeling', items: ['Python', 'NumPy', 'Dixon-Coles Poisson', 'Glicko-2'] },
      { category: 'Backend', items: ['FastAPI', 'REST APIs', 'Docker', 'Pytest'] },
      { category: 'Frontend', items: ['React.js', 'Recharts'] },
    ],
    gallery: [
      {
        src: vbaDashboard,
        caption: 'Live dashboard: CLV trend across 940 closing-line records, per-market hit rates, and a Monte Carlo bankroll simulation.',
      },
      {
        src: vbaBacktest,
        caption: 'Walk-forward backtest output — the trust gate correctly flags this run as not live-ready (insufficient bets, negative ROI) rather than overstating confidence.',
      },
    ],
  },
  {
    slug: 'portfolio-website',
    status: 'This Website',
    title: 'Personal Portfolio Website',
    description:
      "The single-page site you're viewing — built with React and Vite. Features an interactive 3D hero scene, a custom scroll-spy, tilt and typewriter effects, and a fully data-driven content model.",
    overview:
      "The single-page site you're currently browsing — designed and built from scratch to present my background, skills and projects with a bit of visual polish.",
    tags: ['React', 'Vite', 'Three.js', 'React Three Fiber', 'CSS3'],
    github: '',
    demo: '',
    stats: [
      { label: 'Framework', value: 'React + Vite' },
      { label: '3D engine', value: 'Three.js / R3F' },
      { label: 'Linting', value: 'Oxlint' },
      { label: 'Type', value: 'Single-page app' },
    ],
    features: [
      'Interactive 3D hero scene built with Three.js and React Three Fiber, reacting to cursor movement',
      'Custom scroll-spy navigation, tilt-on-hover project cards and a typewriter effect for the role titles',
      'Fully data-driven content model — every section renders from a single content file, no hardcoded copy in components',
      'Vite build pipeline linted with Oxlint to keep the codebase clean and fast to ship',
    ],
    stack: [
      { category: 'Core', items: ['JavaScript', 'React', 'Vite'] },
      { category: '3D & Motion', items: ['Three.js', 'React Three Fiber'] },
      { category: 'Styling & Tooling', items: ['HTML5', 'CSS3', 'Oxlint'] },
    ],
  },
]

// Deneyim ve Eğitim (birlikte, timeline şeklinde gösterilir)
// type: "work" (iş/staj) veya "education" (eğitim)
export const timeline = [
  {
    type: 'work',
    title: 'Software Engineering Intern',
    place: 'NFS Yazılım ve Stratejik Danışmanlık Ltd. Şti., Edirne, Türkiye',
    date: 'Jul – Sep 2025 (40 working days)',
    description:
      'Developed and refined SQL queries for relational database analysis and retrieval, and supported data-driven decision-making by helping with dataset analysis. Examined query performance, helped troubleshoot database-related problems, and worked with teammates to enhance data processing workflows and database operations.',
  },
  {
    type: 'education',
    title: 'B.Sc. in Software Engineering',
    place: 'Eastern Mediterranean University, Cyprus',
    date: '09/2021 – Expected 07/2026',
    logo: emuLogo,
    logoAlt: 'Eastern Mediterranean University',
    accreditation: 'ABET Accredited Program',
    description:
      '4th-year software engineering student. Member of the Software & AI Development Club and the IE Club at EMU, with a focus on web development, data structures & algorithms, and artificial intelligence.',
  },
]
