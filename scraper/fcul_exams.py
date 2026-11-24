"""Exam dates, times and rooms from the faculty's official exam calendar (PDF).

Ciências publishes the exam calendar as a PDF, linked from its "Calendars, deadlines and
schedules" page and replaced with a new dated file whenever it changes. This is the reference
for exam times and rooms, so the site uses it ahead of the Fenix exam calendar.

    python scraper/fcul_exams.py [--refresh] [path/to/calendar.pdf]

finds the newest PDF on that page (or reads the one given), and writes data/exams_fcul.json:
one record per row of the table, keeping the rows whose "Cursos" column lists LEI or LTI.

The PDF is printed from a spreadsheet: every cell is a separate piece of text, and its font
tables map accented letters to U+FFFD. So rows are rebuilt from the position of each piece,
and names keep the U+FFFD (they are only used to match courses; see build_site_data.py).
Dates, times, rooms and degree codes are plain ASCII and come through intact.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / ".cache" / "fcul"
OUT = ROOT / "data" / "exams_fcul.json"
PAGES = [
    "https://ciencias.ulisboa.pt/en/education/current-students/academic-information/calendars-deadlines-and-schedules",
]
PDF_LINK = re.compile(r'href="([^"]*calendario-exames-[^"]*\.pdf)"', re.I)
DEGREE_CODE = re.compile(r"^(\d)(LEI|LTI)(\*?)$")
DATE = re.compile(r"^(\d\d)/(\d\d)/(\d{4})$")
TIME = re.compile(r"^(\d\d):(\d\d):\d\d$")
ROOM = re.compile(r"^\d+\.\d+\.\d+[A-Za-z]?$")


def latest_pdf_url() -> str:
    for page in PAGES:
        html = requests.get(page, timeout=60, headers={"User-Agent": "fcul-di-summary/1.0"}).text
        links = PDF_LINK.findall(html)
        if links:
            return links[0]
    raise SystemExit("no exam calendar PDF linked from the calendars page")


def download(url: str) -> Path:
    CACHE.mkdir(parents=True, exist_ok=True)
    path = CACHE / url.rsplit("/", 1)[-1]
    if not path.exists() or "--refresh" in sys.argv:
        r = requests.get(url, timeout=120, headers={"User-Agent": "fcul-di-summary/1.0"})
        r.raise_for_status()
        path.write_bytes(r.content)
    return path


def pieces(pdf: Path):
    """Yield (page, [(y, x0, x1, text)]) for every text line pdfminer finds."""
    from pdfminer.high_level import extract_pages
    from pdfminer.layout import LAParams, LTTextLine

    def walk(o, out):
        if isinstance(o, LTTextLine):
            t = o.get_text().strip()
            if t:
                out.append(((o.y0 + o.y1) / 2, o.x0, o.x1, t))
        elif hasattr(o, "__iter__"):
            for c in o:
                walk(c, out)

    for n, page in enumerate(extract_pages(str(pdf), laparams=LAParams(char_margin=1.5))):
        out: list = []
        walk(page, out)
        yield n + 1, out


def columns(lines):
    """Left edge of each column on this page, from the header row."""
    head = {}
    for y, x0, x1, t in lines:
        for key, word in (("sem", "Semestre"), ("start", "Hora In"), ("end", "Hora Fim"), ("dur", "Dura")):
            if t.startswith(word) and (key != "sem" or t == word):
                head.setdefault(key, (y, x0))
    return head


def parse_page(lines):
    head = columns(lines)
    if "sem" not in head or "start" not in head:
        return []
    head_y = head["sem"][0]
    x_sem, x_start, x_dur = head["sem"][1], head["start"][1], head["dur"][1]
    # "Hora Início" and "Hora Fim" sometimes come out as one piece; "Fim" sits halfway to "Duração"
    x_end = head["end"][1] if "end" in head else (x_start + x_dur) / 2
    body = [p for p in lines if p[0] < head_y - 8 and p[0] > 60]  # below the header, above the footer
    anchors = sorted({round(p[0], 1) for p in body if DATE.match(p[3])}, reverse=True)
    rows = {a: [] for a in anchors}
    for p in body:
        if not anchors:
            break
        a = min(anchors, key=lambda a: abs(a - p[0]))
        if abs(a - p[0]) < 15:
            rows[a].append(p)
    out = []
    for a in anchors:
        cells = sorted(rows[a], key=lambda p: (-p[0], p[1]))
        rec = {"code": "", "name": "", "sem": None, "epoca": None, "date": None, "start": None, "end": None,
               "rooms": [], "cursos": []}
        name_parts, rest = [], []
        for y, x0, x1, t in cells:
            if x0 < x_sem - 4:
                if not rec["code"] and x0 < 62 and re.match(r"^\d+(_\w+)?$", t):
                    rec["code"] = t
                else:
                    m = re.match(r"^(\d+(?:_\w+)?)\s+(.*)$", t) if x0 < 62 else None
                    if m and not rec["code"]:
                        rec["code"], t = m.group(1), m.group(2)
                    name_parts.append(t)
            elif "Semestre" in t:
                rec["sem"] = int(t.split()[0])
            elif "Especial" in t:
                rec["epoca"] = "esp"
            elif re.match(r"^[12]\S*\s+\S*poca$", t):
                rec["epoca"] = t[0]
            elif DATE.match(t):
                d, m, yy = DATE.match(t).groups()
                rec["date"] = f"{yy}-{m}-{d}"
            elif TIME.match(t):
                hhmm = t[:5]
                col = min((("start", x_start), ("end", x_end), ("dur", x_dur)), key=lambda c: abs(c[1] - x0))[0]
                if col in ("start", "end"):
                    rec[col] = hhmm
            elif x0 > x_dur + 25:
                rest.append(t)
        rec["name"] = " ".join(name_parts)
        tokens = " ".join(rest).replace("|", " ").split()
        for tok in tokens:
            if ROOM.match(tok):
                rec["rooms"].append(tok)
            elif re.match(r"^\d[A-Za-z]", tok):
                rec["cursos"].append(tok.rstrip("/"))
        note = re.search(r"\((contactar[^)]*)\)", " ".join(rest))
        if note:
            rec["roomNote"] = note.group(1)
        if rec["date"] and rec["epoca"]:
            out.append(rec)
    return out


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if args:
        pdf, source = Path(args[0]), Path(args[0]).name
    else:
        source = latest_pdf_url()
        pdf = download(source)
    rows = []
    for _, lines in pieces(pdf):
        rows.extend(parse_page(lines))
    keep = []
    for r in rows:
        degs = []
        for c in r["cursos"]:
            m = DEGREE_CODE.match(c)
            if m:
                degs.append({"degree": m.group(2), "year": int(m.group(1)), "optional": bool(m.group(3))})
        if degs:
            r["degrees"] = degs
            keep.append(r)
    OUT.write_text(json.dumps({"source": source, "rows": len(rows), "exams": keep}, ensure_ascii=False, indent=1),
                   encoding="utf-8")
    print(f"{len(rows)} rows in {pdf.name}; {len(keep)} for LEI/LTI -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
