"""
Scrape the LEI and LTI study plans from FCUL's Fenix (fenix.ciencias.ulisboa.pt).

For each degree it reads the newest study plan (Plano de Estudos), then, for every
curricular unit, the curricular-course page (objectives, syllabus, assessment,
bibliography, list of editions) and the most recent edition's course page
(objectives, syllabus, teaching staff, weekly class shifts), plus the degree's exam
calendar (dates, times, rooms). Both Portuguese and English are fetched.

Output: data/fenix.json   (raw HTTP responses are cached in .cache/fenix/)

Usage:  python -I scraper/scrape_fenix.py [--refresh]
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / ".cache" / "fenix"
OUT = ROOT / "data" / "fenix.json"
BASE = "https://fenix.ciencias.ulisboa.pt"

DEGREES = {
    "LEI": f"{BASE}/degrees/engenharia-informatica-564500436615278",
    "LTI": f"{BASE}/degrees/tecnologias-de-informacao-564500436615450",
}
LOCALES = {"pt": "pt-PT", "en": "en-GB"}
REFRESH = "--refresh" in sys.argv

_sessions: dict[str, requests.Session] = {}


def session(lang: str) -> requests.Session:
    """One session per locale; Fenix stores the locale server-side per cookie."""
    if lang not in _sessions:
        s = requests.Session()
        s.headers["User-Agent"] = "Mozilla/5.0 (compatible; fcul-course-map/1.0)"
        s.get(BASE + "/", timeout=30)
        s.post(f"{BASE}/api/bennu-core/profile/locale/{LOCALES[lang]}", timeout=30)
        _sessions[lang] = s
    return _sessions[lang]


def fetch(url: str, lang: str) -> str:
    key = hashlib.sha1(f"{lang}|{url}".encode()).hexdigest()
    path = CACHE / f"{key}.html"
    if path.exists() and not REFRESH:
        return path.read_text(encoding="utf-8")
    for attempt in range(4):
        try:
            r = session(lang).get(url, timeout=45)
            if r.status_code == 200:
                r.encoding = "utf-8"
                CACHE.mkdir(parents=True, exist_ok=True)
                path.write_text(r.text, encoding="utf-8")
                time.sleep(0.15)
                return r.text
            if r.status_code == 404:
                return ""
        except requests.RequestException:
            pass
        time.sleep(2 * (attempt + 1))
    print(f"  ! failed {url}", file=sys.stderr)
    return ""


def clean(text: str | None) -> str:
    if not text:
        return ""
    text = text.replace("\r", "")
    lines = [re.sub(r"[ \t ]+", " ", ln).strip() for ln in text.split("\n")]
    out, blank = [], False
    for ln in lines:
        if not ln:
            blank = True
            continue
        if blank and out:
            out.append("")
        out.append(ln)
        blank = False
    return "\n".join(out).strip()


def one_line(text: str | None) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


# --------------------------------------------------------------------------- plan
def parse_plan(html: str) -> dict:
    soup = BeautifulSoup(html, "lxml")
    title = one_line(soup.select_one("h2.site-header").get_text()) if soup.select_one("h2.site-header") else ""
    years = [one_line(a.get_text()) for a in soup.select(".dropdown-menu a, ul li a[href*='plan=']")]
    groups_tab = soup.select_one("#byGroups")
    courses: dict[str, dict] = {}
    groups: dict[str, dict] = {}

    def group_path(node):
        path = []
        for lvl in node.find_parents("div", class_="level"):
            h4 = lvl.find_previous_sibling("h4")
            name = one_line(h4.get_text()) if h4 else ""
            gid = lvl.get("id")
            if gid and gid not in groups:
                rules = [one_line(r.get_text()) for r in lvl.find("div", class_="rules").select(".rule")] if lvl.find("div", class_="rules") else []
                groups[gid] = {"id": gid, "name": name, "rules": rules}
            path.append({"id": gid, "name": name})
        return list(reversed(path))

    for row in groups_tab.select("div.row.small"):
        a = row.select_one("a[href*='curricularCourseId=']")
        if not a:
            continue
        cid = re.search(r"curricularCourseId=(\d+)", a["href"]).group(1)
        cols = row.find_all("div", recursive=False)
        when = one_line(cols[0].find("div").get_text()) if cols and cols[0].find("div") else ""
        info = one_line(cols[1].get_text()) if len(cols) > 1 else ""
        ects = re.search(r"([\d.]+)", cols[2].get_text()) if len(cols) > 2 else None
        load = one_line(cols[3].get_text()) if len(cols) > 3 else ""
        m = re.search(r"(\d+)\D+(\d+)", when)
        nums = re.findall(r"[\d.]+", load)
        entry = courses.setdefault(cid, {
            "id": cid,
            "name": one_line(a.get_text()),
            "year": int(m.group(1)) if m else None,
            "semester": int(m.group(2)) if m else None,
            "optional": "(" in info,
            "ects": float(ects.group(1)) if ects else None,
            "hours": {"contact": float(nums[0]) if len(nums) > 0 else None,
                      "autonomous": float(nums[1]) if len(nums) > 1 else None,
                      "total": float(nums[2]) if len(nums) > 2 else None},
            "groups": [],
        })
        entry["groups"].append([g["name"] for g in group_path(row)])
    return {"title": title, "years": years, "courses": courses, "groups": groups}


# ------------------------------------------------------------- curricular course
def parse_curricular(html: str) -> dict:
    soup = BeautifulSoup(html, "lxml")
    main = soup.select_one("main") or soup
    h1 = main.find("h1")
    acr = h1.find("small").get_text(strip=True) if h1 and h1.find("small") else ""
    if h1 and h1.find("small"):
        h1.find("small").extract()
    out = {"name": one_line(h1.get_text()) if h1 else "", "acronym": acr, "sections": {}, "bibliography": {}, "editions": []}
    for h3 in main.find_all("h3"):
        label = one_line(h3.get_text()).lower()
        sib = h3.find_next_sibling()
        if label.startswith(("objectiv", "objetiv")):
            out["sections"]["objectives"] = clean(sib.get_text("\n")) if sib and sib.name == "p" else ""
        elif label.startswith(("programa", "program")):
            out["sections"]["program"] = clean(sib.get_text("\n")) if sib and sib.name == "p" else ""
        elif label.startswith(("método de avaliação", "evaluation", "assessment")):
            out["sections"]["assessment"] = clean(sib.get_text("\n")) if sib and sib.name == "p" else ""
        elif label.startswith(("contexto", "scope", "context")):
            out["context"] = one_line(sib.get_text()) if sib else ""
        elif label.startswith(("bibliografia", "bibliograph")):
            node, current = h3.find_next_sibling(), None
            while node and node.name != "h3":
                if node.name == "h4":
                    current = one_line(node.get_text())
                elif node.name == "ul" and current:
                    items = []
                    for li in node.find_all("li"):
                        title = one_line(li.find("strong").get_text()).rstrip(": ") if li.find("strong") else ""
                        rest = [one_line(s.get_text()) for s in li.find_all("span") if one_line(s.get_text())]
                        link = li.find("a")
                        items.append({"title": title, "details": rest, "url": link["href"] if link and link.get("href", "").startswith("http") else None})
                    out["bibliography"][current] = items
                node = node.find_next_sibling()
        elif "execu" in label:
            node = h3.find_next_sibling()
            while node and node.name == "p":
                a = node.find("a")
                if a:
                    out["editions"].append({"label": one_line(a.get_text()), "url": a["href"]})
                node = node.find_next_sibling()
    return out


def edition_sort_key(label: str):
    m = re.search(r"(\d{4})/(\d{4}).*?(\d)", label)
    return (int(m.group(1)), int(m.group(3))) if m else (0, 0)


# ------------------------------------------------------------- execution course
def parse_exec_home(html: str) -> dict:
    soup = BeautifulSoup(html, "lxml")
    staff = []
    for img in soup.select("img.img-circle[src*='/api/user/photo/']"):
        col = img.find_parent("div", class_="row")
        body = col.select_one(".col-sm-11") if col else None
        if not body:
            continue
        badges = [one_line(b.get_text()) for b in body.select(".badge")]
        for b in body.select(".badge"):
            b.extract()
        name = one_line(body.get_text())
        if name:
            staff.append({"name": name, "roles": badges})
    period = ""
    h2 = soup.select_one("h2.site-header")
    head = soup.select_one("main h3")
    if head:
        period = one_line(head.get_text())
    return {"staff": staff, "period": period, "title": one_line(h2.get_text()) if h2 else ""}


def parse_exec_section(html: str) -> str:
    soup = BeautifulSoup(html, "lxml")
    main = soup.select_one("main") or soup
    p = main.select_one("p[style*='pre-line']")
    return clean(p.get_text("\n")) if p else ""


# ------------------------------------------------------------ timetable + exams
WEEKDAYS = {"seg": 1, "ter": 2, "qua": 3, "qui": 4, "sex": 5, "sab": 6, "sáb": 6, "dom": 7}
LISBON = ZoneInfo("Europe/Lisbon")


def parse_shifts(html: str) -> list[dict]:
    """Rows of the execution course's /turnos table: one row per weekly slot."""
    soup = BeautifulSoup(html, "lxml")
    table = soup.select_one("main table")
    rows = []
    for tr in table.select("tbody tr") if table else []:
        tds = tr.find_all("td")
        if len(tds) < 5:
            continue
        m = re.match(r"\s*(\w+)\.?,\s*(\d{1,2}:\d\d)\D+(\d{1,2}:\d\d)", tds[2].get_text(" ", strip=True))
        if not m:
            continue
        turmas = [t for t in (one_line(x) for x in tds[4].get_text("\n").split("\n")) if t and "[" not in t]
        rows.append({
            "shift": one_line(tds[0].get_text()),
            "weeks": one_line(tds[1].get_text()),
            "day": WEEKDAYS.get(m.group(1).lower()[:3], 0),
            "start": m.group(2).zfill(5),
            "end": m.group(3).zfill(5),
            "room": one_line(tds[3].get_text()),
            "turmas": sorted(set(turmas)),
        })
    return rows


