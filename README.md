# Kerem Salim — Portfolio

Personal portfolio site of Kerem Salim, a final-year Software Engineering student.
A single-page React application with an interactive 3D hero scene, a data-driven
content model, and detailed project case studies.

**Live:** https://your-domain.com _(update once deployed)_

---

## Features

- **Interactive 3D hero** — a distorting neon sphere with an orbiting satellite and
  drifting star particles, built with Three.js and React Three Fiber, reacting to
  cursor movement.
- **Custom scroll-spy navigation** that highlights the active section as you scroll.
- **Tilt-on-hover project cards**, a typewriter effect for the role titles, and an
  aurora glow behind the hero.
- **Project case studies** — each project has its own detail page with stats,
  key features, tech stack and an image gallery.
- **Fully responsive** — single-column mobile layout with a hamburger menu.
- **Data-driven** — every section renders from a single content file
  (`src/data.js`); no hardcoded copy lives inside the components.

## Tech Stack

| Area            | Technologies                                   |
| --------------- | ---------------------------------------------- |
| Core            | React 19, Vite                                 |
| 3D & Motion     | Three.js, React Three Fiber, drei              |
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
