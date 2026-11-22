"""
Merge data/fenix.json (scraped) with data/curation.json (hand-written summaries,
areas and connections) into site/data/courses.js, the single file the site loads.

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


def clean_staff(staff):
    out = []
    for s in staff or []:
        name = " ".join(t for t in s["name"].split() if "@" not in t)
        lead = any(r.lower().startswith(("respons", "lead", "coordinat")) for r in s.get("roles", []))
        if name and name not in [o["name"] for o in out]:
            out.append({"name": name, "lead": lead})
    return sorted(out, key=lambda s: (not s["lead"], s["name"]))


courses: dict[str, dict] = {}
by_edition: dict[str, str] = {}
degrees = {}

for code, deg in FENIX["degrees"].items():
    dcur = CUR["degrees"][code]
    info = deg["description"]["pt"]["info"]
    secs_pt, secs_en = deg["description"]["pt"]["sections"], deg["description"]["en"]["sections"]

    def section(secs, *names):
        for k, v in secs.items():
            if any(k.lower().startswith(n) for n in names):
                return re.sub(r"\s+", " ", v).strip()
        return ""

    degrees[code] = {
        "code": code,
        "dges": info.get("Código", ""),
        "title": deg["title"],
        "short": dcur["short"],
        "intro": dcur["intro"],
        "url": deg["url"],
        "planYear": deg["plan_year"],
        "ects": 180,
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
                "after": cur.get("after", []),
                "twin": cur.get("twin"),
                "offerings": [],
            }
        course = courses[key]

        group_pt, group_en = c["groups"][0], (c.get("groups_en") or c["groups"])[0]
        is_minor = any(g.lower().startswith(("menor", "minor")) for g in group_pt[2:3])
        named_pt = next((g for g in group_pt if re.match(r"^\d+\s*-", g)), "")
        named_en = next((g for g in group_en if re.match(r"^\d+\s*-", g)), named_pt)
        kind = "core" if not c["optional"] else ("minor" if is_minor else "option")
        group = {"id": slug(strip_code(named_en))[:40] if named_pt else "", "pt": strip_code(named_pt), "en": strip_code(named_en)}
        sem = c["semester"]
        if kind != "core":
            sem = edition_semester(latest.get("label", "")) or sem
        course["offerings"].append({
            "degree": code, "year": c["year"], "sem": sem, "kind": kind,
            "group": group if named_pt else None,
            "fenix": f"{deg['url']}/curriculo?curricularCourseId={cid}",
        })
        if kind == "minor" and group["id"] not in [m["id"] for m in degrees[code]["minors"]]:
            degrees[code]["minors"].append(group)
        if kind == "option" and group["id"] not in [g["id"] for g in degrees[code]["groups"]]:
            rules = [g["rules"] for g in deg["groups_en"].values() if strip_code(g["name"]) == group["en"]]
            m = re.search(r"([\d.]+)", " ".join(rules[0]) if rules else "")
            degrees[code]["groups"].append({**group, "year": c["year"], "credits": float(m.group(1)) if m else None})

# areas for non-curated courses, and resolve acronym references into course ids
acr_index = {}
for k, c in courses.items():
    acr_index.setdefault(c["acr"], k)
for c in courses.values():
    if not c["area"]:
        c["area"] = "minor" if any(o["kind"] == "minor" for o in c["offerings"]) else "free"
    c["after"] = [acr_index[a] for a in c["after"] if a in acr_index]
    c["twin"] = acr_index.get(c["twin"]) if c["twin"] else None

missing = [a for a, v in CUR["courses"].items() if a not in acr_index]
if missing:
    print("curation keys with no matching course:", missing)
no_skills = sorted({c["acr"] for c in courses.values() if c["acr"] not in SKILLS})
if no_skills:
    print("courses with no entry in skills.json:", no_skills)
stale = [a for a in SKILLS if not a.startswith("_") and a not in acr_index]
if stale:
    print("skills.json keys with no matching course:", stale)

data = {
    "source": FENIX["source"],
    "scraped": FENIX["scraped"],
    "areas": CUR["areas"],
    "degrees": degrees,
    "courses": courses,
}
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text("window.COURSE_DATA = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
print(f"wrote {OUT} ({OUT.stat().st_size // 1024} KB, {len(courses)} courses)")
