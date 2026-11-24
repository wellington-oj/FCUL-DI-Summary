# FCUL-DI-Summary: Mapa das Cadeiras LEI · LTI · Mestrados

**Live site: https://wellington-oj.github.io/FCUL-DI-Summary/**

A static website that maps every course in FCUL's (Ciências ULisboa) **Licenciatura em Engenharia Informática (LEI)** and **Licenciatura em Tecnologias de Informação (LTI)**: what each one teaches, the skills it gives, how the courses build on each other, and when and where its classes and exams happen. A separate **Mestrados** section does the same for the Department of Informatics' four master's degrees: Engenharia Informática (MEI), Informática (MI), Segurança Informática (MSI) and Ciência de Dados (MCD). It is bilingual (PT/EN) and has light and dark themes.

The data comes from the public Fenix pages (`fenix.ciencias.ulisboa.pt`). It uses the 2026/2027 study plans and the most recent edition of each course.

## Structure

```
site/                    ← the website (deploy this folder as-is)
  index.html
  assets/styles.css
  assets/app.js
  data/courses.js        ← generated, do not edit by hand
scraper/
  scrape_fenix.py        ← downloads plans, course pages, shifts and the exam calendar from Fenix → data/fenix.json
  fcul_exams.py          ← reads the faculty's official exam calendar (PDF) → data/exams_fcul.json
  build_site_data.py     ← merges fenix.json + exams_fcul.json + curation.json → site/data/courses.js
data/
  fenix.json             ← raw scraped data
  exams_fcul.json        ← LEI/LTI rows of the official exam calendar
  curation.json          ← hand-written: summaries, topics, areas, connections
  skills.json            ← hand-written: concrete skills per course (PT/EN), shown in the Skills view
  masters.json           ← hand-written: master's intros, structure notes, option-group labels, course colour areas
```

## Updating the data

```bash
pip install -r scraper/requirements.txt
python -I scraper/scrape_fenix.py --refresh   # re-download everything (cached in .cache/ otherwise)
python -I scraper/fcul_exams.py --refresh     # newest exam calendar PDF linked from ciencias.ulisboa.pt
python -I scraper/build_site_data.py
```

When a new academic year appears on Fenix, the scraper picks up the newest study plan and the newest edition of each course automatically. If a course is added or renamed, add an entry for its Fenix acronym to `data/curation.json`. The build script prints any curation keys that no longer match a course.

### About `curation.json`

Fenix does not publish formal prerequisites, so the **connections** ("builds on" / "leads to") and the short **summaries** are an editorial reading of each course's syllabus. Each course entry has:

- `area`: one of the area keys at the top of the file (it controls the tile colour)
- `after`: acronyms of courses whose content this one builds on
- `twin`: the closest counterpart in the other degree (used in the Compare view)
- `pt` / `en`: a one-sentence `summary` and a list of `topics`

Options and Minor courses that have no curated entry get an automatic summary taken from the first sentences of their Fenix objectives.

### About `skills.json`

For each course (by Fenix acronym), it lists what a student should be able to do afterwards, in PT and EN. The skills were written from each course's Fenix objectives and syllabus. They feed the **Skills** view (a semester-by-semester skill tree) and the search. The build script lists any course that's missing an entry.

### Timetable and exams

The **Timetable** view combines two sources.

- **Classes** come from each course edition's Fenix *Turnos* page: shift, weekday, time, room and class groups such as `1LEI01`.
- **Exams** (date, time and rooms for the 1st, 2nd and special periods) come from the faculty's official exam calendar, a PDF linked from the [Calendars, deadlines and schedules](https://ciencias.ulisboa.pt/en/education/current-students/academic-information/calendars-deadlines-and-schedules) page. A new dated file replaces it whenever it changes; `fcul_exams.py` follows the link on that page, so re-run it with `--refresh`. The PDF's text layer maps accented letters to U+FFFD, so rows are rebuilt from the position of each cell and names are matched with those letters as wildcards. A row belongs to a course when its *Cursos* column lists one of the course's degrees (LEI, LTI, MEI, MI, MSI, MCD) and its name matches. Courses with separate T and TP exams get one entry per part. The build script prints any row it cannot match.
- Courses missing from the PDF keep the exams from the Fenix *Avaliações* page, which Fenix also scrapes (grade-improvement entries are skipped).

Timetables change during the year, so re-run both scrapers with `--refresh` to pick up changes.

### Master's degrees

The four master's degrees are scraped like the bachelor's (see `DEGREES` in `scrape_fenix.py`) and shown in their own section (`#mestrados`, `#m-mei`, `#m-mi`, `#m-msi`, `#m-mcd`). Their first year is almost all options, so each page shows:

- the structure: compulsory courses, how many ECTS are left for options, and the second-year final work
- the first-year options by semester, with the degree's option groups as filters. These are MEI's nine specialisations (*nucleares* courses are marked), MI's CTP/MC/OSC/SI groups, MSI's AE/OG groups and MCD's core and focus groups.

Each course's groups come from its Fenix study-plan path and are matched against the labels in `data/masters.json`, which also has a short intro and structure note per degree and a colour area per course. Master's courses have no hand-written summaries, connections or skills yet: summaries fall back to the first sentences of the Fenix objectives.

The master's timetable (`#cal-mei`, ...) works like the bachelor's one, except for the week. Fenix puts every course of a master's degree in a single class group, so students instead pick the courses they take ("O seu horário", kept in the browser) and see those courses' classes and exams.

## Running locally

Open `site/index.html` directly in a browser. No server or build step is needed. Alternatively:

```bash
python -m http.server -d site 8000
```

## Deploying

The site is hosted on GitHub Pages. `.github/workflows/pages.yml` publishes the `site/` folder on every push to `main`, so to update the live site, rebuild the data and push.

`site/` is plain static files, so any other static host works too (Netlify, Cloudflare Pages, Vercel). Point the host at the `site` folder. URLs use hash routes (`#lei`, `#lti`, `#compare`, `#skills-lei`, `#cal-lei`, `#cal-lei-<course>`, `#c-<course>`, and the same for `lti`; `#mestrados`, `#m-mei` and `#cal-mei` for the master's degrees), so no rewrite rules are needed.

Before making it public:
- The footer states that the site is independent and not affiliated with FCUL. Keep that.
- Staff names are shown, but email addresses are stripped on purpose. The scraper removes them before writing `data/fenix.json`, so they never reach the repository.
- Fonts load from Google Fonts. Self-host them if you prefer no third-party requests.