def calendar_events(html: str) -> list[dict]:
    """The JSON array the Fenix calendar widget is initialised with (events: [...])."""
    m = re.search(r"events\s*:\s*\[", html)
    if not m:
        return []
    start, depth = m.end() - 1, 0
    for i in range(start, len(html)):
        depth += {"[": 1, "]": -1}.get(html[i], 0)
        if depth == 0:
            return json.loads(html[start : i + 1])
    return []


def local(ts: str) -> datetime:
    return datetime.fromisoformat(ts.replace("Z", "+00:00")).astimezone(LISBON)


def parse_exams(html: str) -> list[dict]:
    """Degree /avaliacoes page: every exam of the year, with rooms. Grade-improvement
    entries ("Melhoria") duplicate the regular ones, so they are skipped."""
    out = []
    for ev in calendar_events(html):
        first, *rest = [one_line(x) for x in ev.get("title", "").split("\n")]
        name, _, kind = first.rpartition(" - ")
        if not name or "melhoria" in kind.lower():
            continue
        k = kind.lower()
        epoca = "1" if k.startswith("1") else "2" if k.startswith("2") else "esp" if "especial" in k else kind
        rooms = sorted({r.strip() for r in (rest[-1] if rest else "").replace(",", ";").split(";") if r.strip()})
        a, b = local(ev["start"]), local(ev["end"])
        out.append({"name": name, "epoca": epoca, "date": a.date().isoformat(),
                    "start": a.strftime("%H:%M"), "end": b.strftime("%H:%M"), "rooms": rooms})
    return sorted(out, key=lambda e: (e["date"], e["start"], e["name"]))


