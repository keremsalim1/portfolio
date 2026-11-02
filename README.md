# Kerem Salim — Portfolio

Personal portfolio site of Kerem Salim, a final-year Software Engineering student.
A single-page React application with an interactive 3D hero scene, a data-driven
content model, and detailed project case studies.

**Live:** https://keremsalim.com _(update once deployed)_

---

## Features

- **Scroll-driven particle scene** — ~16k GPU particles (custom GLSL shaders) fixed
  behind the page morph from a 21-point hand-landmark skeleton (a nod to SignaTurk)
  into a neural network, a probability surface and finally a sphere as you scroll.
- **Smooth motion layer** — Lenis smooth scrolling synced with GSAP ScrollTrigger:
  stacking project panels, a self-drawing timeline, masked text reveals, a custom
  cursor, magnetic buttons, film grain and a one-time intro loader.
- **Custom scroll-spy navigation** that highlights the active section as you scroll.
- **Accessible by default** — every animation respects `prefers-reduced-motion`,
  and mobile gets a lighter particle count and simplified layouts.
- **Project case studies** — each project has its own detail page with stats,
  key features, tech stack and an image gallery.
- **Fully responsive** — single-column mobile layout with a hamburger menu.
- **Data-driven** — every section renders from a single content file
  (`src/data.js`); no hardcoded copy lives inside the components.

## Tech Stack

| Area            | Technologies                                   |
| --------------- | ---------------------------------------------- |
| Core            | React 19, Vite                                 |
| 3D & Motion     | Three.js, React Three Fiber, GLSL, GSAP, Lenis |
| Styling         | CSS3 (custom properties, no framework)         |
| Tooling         | Oxlint                                          |
| Deployment      | Vercel                                          |

## Getting Started

```bash
# install dependencies
npm install

# start the dev server (http://localhost:5173)
npm run dev

# create a production build in dist/
npm run build

# preview the production build locally
npm run preview

# lint
npm run lint
```

## Editing Content

All site content lives in [`src/data.js`](src/data.js):

- `profile` — name, title, rotating role titles, tagline, contact info
- `socials` — social links
- `skills` — skill categories
- `projects` — project cards and their case-study detail pages
- `timeline` — experience & education entries

Change the data there and the UI updates automatically — you rarely need to touch
the components.

## Project Structure

```
src/
├── assets/            # images, logos, case-study screenshots
├── components/        # Hero3D, ProjectDetail, Typewriter, Icon
├── hooks/             # useScrollSpy, useTilt, useRoute
├── data.js            # all site content
├── App.jsx            # layout & sections
└── main.jsx           # entry point
```

## Deployment

The project is configured for **Vercel** (`vercel.json` handles SPA routing).
Push to the connected GitHub repository and Vercel builds and deploys
automatically. Build command: `npm run build`, output directory: `dist`.

---

Built by Kerem Salim.
