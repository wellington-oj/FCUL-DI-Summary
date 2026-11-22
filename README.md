# FCUL-DI-Summary: Mapa das Cadeiras LEI · LTI

**Live site: https://wellington-oj.github.io/FCUL-DI-Summary/**

A static website that maps every course in FCUL's (Ciências ULisboa) **Licenciatura em Engenharia Informática (LEI)** and **Licenciatura em Tecnologias de Informação (LTI)**: what each one teaches, when it happens in the plan, and how the courses build on each other. It is bilingual (PT/EN) and has light and dark themes.

The data comes from the public Fenix pages (`fenix.ciencias.ulisboa.pt`). It uses the 2026/2027 study plans and the most recent edition of each course.

## Structure

```
site/                    ← the website (deploy this folder as-is)
  index.html
  assets/styles.css
  assets/app.js
  data/courses.js        ← generated, do not edit by hand
scraper/
  scrape_fenix.py        ← downloads plans + course pages from Fenix → data/fenix.json
  build_site_data.py     ← merges fenix.json + curation.json → site/data/courses.js
data/
  fenix.json             ← raw scraped data
  curation.json          ← hand-written: summaries, topics, areas, connections
  skills.json            ← hand-written: concrete skills per course (PT/EN), shown in the Skills view
```

## Updating the data

```bash
pip install -r scraper/requirements.txt
python -I scraper/scrape_fenix.py --refresh   # re-download everything (cached in .cache/ otherwise)
python -I scraper/build_site_data.py
```

When a new academic year appears on Fenix, the scraper picks up the newest study plan and the newest edition of each course automatically. If a course is added or renamed, add an entry for its Fenix acronym to `data/curation.json`. The build script prints any curation keys that no longer match a course.

### About `curation.json`

Fenix does not publish formal prerequisites, so the **connections** ("builds on" / "leads to") and the short **summaries** are an editorial reading of each course's syllabus. Each course entry has:

- `area`: one of the area keys at the top of the file (it controls the tile colour)
- `after`: acronyms of courses whose content this one builds on
- `twin`: the closest counterpart in the other degree (used in the Compare view)
- `pt` / `en`: a one-sentence `summary` and a list of `topics`

### About `skills.json`

For each course (by Fenix acronym), it lists what a student should be able to do afterwards, in PT and EN. The skills were written from each course's Fenix objectives and syllabus. They feed the **Skills** view (a semester-by-semester skill tree) and the search. The build script lists any course that's missing an entry.

Options and Minor courses that have no curated entry get an automatic summary taken from the first sentences of their Fenix objectives.

## Running locally

Open `site/index.html` directly in a browser. No server or build step is needed. Alternatively:

```bash
python -m http.server -d site 8000
```

## Deploying

The site is hosted on GitHub Pages. `.github/workflows/pages.yml` publishes the `site/` folder on every push to `main`, so to update the live site, rebuild the data and push.

`site/` is plain static files, so any other static host works too (Netlify, Cloudflare Pages, Vercel). Point the host at the `site` folder. URLs use hash routes (`#lei`, `#lti`, `#compare`, `#skills-lei`, `#skills-lti`, `#c-<course>`), so no rewrite rules are needed.

Before making it public:
- The footer states that the site is independent and not affiliated with FCUL. Keep that.
- Staff names are shown, but email addresses are stripped on purpose. The scraper removes them before writing `data/fenix.json`, so they never reach the repository.
- Fonts load from Google Fonts. Self-host them if you prefer no third-party requests.