# ------------------------------------------------------------------------ main
def scrape_course(degree_url: str, cid: str) -> dict:
    result = {"pt": {}, "en": {}, "latest": None}
    for lang in LOCALES:
        html = fetch(f"{degree_url}/curriculo?curricularCourseId={cid}", lang)
        result[lang] = parse_curricular(html) if html else {}
    editions = result["pt"].get("editions") or []
    if editions:
        latest = max(editions, key=lambda e: edition_sort_key(e["label"]))
        url = latest["url"]
        info = {"label": latest["label"], "url": url, "pt": {}, "en": {}}
        home = fetch(url, "pt")
        info.update(parse_exec_home(home) if home else {})
        for lang in LOCALES:
            info[lang] = {
                "objectives": parse_exec_section(fetch(url + "/objectivos", lang)),
                "program": parse_exec_section(fetch(url + "/programa", lang)),
            }
        info["shifts"] = parse_shifts(fetch(url + "/turnos", "pt"))
        result["latest"] = info
    return result


EMAIL = re.compile(r"\s*[\w.%+-]+@[\w-]+(?:\.[\w-]+)+")


def scrub(value):
    """Drop e-mail addresses everywhere: the output is meant to be published."""
    if isinstance(value, str):
        return EMAIL.sub("", value).strip() if "@" in value else value
    if isinstance(value, list):
        return [scrub(v) for v in value]
    if isinstance(value, dict):
        return {k: scrub(v) for k, v in value.items()}
    return value


