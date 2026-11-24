"""
Merge data/fenix.json (scraped: plans, course pages, shifts, exams), data/exams_fcul.json
(official exam calendar) and data/curation.json + data/skills.json (hand-written) into
site/data/courses.js, the single file the site loads.

Usage:  python -I scraper/build_site_data.py
"""
from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FENIX = json.loads((ROOT / "data" / "fenix.json").read_text(encoding="utf-8"))
CUR = json.loads((ROOT / "data" / "curation.json").read_text(encoding="utf-8"))
SKILLS = json.loads((ROOT / "data" / "skills.json").read_text(encoding="utf-8"))
# master's degrees: intros, option-group labels and course colour areas (hand-written)
_masters = ROOT / "data" / "masters.json"
if _masters.exists():
    MASTERS = json.loads(_masters.read_text(encoding="utf-8"))
    CUR["degrees"].update(MASTERS["degrees"])
    for _acr, _entry in MASTERS["courses"].items():
        CUR["courses"].setdefault(_acr, _entry)
OUT = ROOT / "site" / "data" / "courses.js"
LANGS = ("pt", "en")


def slug(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def first_sentences(text: str, limit: int = 230) -> str:
    text = re.sub(r"\s+", " ", text or "").strip()
    text = re.sub(r"^(os |the )?(objectivos|objetivos|objectives|goals)[^:]*:\s*", "", text, flags=re.I)
    if len(text) <= limit:
        return text
    cut = text[:limit]
    end = max(cut.rfind(". "), cut.rfind("; "))
    return (cut[: end + 1] if end > 80 else cut.rsplit(" ", 1)[0] + "…").strip()


def strip_code(name: str) -> str:
    return re.sub(r"^\d+\s*-\s*", "", name).strip()


def edition_semester(label: str):
    m = re.search(r"(\d)\s*(?:º\s*)?Sem", label or "", flags=re.I)
    return int(m.group(1)) if m else None


def group_shifts(rows):
    """Fenix lists one row per weekly slot; group them into shifts (T11, TP12, ...)."""
    shifts = {}
    for r in rows or []:
        sh = shifts.setdefault(r["shift"], {"id": r["shift"], "type": re.match(r"[A-Za-z]*", r["shift"]).group(0) or "?",
                                            "slots": [], "turmas": set()})
        slot = {"day": r["day"], "start": r["start"], "end": r["end"], "room": r["room"]}
        if slot not in sh["slots"]:
            sh["slots"].append(slot)
        sh["turmas"].update(r["turmas"])
    out = []
    for sh in shifts.values():
        sh["slots"].sort(key=lambda x: (x["day"], x["start"]))
        sh["turmas"] = sorted(sh["turmas"])
        out.append(sh)
    order = {"T": 0, "TP": 1, "PL": 2, "P": 3}
    return sorted(out, key=lambda x: (order.get(x["type"], 9), int(re.sub(r"\D", "", x["id"]) or 0), x["id"]))


def clean_staff(staff):
    out = []
    for s in staff or []:
        name = " ".join(t for t in s["name"].split() if "@" not in t)
        lead = any(r.lower().startswith(("respons", "lead", "coordinat")) for r in s.get("roles", []))
        if name and name not in [o["name"] for o in out]:
            out.append({"name": name, "lead": lead})
    return sorted(out, key=lambda s: (not s["lead"], s["name"]))


def option_sets(code, paths, dcur):
    """Master's degrees: which option groups (MEI specialisations, MCD focus groups, ...) a course
    belongs to. The deepest coded group of each Fenix path ("2017 - MEI - Ciência de Dados -
    Nucleares") is matched against the labels listed in curation.json; MEI's "Nucleares" marks the
    courses at the heart of a specialisation."""
    wanted = {s["match"]: s["id"] for s in dcur.get("sets", [])}
    out = {}
    for p in paths:
        coded = [g for g in p if re.match(r"^\d+\s*-", g)]
        if not coded:
            continue
        label = re.sub(r"^\d+\s*-\s*", "", coded[-1])
        label = re.sub(r"^(MEI|MI|MSI|MCD|Mestrado em [^-]+?)\s*-\s*", "", label)
        label = re.sub(r"^Opção\s+", "", label)
        label = re.sub(r"\s*\([A-Z]{2,5}\)$", "", label).strip()
        nuclear = False
        m = re.match(r"^(.*) - (Nucleares|Livres)$", label)
        if m:
            label, nuclear = m.group(1), m.group(2) == "Nucleares"
        if label in wanted:
            sid = wanted[label]
            out[sid] = out.get(sid, False) or nuclear
    return [{"id": k, "core": v} for k, v in out.items()]


courses: dict[str, dict] = {}
by_edition: dict[str, str] = {}
degrees = {}

for code, deg in FENIX["degrees"].items():
    dcur = CUR["degrees"][code]
    exams_by_name: dict[str, list] = {}
    for e in deg.get("exams", []):
        exams_by_name.setdefault(slug(e["name"]), []).append({k: v for k, v in e.items() if k != "name"})
    info = deg["description"]["pt"]["info"]
    secs_pt, secs_en = deg["description"]["pt"]["sections"], deg["description"]["en"]["sections"]

    def section(secs, *names):
        for k, v in secs.items():
            if any(k.lower().startswith(n) for n in names):
                return re.sub(r"\s+", " ", v).strip()
        return ""

    level = deg.get("level", "bachelor")
    degrees[code] = {
        "code": code,
        "level": level,
        "dges": info.get("Código", ""),
        "title": deg["title"],
        "short": dcur["short"],
        "intro": dcur["intro"],
        "url": deg["url"],
        "planYear": deg["plan_year"],
        "ects": 120 if level == "master" else 180,
        "semesters": 4 if level == "master" else 6,
        "sets": [{k: s[k] for k in ("id", "pt", "en", "kind") if k in s} for s in dcur.get("sets", [])],
        "structure": dcur.get("structure"),
        "setsTitle": dcur.get("setsTitle"),
        "jobs": {"pt": section(secs_pt, "saídas"), "en": section(secs_en, "employment", "career")},
        "coordinators": " ".join(t for t in section(secs_pt, "coordena").split() if "@" not in t),
        "minors": [],
        "groups": [],
    }

    for cid, c in deg["courses"].items():
        det = c["detail"]
        acr = det["pt"].get("acronym") or slug(c["name"])[:8]
        latest = det.get("latest") or {}
        ed_url = latest.get("url") or f"{code}-{cid}"
        cur = CUR["courses"].get(acr, {})

        key = by_edition.get(ed_url)
        if not key:
            key = slug(acr)
            if key in courses:
                key = f"{key}-{code.lower()}"
            by_edition[ed_url] = key

            def pick(field):
                out = {}
                for lang in LANGS:
                    v = ((latest.get(lang) or {}).get(field) or det[lang].get("sections", {}).get(field) or "")
                    out[lang] = v
                for lang in LANGS:
                    if not out[lang]:
                        out[lang] = out["en" if lang == "pt" else "pt"]
                return out

            objectives, program = pick("objectives"), pick("program")
            assessment = {lang: det[lang].get("sections", {}).get("assessment", "") for lang in LANGS}
            biblio = []
            for kind, items in (det["pt"].get("bibliography") or {}).items():
                k = "main" if kind.lower().startswith(("princ", "main")) else "secondary"
                for it in items:
                    if it["title"] or it["details"]:
                        biblio.append({**it, "kind": k})
            courses[key] = {
                "id": key,
                "acr": acr,
                "name": {"pt": c["name"], "en": c.get("name_en") or c["name"]},
                "ects": c["ects"],
                "hours": c["hours"],
                "area": cur.get("area"),
                "summary": {lang: (cur.get(lang) or {}).get("summary") or first_sentences(objectives[lang]) for lang in LANGS},
                "topics": {lang: (cur.get(lang) or {}).get("topics", []) for lang in LANGS},
                "skills": {lang: (SKILLS.get(acr) or {}).get(lang, []) for lang in LANGS},
                "curated": bool(cur.get("pt")),
                "objectives": objectives,
                "program": program,
                "assessment": assessment,
                "biblio": biblio,
                "staff": clean_staff(latest.get("staff")),
                "edition": {"label": latest.get("label", ""), "url": latest.get("url")} if latest else None,
                "shifts": group_shifts(latest.get("shifts")),
                "exams": [],
                "after": cur.get("after", []),
                "twin": cur.get("twin"),
                "offerings": [],
            }
        course = courses[key]
        for e in exams_by_name.pop(slug(c["name"]), []):
            if e not in course["exams"]:
                course["exams"].append(e)
        course["exams"].sort(key=lambda e: (e["date"], e["start"]))

        group_pt, group_en = c["groups"][0], (c.get("groups_en") or c["groups"])[0]
        is_minor = any(g.lower().startswith(("menor", "minor")) for g in group_pt[2:3])
        named_pt = next((g for g in group_pt if re.match(r"^\d+\s*-", g)), "")
        named_en = next((g for g in group_en if re.match(r"^\d+\s*-", g)), named_pt)
        kind = "core" if not c["optional"] else ("minor" if is_minor else "option")
        group = {"id": slug(strip_code(named_en))[:40] if named_pt else "", "pt": strip_code(named_pt), "en": strip_code(named_en)}
        sem = c["semester"]
        if kind != "core":
            sem = edition_semester(latest.get("label", "")) or sem
        if level == "master":
            kind = "core" if not c["optional"] else ("final" if c["year"] == 2 else "option")
        course["offerings"].append({
            "degree": code, "year": c["year"], "sem": sem, "kind": kind,
            "group": group if named_pt and level != "master" else None,
            **({"sets": option_sets(code, c["groups"], dcur)} if level == "master" else {}),
            "fenix": f"{deg['url']}/curriculo?curricularCourseId={cid}",
        })
        if kind == "minor" and group["id"] not in [m["id"] for m in degrees[code]["minors"]]:
            degrees[code]["minors"].append(group)
        if kind == "option" and level != "master" and group["id"] not in [g["id"] for g in degrees[code]["groups"]]:
            rules = [g["rules"] for g in deg["groups_en"].values() if strip_code(g["name"]) == group["en"]]
            m = re.search(r"([\d.]+)", " ".join(rules[0]) if rules else "")
            degrees[code]["groups"].append({**group, "year": c["year"], "credits": float(m.group(1)) if m else None})

    if exams_by_name:
        print(f"[{code}] exams with no matching course:", sorted(exams_by_name))

# areas for non-curated courses, and resolve acronym references into course ids
acr_index = {}
for k, c in courses.items():
    acr_index.setdefault(c["acr"], k)
for c in courses.values():
    if not c["area"]:
        c["area"] = "minor" if any(o["kind"] == "minor" for o in c["offerings"]) else "free"
    c["after"] = [acr_index[a] for a in c["after"] if a in acr_index]
    c["twin"] = acr_index.get(c["twin"]) if c["twin"] else None

# Exam dates, times and rooms: the faculty's official exam calendar (PDF, see fcul_exams.py)
# wins over the Fenix calendar. A PDF row belongs to a course when its "Cursos" column lists one
# of the course's degrees and its name matches; the PDF's accented letters come out as U+FFFD,
# so each of those matches any single letter.
EXAMS_PDF = ROOT / "data" / "exams_fcul.json"
exam_source = None
if EXAMS_PDF.exists():
    pdf = json.loads(EXAMS_PDF.read_text(encoding="utf-8"))
    exam_source = pdf["source"]

    def name_re(name):
        base = re.sub(r"\s*\((LEI|LTI)\)\s*$", "", name.strip())
        part = re.search(r"\s*\((T|TP|P|PL)\)\s*$", base)
        if part:
            base = base[: part.start()]
        pat = "".join("." if ch == "�" else re.escape(ch) for ch in base.lower())
        return re.compile(pat + r"$"), part.group(1) if part else None

    used = set()
    diffs = []
    for c in courses.values():
        names = {c["name"]["pt"].lower().strip()}
        degs = {o["degree"] for o in c["offerings"]}
        found = []
        for i, r in enumerate(pdf["exams"]):
            if not degs & {d["degree"] for d in r["degrees"]}:
                continue
            rx, part = name_re(r["name"])
            if any(rx.match(n) for n in names):
                used.add(i)
                e = {"epoca": r["epoca"], "date": r["date"], "start": r["start"], "end": r["end"], "rooms": r["rooms"]}
                if r.get("roomNote"):
                    e["roomNote"] = r["roomNote"]
                if part:
                    e["part"] = part
                if e not in found:
                    found.append(e)
        if not found:
            continue
        old = {(e["epoca"], e["date"], e["start"]) for e in c["exams"]}
        new = {(e["epoca"], e["date"], e["start"]) for e in found}
        if c["exams"] and old != new:
            diffs.append(c["acr"])
        c["exams"] = sorted(found, key=lambda e: (e["date"], e["start"] or "", e.get("part") or ""))
    left = sorted({r["name"] for i, r in enumerate(pdf["exams"]) if i not in used})
    print(f"exams: {len(used)} PDF rows matched; Fenix date/time differs for {len(diffs)} courses: {diffs}")
    if left:
        print("PDF exam rows with no matching course:", left)

missing = [a for a, v in CUR["courses"].items() if a not in acr_index]
if missing:
    print("curation keys with no matching course:", missing)
no_skills = sorted({c["acr"] for c in courses.values() if c["acr"] not in SKILLS
                    and any(degrees[o["degree"]]["level"] == "bachelor" for o in c["offerings"])})
if no_skills:
    print("courses with no entry in skills.json:", no_skills)
stale = [a for a in SKILLS if not a.startswith("_") and a not in acr_index]
if stale:
    print("skills.json keys with no matching course:", stale)

data = {
    "source": FENIX["source"],
    "scraped": FENIX["scraped"],
    "examSource": exam_source,
    "areas": CUR["areas"],
    "degrees": degrees,
    "courses": courses,
}
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text("window.COURSE_DATA = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
print(f"wrote {OUT} ({OUT.stat().st_size // 1024} KB, {len(courses)} courses)")