def main():
    data = {"source": BASE, "scraped": date.today().isoformat(), "degrees": {}}
    for code, url in DEGREES.items():
        print(f"[{code}] study plan")
        desc = {lang: fetch(url + "/descricao", lang) for lang in LOCALES}
        plans = {lang: parse_plan(fetch(url + "/curriculo", lang)) for lang in LOCALES}
        plan = plans["pt"]
        for cid, c in plan["courses"].items():
            en = plans["en"]["courses"].get(cid)
            c["name_en"] = en["name"] if en else c["name"]
            c["groups_en"] = en["groups"] if en else c["groups"]
        ids = list(plan["courses"])
        print(f"[{code}] {len(ids)} curricular units; fetching details")
        with ThreadPoolExecutor(max_workers=4) as pool:
            details = dict(zip(ids, pool.map(lambda i: scrape_course(url, i), ids)))
        for cid in ids:
            plan["courses"][cid]["detail"] = details[cid]
        data["degrees"][code] = {
            "url": url,
            "title": {"pt": plans["pt"]["title"], "en": plans["en"]["title"]},
            "plan_year": (plans["pt"]["years"] or [""])[0],
            "description": {lang: description(desc[lang]) for lang in LOCALES},
            "exams": parse_exams(fetch(url + "/avaliacoes", "pt")),
            "groups": plan["groups"],
            "groups_en": plans["en"]["groups"],
            "courses": plan["courses"],
        }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(scrub(data), ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"wrote {OUT}")


def description(html: str) -> dict:
    soup = BeautifulSoup(html, "lxml")
    main = soup.select_one("main") or soup
    info = {}
    for p in main.select(".modal-body p, .modal p"):
        txt = one_line(p.get_text())
        if ":" in txt:
            k, v = txt.split(":", 1)
            info[k.strip()] = v.strip()
    sections = {}
    for h in main.find_all(["h3", "h4"]):
        label = one_line(h.get_text())
        parts, node = [], h.find_next_sibling()
        while node and node.name not in ("h3", "h4"):
            parts.append(node.get_text("\n"))
            node = node.find_next_sibling()
        if label and parts:
            sections[label] = clean("\n".join(parts))
    return {"info": info, "sections": sections}


if __name__ == "__main__":
    main()
