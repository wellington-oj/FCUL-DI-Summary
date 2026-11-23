(() => {
  "use strict";
  const D = window.COURSE_DATA;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const app = $("#app");

  /* ------------------------------------------------------------ constants */
  const HUES = { prog: 255, hci: 222, se: 192, data: 158, soc: 128, free: 100, net: 76, sys: 48, sec: 20, ai: 352, math: 320, algo: 288, minor: 60 };
  const NEUTRAL = new Set(["free", "minor"]);
  const DEGREES = ["LEI", "LTI"];

  const T = {
    pt: {
      brandSub: "LEI · LTI · Ciências ULisboa",
      searchPh: "Pesquisar cadeiras, temas, docentes…",
      searchLabel: "Pesquisar cadeiras",
      themeLabel: "Mudar tema",
      langLabel: "Switch to English",
      eyebrow: (y) => `Plano de estudos ${y} · dados do Fenix`,
      headline: 'O que se aprende na <em>LEI</em> e na <em>LTI</em>, cadeira a cadeira',
      tagline: "Todas as cadeiras das licenciaturas em Engenharia Informática e em Tecnologias de Informação da Faculdade de Ciências da Universidade de Lisboa: o que ensinam, quando aparecem e como se ligam umas às outras.",
      compare: "Comparar", compareSub: "LEI lado a lado com a LTI",
      degreeKind: "Licenciatura",
      ects: "ECTS", semesters: "Semestres", core: "Obrigatórias", options: "Opções", minors: "Menores",
      areasTitle: "Peso de cada área nas cadeiras obrigatórias (ECTS)",
      allAreas: "Todas",
      hint: "Passe o rato por uma cadeira para ver as ligações; clique para abrir a ficha.",
      wiresIn: "assenta em", wiresOut: "prepara para",
      showAll: "Mostrar todas as ligações",
      year: (n) => `${n}.º ano`, sem: (n) => `${n}.º semestre`, semShort: (n) => `${n}.º sem`,
      yearSem: (y, s) => `${y}.º ano · ${s}.º sem`,
      slotOption: "Opção", slotMinor: "Menor",
      slotOptionName: "Cadeiras à escolha, ver opções abaixo",
      slotMinorName: "Cadeiras do Menor escolhido, ver abaixo",
      optionsTitle: "Opções",
      optionsLead: "Cadeiras de escolha livre dentro de cada grupo. Os créditos indicados são os que é preciso fazer no grupo.",
      minorsTitle: "Menores",
      minorsLead: "No 3.º ano da LTI escolhe-se um Menor de 30 ECTS: 18 no 1.º semestre e 12 no 2.º.",
      choose: (n) => `escolher ${n} ECTS`,
      both: "LEI + LTI",
      kind: { core: "Obrigatória", option: "Opção", minor: "Menor" },
      links: "Ligações", buildsOn: "Assenta em", leadsTo: "Prepara para", twinIn: (d) => `Equivalente na ${d}`,
      noBuilds: "Não depende de outras cadeiras do plano.", noLeads: "Nenhuma cadeira do plano assenta diretamente nesta.",
      objectives: "Objetivos", program: "Programa", assessment: "Avaliação", biblio: "Bibliografia",
      main: "Principal", secondary: "Secundária",
      staff: "Equipa docente", lead: "responsável",
      openEdition: "Página da cadeira no Fenix", openPlan: (d) => `Ficha no plano da ${d}`,
      hours: (t, c) => (c ? `${t} h · ${c} h de contacto` : `${t} h de trabalho`),
      noText: "O Fenix não tem texto para esta secção.",
      noSummary: "O Fenix ainda não tem descrição para esta cadeira.",
      editorial: (e) => `O resumo, os temas e as ligações são uma leitura editorial dos programas. Objetivos, programa, avaliação e equipa vêm do Fenix (${e}).`,
      close: "Fechar",
      noResults: (q) => `Nada encontrado para “${q}”. Experimente um tema (ex.: SQL, Java, redes) ou um docente.`,
      teaches: "Docente",
      compareTitle: "Duas licenciaturas, um tronco comum",
      compareLead: "As duas licenciaturas partilham várias cadeiras e muitas outras têm uma equivalente direta. A LEI aposta mais em matemática, física e teoria. A LTI troca isso por web, visualização e um Menor numa área complementar.",
      pairsTitle: "Cadeira a cadeira",
      same: "mesma cadeira", twin: "equivalente", sameMinor: "na LTI é do Menor",
      onlyIn: (d) => `Só na ${d}`,
      footer1: "<strong>Projeto independente</strong>, sem ligação oficial à Faculdade de Ciências da Universidade de Lisboa. Confirme sempre a informação oficial no Fenix antes de tomar decisões.",
      footer2: (d) => `Dados públicos do Fenix (fenix.ciencias.ulisboa.pt), plano de estudos 2026/2027 e edição mais recente de cada cadeira, recolhidos a ${d}.`,
      footer3: "Os resumos e as ligações entre cadeiras foram escritos a partir dos programas e não são precedências oficiais.",
      skillsTab: "Competências", skillsSub: "O que se fica a saber fazer",
      skillsEyebrow: (d) => `${d} · competências por cadeira`,
      skillsTitle: "O que se fica a saber fazer, semestre a semestre",
      skillsLead: "Para cada cadeira, as competências concretas com que um aluno deve sair. As linhas mostram em que cadeiras cada uma assenta. Passe o rato por uma cadeira para ver todo o percurso que leva até ela e tudo o que ela desbloqueia.",
      skillsHint: "Passe o rato por uma cadeira para ver o percurso completo; clique no nome para abrir a ficha.",
      pathIn: "percurso até aqui", pathOut: "o que desbloqueia",
      needs: "Assenta em",
      noSkills: "O Fenix ainda não tem descrição desta cadeira.",
      skillsNote: "Competências escritas a partir dos objetivos e programas publicados no Fenix.",
      skillWord: "Competência",
      calTab: "Horários", calSub: "Aulas e exames",
      calEyebrow: (d, y) => `${d} · horários e exames ${y}`,
      calTitle: "Quando e onde são as aulas e os exames",
      calLead: "Escolha uma cadeira para ver os turnos da semana e a data, hora e sala de cada exame. Sem nenhuma escolhida, veja a semana completa de uma turma e o calendário de exames do semestre.",
      calList: "Cadeiras do semestre",
      exams: "Exames",
      epoca: { 1: "1.ª época", 2: "2.ª época", esp: "Época especial" },
      room: "Sala", rooms: "Salas", roomTbd: "Sala ainda por anunciar",
      inDays: (n) => (n < 0 ? "já passou" : n === 0 ? "hoje" : n === 1 ? "amanhã" : `daqui a ${n} dias`),
      noExams: "Esta cadeira não aparece no calendário de exames do Fenix. A avaliação pode ser contínua ou por projeto: veja o método de avaliação na ficha da cadeira.",
      weekTitle: "Horário semanal", weekOf: (x) => `Semana da turma ${x}`,
      turma: "Turma", allTurmas: "Todas as turmas",
      turmaNone: (x) => `A turma ${x} não tem turnos nesta cadeira, por isso aparecem todos.`,
      turmaWhat: "As turmas (ex.: 1LEI01) são os grupos de horário do Fenix. O primeiro algarismo é o ano.",
      pickTurma: "Escolha uma turma para ver a semana completa, com as aulas de todas as cadeiras.",
      noShifts: "O Fenix não tem horário publicado para esta cadeira. Acontece sobretudo com cadeiras de Menores dadas noutras faculdades.",
      shiftType: { T: "Teórica", TP: "Teórico-prática", PL: "Prática laboratorial", P: "Prática", S: "Seminário", O: "Orientação tutorial", OT: "Orientação tutorial" },
      shiftsList: (n) => `Todos os turnos (${n})`,
      shiftCol: "Turno", whenCol: "Dia, hora e sala", turmasCol: "Turmas",
      otherDegrees: (n) => `+${n} de outros cursos`,
      openCourse: "Ficha da cadeira", fenixShifts: "Turnos no Fenix", calLink: "Horário e exames",
      backOverview: "Visão geral do semestre",
      examCal: "Calendário de exames",
      examCalLead: (s) => `Todos os exames das cadeiras do ${s}. Clique numa cadeira para ver os detalhes.`,
      examCalTurma: (x) => `Exames das cadeiras que a turma ${x} frequenta. Clique numa cadeira para ver os detalhes.`,
      noExamsPeriod: "Nenhum exame nesta época.",
      days: ["", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
      kindShort: { option: "opção", minor: "menor" },
      calNote: (y) => `Turnos e exames publicados no Fenix para ${y}. Podem mudar ao longo do ano: confirme sempre no Fenix.`,
    },
    en: {
      brandSub: "LEI · LTI · Ciências ULisboa",
      searchPh: "Search courses, topics, lecturers…",
      searchLabel: "Search courses",
      themeLabel: "Toggle theme",
      langLabel: "Mudar para português",
      eyebrow: (y) => `Study plan ${y} · data from Fenix`,
      headline: 'What you learn in <em>LEI</em> and <em>LTI</em>, course by course',
      tagline: "Every course in the Informatics Engineering and Information Technology bachelor's degrees at the Faculty of Sciences, University of Lisbon: what it teaches, when it happens and how it connects to the rest.",
      compare: "Compare", compareSub: "LEI side by side with LTI",
      degreeKind: "Bachelor's",
      ects: "ECTS", semesters: "Semesters", core: "Mandatory", options: "Options", minors: "Minors",
      areasTitle: "Weight of each area in the mandatory courses (ECTS)",
      allAreas: "All",
      hint: "Hover a course to see its connections; click to open it.",
      wiresIn: "builds on", wiresOut: "leads to",
      showAll: "Show all connections",
      year: (n) => `Year ${n}`, sem: (n) => `Semester ${n}`, semShort: (n) => `Sem ${n}`,
      yearSem: (y, s) => `Year ${y} · Sem ${s}`,
      slotOption: "Option", slotMinor: "Minor",
      slotOptionName: "Electives, see options below",
      slotMinorName: "Courses from the chosen Minor, see below",
      optionsTitle: "Options",
      optionsLead: "Electives chosen within each group. The credits shown are what you need to complete in that group.",
      minorsTitle: "Minors",
      minorsLead: "In the third year of LTI students choose a 30 ECTS Minor: 18 in the first semester and 12 in the second.",
      choose: (n) => `choose ${n} ECTS`,
      both: "LEI + LTI",
      kind: { core: "Mandatory", option: "Option", minor: "Minor" },
      links: "Connections", buildsOn: "Builds on", leadsTo: "Leads to", twinIn: (d) => `Counterpart in ${d}`,
      noBuilds: "Doesn't depend on other courses in the plan.", noLeads: "No course in the plan builds directly on this one.",
      objectives: "Objectives", program: "Syllabus", assessment: "Assessment", biblio: "Bibliography",
      main: "Main", secondary: "Secondary",
      staff: "Teaching staff", lead: "lead",
      openEdition: "Course page on Fenix", openPlan: (d) => `${d} study plan entry`,
      hours: (t, c) => (c ? `${t} h · ${c} h contact` : `${t} h workload`),
      noText: "Fenix has no text for this section.",
      noSummary: "Fenix doesn't have a description for this course yet.",
      editorial: (e) => `The summary, topics and connections are an editorial reading of the syllabi. Objectives, syllabus, assessment and staff come from Fenix (${e}).`,
      close: "Close",
      noResults: (q) => `Nothing found for “${q}”. Try a topic (e.g. SQL, Java, networks) or a lecturer.`,
      teaches: "Lecturer",
      compareTitle: "Two degrees, one shared core",
      compareLead: "The two degrees share several courses outright, and many more have a direct counterpart. LEI leans further into maths, physics and theory. LTI trades those for the web, visualisation and a Minor in a complementary field.",
      pairsTitle: "Course by course",
      same: "same course", twin: "counterpart", sameMinor: "Minor course in LTI",
      onlyIn: (d) => `Only in ${d}`,
      footer1: "<strong>Independent project</strong>, not affiliated with the Faculty of Sciences of the University of Lisbon. Always check the official information on Fenix before making decisions.",
      footer2: (d) => `Public data from Fenix (fenix.ciencias.ulisboa.pt): the 2026/2027 study plans and the latest edition of each course, collected on ${d}.`,
      footer3: "Summaries and connections between courses were written from the syllabi and are not official prerequisites.",
      skillsTab: "Skills", skillsSub: "What you'll be able to do",
      skillsEyebrow: (d) => `${d} · skills by course`,
      skillsTitle: "What you'll be able to do, semester by semester",
      skillsLead: "For each course, the concrete skills a student should leave with. The lines show which courses each one builds on. Hover a course to see the whole path that leads to it and everything it unlocks.",
      skillsHint: "Hover a course to see its full path; click its name to open it.",
      pathIn: "path to here", pathOut: "what it unlocks",
      needs: "Builds on",
      noSkills: "Fenix doesn't describe this course yet.",
      skillsNote: "Skills written from the objectives and syllabi published on Fenix.",
      skillWord: "Skill",
      calTab: "Timetable", calSub: "Classes and exams",
      calEyebrow: (d, y) => `${d} · timetable and exams ${y}`,
      calTitle: "When and where classes and exams happen",
      calLead: "Pick a course to see its weekly shifts and the date, time and room of each exam. With no course picked, see the full week of a class group and the semester's exam calendar.",
      calList: "Courses this semester",
      exams: "Exams",
      epoca: { 1: "1st exam period", 2: "2nd exam period", esp: "Special period" },
      room: "Room", rooms: "Rooms", roomTbd: "Room not announced yet",
      inDays: (n) => (n < 0 ? "done" : n === 0 ? "today" : n === 1 ? "tomorrow" : `in ${n} days`),
      noExams: "This course isn't in the Fenix exam calendar. It may be assessed continuously or by project: see the assessment method in the course details.",
      weekTitle: "Weekly timetable", weekOf: (x) => `Week for class group ${x}`,
      turma: "Class group", allTurmas: "All class groups",
      turmaNone: (x) => `Class group ${x} has no shifts in this course, so all of them are shown.`,
      turmaWhat: "Class groups (e.g. 1LEI01) are Fenix's timetable groups. The first digit is the year.",
      pickTurma: "Pick a class group to see its full week, with classes from every course.",
      noShifts: "Fenix has no timetable for this course. This mostly happens with Minor courses taught at other faculties.",
      shiftType: { T: "Lecture", TP: "Lecture-practical", PL: "Lab", P: "Practical", S: "Seminar", O: "Tutorial", OT: "Tutorial" },
      shiftsList: (n) => `All shifts (${n})`,
      shiftCol: "Shift", whenCol: "Day, time and room", turmasCol: "Class groups",
      otherDegrees: (n) => `+${n} from other degrees`,
      openCourse: "Course details", fenixShifts: "Shifts on Fenix", calLink: "Timetable and exams",
      backOverview: "Semester overview",
      examCal: "Exam calendar",
      examCalLead: (s) => `Every exam for the courses in ${s.toLowerCase()}. Click a course to see the details.`,
      examCalTurma: (x) => `Exams for the courses class group ${x} takes. Click a course to see the details.`,
      noExamsPeriod: "No exams in this period.",
      days: ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      kindShort: { option: "option", minor: "minor" },
      calNote: (y) => `Shifts and exams as published on Fenix for ${y}. They can change during the year: always check Fenix.`,
    },
  };

  /* ---------------------------------------------------------------- state */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
  };
  const state = {
    lang: store.get("lang") || ((navigator.language || "pt").toLowerCase().startsWith("pt") ? "pt" : "en"),
    view: "lei",
    lastDegree: "lei",
    hover: null,
    open: null,
    area: null,
    showAll: store.get("showAll") === "1",
    calSem: (() => { const m = new Date().getMonth() + 1; return m >= 2 && m <= 7 ? 2 : 1; })(),
    calCourse: null,
    turma: store.get("turma") || "",
    epoca: "1",
  };
  const t = (k, ...a) => { const v = T[state.lang][k]; return typeof v === "function" ? v(...a) : v; };
  const L = (o) => (o ? o[state.lang] || o.pt || "" : "");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtN = (n) => (Number.isInteger(n) ? String(n) : String(n).replace(".", state.lang === "pt" ? "," : "."));

  /* ---------------------------------------------------------------- data */
  const courses = D.courses;
  const all = Object.values(courses);
  const leadsTo = {};
  all.forEach((c) => c.after.forEach((a) => (leadsTo[a] = leadsTo[a] || []).push(c.id)));
  const offering = (c, deg) => c.offerings.find((o) => o.degree === deg);
  const inDegree = (deg, kind) => all.filter((c) => c.offerings.some((o) => o.degree === deg && (!kind || o.kind === kind)));
  const hueStyle = (c) => `--h:${HUES[c.area] ?? 260}`;
  const neutralCls = (c) => (NEUTRAL.has(c.area) ? " neutral" : "");
  const sortBySlot = (deg) => (a, b) => {
    const oa = offering(a, deg), ob = offering(b, deg);
    return oa.year - ob.year || oa.sem - ob.sem || L(a.name).localeCompare(L(b.name), state.lang);
  };

  /* -------------------------------------------------------------- tiles */
  function tile(c, deg, opts = {}) {
    const o = deg ? offering(c, deg) : c.offerings[0];
    const shared = new Set(c.offerings.map((x) => x.degree)).size > 1;
    const flags = [];
    if (opts.when && o) flags.push(t("yearSem", o.year, o.sem));
    if (opts.semFlag && o) flags.push(t("semShort", o.sem));
    if (shared && opts.shared !== false) flags.push(t("both"));
    return `<button class="tile${neutralCls(c)}" type="button" data-id="${c.id}" style="${hueStyle(c)}">
      <span class="tile-top"><span class="tile-acr">${esc(c.acr)}</span><span class="tile-ects">${fmtN(c.ects)} ECTS</span></span>
      <span class="tile-name">${esc(L(c.name))}</span>
      ${flags.length ? `<span class="tile-flags">${flags.map((f) => `<span class="flag">${esc(f)}</span>`).join("")}</span>` : ""}
    </button>`;
  }

  function mini(c, note) {
    return `<button class="mini${neutralCls(c)}" type="button" data-id="${c.id}" style="${hueStyle(c)}">
      <span class="mono">${esc(c.acr)}</span><span>${esc(L(c.name))}</span>${note ? `<small>${esc(note)}</small>` : ""}
    </button>`;
  }

  /* --------------------------------------------------------------- views */
  function header() {
    const tabs = DEGREES.map((d) => {
      const deg = D.degrees[d];
      return `<a class="dtab" href="#${d.toLowerCase()}" ${state.view === d.toLowerCase() ? 'aria-current="page"' : ""}>
        <span class="dtab-code">${d}</span><span class="dtab-sub">${esc(L(deg.short))}</span></a>`;
    }).join("") + `<a class="dtab lens" href="#skills-${state.lastDegree}" ${state.view.startsWith("skills") ? 'aria-current="page"' : ""}>
        <span class="dtab-code">${esc(t("skillsTab"))}</span><span class="dtab-sub">${esc(t("skillsSub"))}</span></a>
      <a class="dtab lens" href="#cal-${state.lastDegree}" ${state.view.startsWith("cal") ? 'aria-current="page"' : ""}>
        <span class="dtab-code">${esc(t("calTab"))}</span><span class="dtab-sub">${esc(t("calSub"))}</span></a>`;
    return `<section class="intro">
      <div>
        <p class="eyebrow">${esc(t("eyebrow", D.degrees.LEI.planYear))}</p>
        <h1>${t("headline")}</h1>
        <p>${esc(t("tagline"))}</p>
      </div>
      <nav class="degree-tabs" aria-label="Degree">${tabs}
        <a class="dtab lens" href="#compare" ${state.view === "compare" ? 'aria-current="page"' : ""}><span class="dtab-code">${esc(t("compare"))}</span><span class="dtab-sub">${esc(t("compareSub"))}</span></a>
      </nav>
    </section>`;
  }

  function areaTotals(deg) {
    const tot = {};
    inDegree(deg, "core").forEach((c) => (tot[c.area] = (tot[c.area] || 0) + c.ects));
    return Object.entries(tot).sort((a, b) => b[1] - a[1]);
  }

  function areasBar(deg, withLegend) {
    const totals = areaTotals(deg);
    const bar = `<div class="areas-bar" role="img" aria-label="${esc(t("areasTitle"))}">${totals
      .map(([a, v]) => `<span style="--h:${HUES[a]};flex:${v}" title="${esc(L(D.areas[a]))}: ${fmtN(v)} ECTS"></span>`).join("")}</div>`;
    if (!withLegend) return bar;
    const chips = totals.map(([a, v]) => `<button class="area-chip" type="button" data-area="${a}" style="--h:${HUES[a]}" aria-pressed="${state.area === a}">
      <span class="sw"></span>${esc(L(D.areas[a]))} <b>${fmtN(v)}</b></button>`).join("");
    return `<div class="areas-block"><p class="eyebrow" style="margin:0 0 8px">${esc(t("areasTitle"))}</p>${bar}<div class="areas-legend">${chips}</div></div>`;
  }

  function degreeView(deg) {
    const d = D.degrees[deg];
    const core = inDegree(deg, "core");
    const opts = inDegree(deg, "option");
    const mins = inDegree(deg, "minor");
    const hasMinors = d.minors.length > 0;

    // semester columns
    let years = "", cols = "";
    for (let y = 1; y <= 3; y++) {
      years += `<div class="year-label span2">${esc(t("year", y))}</div>`;
      for (let s = 1; s <= 2; s++) {
        const list = core.filter((c) => { const o = offering(c, deg); return o.year === y && o.sem === s; })
          .sort((a, b) => L(a.name).localeCompare(L(b.name), state.lang));
        const sum = list.reduce((n, c) => n + c.ects, 0);
        const free = 30 - sum;
        let slot = "";
        if (free > 0) {
          const isMinor = hasMinors && y === 3;
          slot = `<button class="tile slot" type="button" data-jump="${isMinor ? "minors" : "options"}">
            <span class="tile-top"><span class="tile-acr">${esc(isMinor ? t("slotMinor") : t("slotOption"))}</span><span class="tile-ects">${fmtN(free)} ECTS</span></span>
            <span class="tile-name">${esc(isMinor ? t("slotMinorName") : t("slotOptionName"))}</span></button>`;
        }
        cols += `<div class="sem-col">
          <div class="sem-head"><strong data-year="${esc(t("year", y))}">${esc(t("sem", s))}</strong><span class="mono">30 ECTS</span></div>
          <div class="tiles">${list.map((c) => tile(c, deg)).join("")}${slot}</div>
        </div>`;
      }
    }

    // option groups
    const groups = d.groups.map((g) => {
      const list = opts.filter((c) => offering(c, deg).group?.id === g.id).sort(sortBySlot(deg));
      if (!list.length) return "";
      return `<div class="group"><div class="group-title">${esc(L(g))}<span class="muted">${esc(t("year", g.year))}${g.credits ? " · " + esc(t("choose", fmtN(g.credits))) : ""}</span></div>
        <div class="tile-grid">${list.map((c) => tile(c, deg, { semFlag: true })).join("")}</div></div>`;
    }).join("");

    const minors = d.minors.map((m) => {
      const list = mins.filter((c) => c.offerings.some((o) => o.degree === deg && o.group?.id === m.id));
      const bySem = [1, 2].map((s) => {
        const l = list.filter((c) => c.offerings.find((o) => o.degree === deg && o.group?.id === m.id).sem === s)
          .sort((a, b) => L(a.name).localeCompare(L(b.name), state.lang));
        return l.length ? `<div class="minor-sem"><span>${esc(t("sem", s))}</span><div class="tile-grid">${l.map((c) => tile(c, deg, { shared: false })).join("")}</div></div>` : "";
      }).join("");
      return `<article class="minor"><h3>${esc(L(m))}</h3>${bySem}</article>`;
    }).join("");

    return `${header()}
      <section class="deg-head">
        <div>
          <p class="eyebrow">${esc(t("degreeKind"))} · ${esc(d.dges)} · ${esc(d.planYear)}</p>
          <h2>${esc(L(d.title))}</h2>
          <p>${esc(L(d.intro))}</p>
        </div>
        <dl class="facts">
          <div><dt>${t("ects")}</dt><dd>${d.ects}</dd></div>
          <div><dt>${t("semesters")}</dt><dd>6</dd></div>
          <div><dt>${t("core")}</dt><dd>${core.length}</dd></div>
          <div><dt>${hasMinors ? t("minors") : t("options")}</dt><dd>${hasMinors ? d.minors.length : opts.length}</dd></div>
        </dl>
      </section>
      ${areasBar(deg, true)}
      <div class="map-tools">
        <span class="map-hint">${esc(t("hint"))}</span>
        <span class="legend-wires"><span><i></i>${esc(t("wiresIn"))}</span><span><i class="out"></i>${esc(t("wiresOut"))}</span></span>
        <label class="toggle"><input id="show-all" type="checkbox" ${state.showAll ? "checked" : ""}>${esc(t("showAll"))}</label>
      </div>
      <div class="map-scroll"><div class="plan" id="plan" data-degree="${deg}">
        <svg class="plan-wires" aria-hidden="true"></svg>
        ${years}${cols}
      </div></div>
      ${groups ? `<section class="section" id="options"><div class="section-head"><div><h2>${esc(t("optionsTitle"))}</h2><p>${esc(t("optionsLead"))}</p></div></div>${groups}</section>` : ""}
      ${minors ? `<section class="section" id="minors"><div class="section-head"><div><h2>${esc(t("minorsTitle"))}</h2><p>${esc(t("minorsLead"))}</p></div></div><div class="minors">${minors}</div></section>` : ""}`;
  }

  function compareView() {
    const lei = inDegree("LEI", "core").sort(sortBySlot("LEI"));
    const ltiCore = inDegree("LTI", "core");
    const usedLti = new Set();
    const rows = [];
    lei.forEach((c) => {
      const o = offering(c, "LTI");
      if (o) { usedLti.add(c.id); rows.push([c, c, o.kind === "core" ? "same" : "sameMinor"]); return; }
      const tw = c.twin && courses[c.twin];
      if (tw && offering(tw, "LTI")?.kind === "core") { usedLti.add(tw.id); rows.push([c, tw, "twin"]); }
    });
    const onlyLei = lei.filter((c) => !rows.some((r) => r[0] === c));
    const onlyLti = ltiCore.filter((c) => !usedLti.has(c.id)).sort(sortBySlot("LTI"));

    const pairRows = rows.map(([a, b, rel]) => `<div class="pair">
      ${tile(a, "LEI", { when: true, shared: false })}
      <div class="pair-rel ${rel === "same" ? "same" : ""}"><span>${esc(t(rel))}</span></div>
      ${tile(b, "LTI", { when: true, shared: false })}
    </div>`).join("");

    return `${header()}
      <section class="deg-head"><div><h2>${esc(t("compareTitle"))}</h2><p>${esc(t("compareLead"))}</p></div></section>
      <div class="compare-bars">
        ${DEGREES.map((d) => `<div class="row"><b>${d}</b>${areasBar(d, false)}</div>`).join("")}
        <div class="areas-legend">${Object.keys(HUES).filter((a) => !NEUTRAL.has(a)).map((a) => `<span class="area-chip" style="--h:${HUES[a]};cursor:default"><span class="sw"></span>${esc(L(D.areas[a]))}</span>`).join("")}</div>
      </div>
      <section class="section" style="margin-top:20px">
        <div class="section-head"><h2>${esc(t("pairsTitle"))}</h2></div>
        <div class="pairs">
          <div class="pair"><div class="pair-head">LEI</div><div class="pair-head"></div><div class="pair-head">LTI</div></div>
          ${pairRows}
        </div>
      </section>
      <section class="section only-cols">
        <div><div class="section-head"><h2>${esc(t("onlyIn", "LEI"))}</h2></div><div class="tile-grid">${onlyLei.map((c) => tile(c, "LEI", { when: true })).join("")}</div></div>
        <div><div class="section-head"><h2>${esc(t("onlyIn", "LTI"))}</h2></div><div class="tile-grid">${onlyLti.map((c) => tile(c, "LTI", { when: true })).join("")}</div></div>
      </section>`;
  }

  /* --------------------------------------------------------- skills view */
  function skillCard(c, deg) {
    const needs = c.after.map((id) => courses[id]).filter(Boolean);
    const skills = L(c.skills);
    return `<article class="skill-card${neutralCls(c)}" data-card="${c.id}" style="${hueStyle(c)}">
      <button class="sc-head" type="button" data-open="${c.id}">
        <span class="sc-top"><span class="tile-acr">${esc(c.acr)}</span><span class="tile-ects">${fmtN(c.ects)} ECTS</span></span>
        <span class="sc-name">${esc(L(c.name))}</span>
      </button>
      ${skills.length ? `<ul class="sc-skills">${skills.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>` : `<p class="sc-empty">${esc(t("noSkills"))}</p>`}
      ${needs.length ? `<div class="sc-needs"><span>${esc(t("needs"))}</span>${needs.map((n) => `<button type="button" class="sc-need${neutralCls(n)}" data-open="${n.id}" style="${hueStyle(n)}" title="${esc(L(n.name))}">${esc(n.acr)}</button>`).join("")}</div>` : ""}
    </article>`;
  }

  function skillsView(deg) {
    const d = D.degrees[deg];
    const core = inDegree(deg, "core");
    const hasMinors = d.minors.length > 0;
    let rows = "";
    for (let y = 1; y <= 3; y++) {
      for (let s = 1; s <= 2; s++) {
        const list = core.filter((c) => { const o = offering(c, deg); return o.year === y && o.sem === s; })
          .sort((a, b) => a.after.length - b.after.length || L(a.name).localeCompare(L(b.name), state.lang));
        const free = 30 - list.reduce((n, c) => n + c.ects, 0);
        const isMinor = hasMinors && y === 3;
        const slot = free > 0 ? `<button class="tile slot sc-slot" type="button" data-jump="${isMinor ? "minors" : "options"}">
            <span class="tile-top"><span class="tile-acr">${esc(isMinor ? t("slotMinor") : t("slotOption"))}</span><span class="tile-ects">${fmtN(free)} ECTS</span></span>
            <span class="tile-name">${esc(isMinor ? t("slotMinorName") : t("slotOptionName"))}</span></button>` : "";
        rows += `<section class="tree-row">
          <div class="tree-when"><span class="eyebrow">${esc(t("year", y))}</span><strong>${esc(t("sem", s))}</strong></div>
          <div class="tree-cards">${list.map((c) => skillCard(c, deg)).join("")}${slot}</div>
        </section>`;
      }
    }
    const opts = inDegree(deg, "option");
    const groups = d.groups.map((g) => {
      const list = opts.filter((c) => offering(c, deg).group?.id === g.id).sort(sortBySlot(deg));
      return list.length ? `<div class="group"><div class="group-title">${esc(L(g))}<span class="muted">${esc(t("year", g.year))}${g.credits ? " · " + esc(t("choose", fmtN(g.credits))) : ""}</span></div>
        <div class="skill-grid">${list.map((c) => skillCard(c, deg)).join("")}</div></div>` : "";
    }).join("");
    const mins = inDegree(deg, "minor");
    const minors = d.minors.map((m) => {
      const list = mins.filter((c) => c.offerings.some((o) => o.degree === deg && o.group?.id === m.id))
        .sort((a, b) => a.offerings.find((o) => o.degree === deg && o.group?.id === m.id).sem - b.offerings.find((o) => o.degree === deg && o.group?.id === m.id).sem || L(a.name).localeCompare(L(b.name), state.lang));
      return `<div class="group"><div class="group-title">${esc(L(m))}<span class="muted">30 ECTS</span></div><div class="skill-grid">${list.map((c) => skillCard(c, deg)).join("")}</div></div>`;
    }).join("");
    const seg = DEGREES.map((x) => `<a href="#skills-${x.toLowerCase()}" class="seg-btn" ${x === deg ? 'aria-current="page"' : ""}>${x}</a>`).join("");
    return `${header()}
      <section class="deg-head">
        <div>
          <p class="eyebrow">${esc(t("skillsEyebrow", L(d.title)))}</p>
          <h2>${esc(t("skillsTitle"))}</h2>
          <p>${esc(t("skillsLead"))}</p>
        </div>
        <nav class="seg" aria-label="Degree">${seg}</nav>
      </section>
      <div class="map-tools">
        <span class="map-hint">${esc(t("skillsHint"))}</span>
        <span class="legend-wires"><span><i></i>${esc(t("pathIn"))}</span><span><i class="out"></i>${esc(t("pathOut"))}</span></span>
        <label class="toggle"><input id="show-all" type="checkbox" ${state.showAll ? "checked" : ""}>${esc(t("showAll"))}</label>
      </div>
      <div class="tree" id="tree"><svg class="tree-wires" aria-hidden="true"></svg>${rows}</div>
      ${groups ? `<section class="section" id="options"><div class="section-head"><div><h2>${esc(t("optionsTitle"))}</h2><p>${esc(t("optionsLead"))}</p></div></div>${groups}</section>` : ""}
      ${minors ? `<section class="section" id="minors"><div class="section-head"><div><h2>${esc(t("minorsTitle"))}</h2><p>${esc(t("minorsLead"))}</p></div></div>${minors}</section>` : ""}
      <p class="source-note" style="margin-top:32px">${esc(t("skillsNote"))}</p>`;
  }

  /* ------------------------------------------------------- calendar view */
  const DAY0 = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
  const dateOf = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const fmtDate = (s, o) => dateOf(s).toLocaleDateString(state.lang === "pt" ? "pt-PT" : "en-GB", o);
  const toMin = (s) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
  const turmaRe = (deg) => new RegExp(`^\\d${deg}`, "i");
  const calDeg = () => state.view.slice(4).toUpperCase();
  const currentHash = () => (state.view.startsWith("cal-") && state.calCourse ? `${state.view}-${state.calCourse}` : state.view);

  function calGroups(deg, sem) {
    const byName = (a, b) => L(a.name).localeCompare(L(b.name), state.lang);
    const rows = all.map((c) => ({ c, o: c.offerings.find((o) => o.degree === deg && o.sem === sem) })).filter((x) => x.o);
    const groups = [];
    for (let y = 1; y <= 3; y++) {
      const items = rows.filter((x) => x.o.kind === "core" && x.o.year === y).map((x) => x.c).sort(byName);
      if (items.length) groups.push({ title: t("year", y), items });
    }
    for (const kind of ["option", "minor"]) {
      const items = rows.filter((x) => x.o.kind === kind).map((x) => x.c).sort(byName);
      if (items.length) groups.push({ title: t(kind === "option" ? "optionsTitle" : "minorsTitle"), items });
    }
    return groups;
  }

  function calItem(c) {
    const ex = c.exams.find((e) => e.epoca === "1") || c.exams[0];
    const meta = ex ? fmtDate(ex.date, { day: "numeric", month: "short" }) : "—";
    return `<button type="button" class="cal-item hued${neutralCls(c)}" data-cal="${c.id}" style="${hueStyle(c)}" aria-pressed="${state.calCourse === c.id}">
      <span class="tile-acr">${esc(c.acr)}</span><span class="ci-name">${esc(L(c.name))}</span>
      <span class="ci-meta" ${ex ? `title="${esc(t("epoca")[ex.epoca])}"` : ""}>${esc(meta)}</span></button>`;
  }

  function turmaSelect(list, sel) {
    if (!list.length) return "";
    const years = [...new Set(list.map((x) => x[0]))];
    const opts = years.map((y) => `<optgroup label="${esc(t("year", y))}">${list.filter((x) => x[0] === y)
      .map((x) => `<option value="${esc(x)}" ${x === sel ? "selected" : ""}>${esc(x)}</option>`).join("")}</optgroup>`).join("");
    return `<label class="turma-pick"><span>${esc(t("turma"))}</span><select id="turma-select"><option value="">${esc(t("allTurmas"))}</option>${opts}</select></label>`;
  }

  /* weekly grid: events {day, start, end, room, label, sub, type, course, key, cal?, title?}.
     Overlapping blocks on the same day are laid out side by side in lanes. */
  function weekGrid(events) {
    const lo = Math.min(8 * 60, ...events.map((e) => toMin(e.start)));
    const hi = Math.max(18 * 60, ...events.map((e) => toMin(e.end)));
    const start = Math.floor(lo / 60) * 60, end = Math.ceil(hi / 60) * 60, span = end - start;
    const days = Math.max(5, ...events.map((e) => e.day));
    const heads = [];
    const cols = [];
    for (let d = 1; d <= days; d++) {
      heads.push(`<div class="wk-dh">${esc(t("days")[d])}</div>`);
      const evs = events.filter((e) => e.day === d).sort((a, b) => toMin(a.start) - toMin(b.start) || toMin(b.end) - toMin(a.end));
      const placed = [];
      let cluster = [], clusterEnd = -1;
      const flush = () => { const n = Math.max(...cluster.map((x) => x.lane)) + 1; cluster.forEach((x) => (x.lanes = n)); cluster = []; };
      for (const e of evs) {
        const s0 = toMin(e.start);
        if (cluster.length && s0 >= clusterEnd) { flush(); clusterEnd = -1; }
        const used = new Set(cluster.filter((x) => toMin(x.end) > s0).map((x) => x.lane));
        let lane = 0;
        while (used.has(lane)) lane++;
        const p = { ...e, lane };
        cluster.push(p); placed.push(p);
        clusterEnd = Math.max(clusterEnd, toMin(e.end));
      }
      if (cluster.length) flush();
      cols.push(`<div class="wk-col">${placed.map((p) => {
        const top = ((toMin(p.start) - start) / span) * 100, h = ((toMin(p.end) - toMin(p.start)) / span) * 100, w = 100 / p.lanes;
        const tag = p.cal ? "button" : "div";
        const title = `${p.title || p.label} · ${t("days")[p.day]} ${p.start}–${p.end}${p.room ? " · " + p.room : ""}`;
        return `<${tag} ${p.cal ? `type="button" data-cal="${p.cal}"` : 'tabindex="0"'} class="wk-ev hued ty-${esc(p.type)}${neutralCls(p.course)}" data-shift="${esc(p.key)}"
          style="${hueStyle(p.course)};top:${top}%;height:${h}%;left:${p.lane * w}%;width:${w}%" title="${esc(title)}">
          <b>${esc(p.label)}</b><span>${esc(p.sub)}</span><span class="wk-time">${p.start}–${p.end}</span></${tag}>`;
      }).join("")}</div>`);
    }
    const hours = [];
    for (let m = start; m < end; m += 60) hours.push(`<span style="top:${((m - start) / span) * 100}%">${String(m / 60).padStart(2, "0")}:00</span>`);
    const types = [...new Set(events.map((e) => e.type))];
    const key = `<div class="wk-key">${types.map((x) => `<span class="ty-${esc(x)}"><i></i>${esc(t("shiftType")[x] || x)}</span>`).join("")}</div>`;
    return `${key}<div class="wk-scroll"><div class="wk" style="--days:${days};--hours:${span / 60}">
      <div class="wk-dh"></div>${heads.join("")}
      <div class="wk-times">${hours.join("")}</div>${cols.join("")}
    </div></div>`;
  }

  function examCard(e) {
    const days = Math.round((dateOf(e.date) - DAY0) / 864e5);
    const rooms = e.rooms.length ? `${t(e.rooms.length > 1 ? "rooms" : "room")} ${e.rooms.join(", ")}` : t("roomTbd");
    return `<div class="exam-card${days < 0 ? " past" : ""}">
      <span class="ec-epoca">${esc(t("epoca")[e.epoca] || e.epoca)}</span>
      <span class="ec-date"><b>${dateOf(e.date).getDate()}</b><span>${esc(fmtDate(e.date, { month: "short", year: "numeric" }))}</span></span>
      <span class="ec-when">${esc(fmtDate(e.date, { weekday: "long" }))} · ${e.start}–${e.end}</span>
      <span class="ec-rooms">${esc(rooms)}</span>
      <span class="ec-in">${esc(t("inDays", days))}</span>
    </div>`;
  }

  function calCourseView(c, deg) {
    const o = c.offerings.find((x) => x.degree === deg) || c.offerings[0];
    const re = turmaRe(deg);
    const own = c.shifts.filter((s) => !s.turmas.length || s.turmas.some((x) => re.test(x)));
    const base = own.length ? own : c.shifts;
    const turmas = [...new Set(base.flatMap((s) => s.turmas).filter((x) => re.test(x)))].sort();
    const tsel = turmas.includes(state.turma) ? state.turma : "";
    const shown = tsel ? base.filter((s) => s.turmas.includes(tsel)) : base;
    const events = shown.flatMap((s) => s.slots.map((sl) => ({ ...sl, key: s.id, type: s.type, label: s.id, sub: sl.room, course: c, title: `${s.id} (${t("shiftType")[s.type] || s.type})` })));
    const kind = o.kind !== "core" ? ` · ${t("kind")[o.kind]}` : "";
    const rows = base.map((s) => {
      const tm = s.turmas.filter((x) => re.test(x)), other = s.turmas.length - tm.length;
      return `<tr data-shift="${esc(s.id)}" class="${tsel && !s.turmas.includes(tsel) ? "dim" : ""}">
        <td><b class="mono">${esc(s.id)}</b><small>${esc(t("shiftType")[s.type] || s.type)}</small></td>
        <td>${s.slots.map((sl) => `${esc(t("days")[sl.day])} ${sl.start}–${sl.end} <span class="muted">· ${esc(sl.room)}</span>`).join("<br>")}</td>
        <td>${esc(tm.join(", "))}${other ? ` <small>${esc(t("otherDegrees", other))}</small>` : ""}</td></tr>`;
    }).join("");
    const week = c.shifts.length ? `
        ${state.turma && !tsel && turmas.length ? `<p class="cal-note">${esc(t("turmaNone", state.turma))}</p>` : ""}
        ${weekGrid(events)}
        <details class="fold shifts-fold"${base.length <= 8 ? " open" : ""}><summary>${esc(t("shiftsList", base.length))}</summary>
          <div class="table-scroll"><table class="shifts"><thead><tr><th>${esc(t("shiftCol"))}</th><th>${esc(t("whenCol"))}</th><th>${esc(t("turmasCol"))}</th></tr></thead><tbody>${rows}</tbody></table></div>
        </details>` : `<p class="cal-empty">${esc(t("noShifts"))}</p>`;
    return `<div class="cd-head hued${neutralCls(c)}" style="${hueStyle(c)}">
        <button class="cd-back" type="button" data-calback>← ${esc(t("backOverview"))}</button>
        <div class="d-acr"><span>${esc(c.acr)}</span><span class="sw"></span><span>${esc(L(D.areas[c.area]))}</span></div>
        <h3>${esc(L(c.name))}</h3>
        <div class="d-meta"><span class="pill">${deg} · ${esc(t("yearSem", o.year, o.sem))}${esc(kind)}</span><span class="pill">${fmtN(c.ects)} ECTS</span></div>
        <div class="cd-actions"><button class="btn" type="button" data-open="${c.id}">${esc(t("openCourse"))}</button>
          ${c.edition?.url ? `<a class="btn" href="${esc(c.edition.url)}/turnos" target="_blank" rel="noopener">${esc(t("fenixShifts"))} ↗</a>` : ""}</div>
      </div>
      <div class="cp-block">
        <h3 class="cp-title">${esc(t("exams"))}</h3>
        ${c.exams.length ? `<div class="exam-cards">${c.exams.map(examCard).join("")}</div>` : `<p class="cal-empty">${esc(t("noExams"))}</p>`}
      </div>
      <div class="cp-block">
        <div class="cp-head"><h3 class="cp-title">${esc(t("weekTitle"))}</h3>${turmaSelect(turmas, tsel)}</div>
        ${week}
      </div>`;
  }

  function calOverview(deg, groups) {
    const list = groups.flatMap((g) => g.items);
    const re = turmaRe(deg);
    const turmas = [...new Set(list.flatMap((c) => c.shifts.flatMap((s) => s.turmas)).filter((x) => re.test(x)))].sort();
    const tsel = turmas.includes(state.turma) ? state.turma : "";
    let week = `<p class="cal-empty">${esc(t("pickTurma"))}</p>`;
    let taken = list;
    if (tsel) {
      const events = [];
      taken = [];
      list.forEach((c) => c.shifts.filter((s) => s.turmas.includes(tsel)).forEach((s, i) => {
        if (!i) taken.push(c);
        s.slots.forEach((sl) => events.push({ ...sl, key: c.id + s.id, type: s.type, label: c.acr, sub: `${s.id} · ${sl.room}`, course: c, cal: c.id, title: `${L(c.name)} · ${s.id}` }));
      }));
      week = events.length ? weekGrid(events) : week;
    }
    const ep = state.epoca;
    const items = taken.flatMap((c) => c.exams.filter((e) => e.epoca === ep).map((e) => ({ c, e })))
      .sort((a, b) => a.e.date.localeCompare(b.e.date) || a.e.start.localeCompare(b.e.start) || a.c.acr.localeCompare(b.c.acr));
    const byDate = [];
    items.forEach((x) => { const last = byDate[byDate.length - 1]; if (last && last.date === x.e.date) last.items.push(x); else byDate.push({ date: x.e.date, items: [x] }); });
    const kindOf = (c) => (c.offerings.find((o) => o.degree === deg && o.sem === state.calSem) || {}).kind;
    const agenda = byDate.length ? `<div class="agenda">${byDate.map((g) => {
      const past = dateOf(g.date) < DAY0;
      return `<div class="ag-day${past ? " past" : ""}">
        <div class="ag-date"><b>${dateOf(g.date).getDate()}</b><span>${esc(fmtDate(g.date, { month: "short" }))}</span><small>${esc(fmtDate(g.date, { weekday: "short" }))}</small></div>
        <div class="ag-items">${g.items.map(({ c, e }) => { const k = kindOf(c); return `<button type="button" class="ag-item hued${neutralCls(c)}" data-cal="${c.id}" style="${hueStyle(c)}">
          <span class="ag-time mono">${e.start}–${e.end}</span><span class="tile-acr">${esc(c.acr)}</span>
          <span class="ag-name">${esc(L(c.name))}${k && k !== "core" ? ` <small>${esc(t("kindShort")[k])}</small>` : ""}</span>
          <span class="ag-rooms mono">${esc(e.rooms.join(", "))}</span></button>`; }).join("")}</div></div>`;
    }).join("")}</div>` : `<p class="cal-empty">${esc(t("noExamsPeriod"))}</p>`;
    const epSeg = ["1", "2", "esp"].map((k) => `<button type="button" class="seg-btn" data-epoca="${k}" aria-pressed="${k === ep}">${esc(t("epoca")[k])}</button>`).join("");
    return `<div class="cp-block">
        <div class="cp-head"><div><h3 class="cp-title">${esc(tsel ? t("weekOf", tsel) : t("weekTitle"))}</h3><p>${esc(t("turmaWhat"))}</p></div>${turmaSelect(turmas, tsel)}</div>
        ${week}
      </div>
      <div class="cp-block">
        <div class="cp-head"><div><h3 class="cp-title">${esc(t("examCal"))}</h3><p>${esc(tsel ? t("examCalTurma", tsel) : t("examCalLead", t("sem", state.calSem)))}</p></div>
          <div class="seg seg-sm" role="group" aria-label="${esc(t("exams"))}">${epSeg}</div></div>
        ${agenda}
      </div>`;
  }

  function calBody(deg) {
    const groups = calGroups(deg, state.calSem);
    const c = state.calCourse && courses[state.calCourse];
    const semSeg = [1, 2].map((n) => `<button type="button" class="seg-btn" data-calsem="${n}" aria-pressed="${n === state.calSem}">${esc(t("sem", n))}</button>`).join("");
    return `<div class="cal-layout">
      <aside class="cal-side">
        <div class="seg seg-sm" role="group" aria-label="${esc(t("semesters"))}">${semSeg}</div>
        <nav class="cal-list" aria-label="${esc(t("calList"))}">${groups.map((g) => `<div class="cal-group"><p class="eyebrow">${esc(g.title)}</p>${g.items.map(calItem).join("")}</div>`).join("")}</nav>
      </aside>
      <section class="cal-panel" id="cal-panel">${c ? calCourseView(c, deg) : calOverview(deg, groups)}</section>
    </div>`;
  }

  function calView(deg) {
    const d = D.degrees[deg];
    const seg = DEGREES.map((x) => `<a href="#cal-${x.toLowerCase()}" class="seg-btn" ${x === deg ? 'aria-current="page"' : ""}>${x}</a>`).join("");
    return `${header()}
      <section class="deg-head">
        <div>
          <p class="eyebrow">${esc(t("calEyebrow", L(d.title), d.planYear))}</p>
          <h2>${esc(t("calTitle"))}</h2>
          <p>${esc(t("calLead"))}</p>
        </div>
        <nav class="seg" aria-label="Degree">${seg}</nav>
      </section>
      <div id="cal">${calBody(deg)}</div>
      <p class="source-note" style="margin-top:32px">${esc(t("calNote", d.planYear))}</p>`;
  }

  /* re-render only the calendar body, keeping list scroll and keyboard focus */
  function updateCal(scrollToPanel) {
    const box = $("#cal");
    if (!box) return;
    const a = document.activeElement;
    const refocus = a && box.contains(a)
      ? (a.dataset.cal && a.classList.contains("cal-item") ? `.cal-item[data-cal="${a.dataset.cal}"]`
        : a.dataset.calsem ? `[data-calsem="${a.dataset.calsem}"]`
        : a.dataset.epoca ? `[data-epoca="${a.dataset.epoca}"]`
        : a.id === "turma-select" ? "#turma-select" : null)
      : null;
    const ls = $(".cal-list", box)?.scrollTop || 0;
    box.innerHTML = calBody(calDeg());
    const list = $(".cal-list", box);
    if (list) list.scrollTop = ls;
    if (refocus) $(refocus, box)?.focus({ preventScroll: true });
    if (scrollToPanel) {
      const p = $("#cal-panel"), r = p.getBoundingClientRect();
      if (r.top < 64 || r.top > innerHeight * 0.7) p.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }

  function closure(id, next) {
    const seen = new Set();
    const stack = [...next(id)];
    while (stack.length) { const x = stack.pop(); if (seen.has(x)) continue; seen.add(x); stack.push(...next(x)); }
    return seen;
  }
  const ancestorsOf = (id) => closure(id, (x) => courses[x]?.after || []);
  const descendantsOf = (id) => closure(id, (x) => leadsTo[x] || []);

  function applyTreeFocus() {
    const tree = $("#tree");
    if (!tree) return;
    const id = state.hover || state.open;
    const onTree = id && tree.querySelector(`[data-card="${id}"]`);
    if (onTree) {
      const anc = ancestorsOf(id), desc = descendantsOf(id);
      tree.dataset.focus = id;
      $$("[data-card]", tree).forEach((el) => {
        const x = el.dataset.card;
        el.classList.toggle("is-on", x === id || anc.has(x) || desc.has(x));
        el.classList.toggle("is-self", x === id);
      });
    } else {
      delete tree.dataset.focus;
      $$("[data-card]", tree).forEach((el) => el.classList.remove("is-on", "is-self"));
    }
  }

  function drawTreeWires() {
    const tree = $("#tree");
    if (!tree) return;
    const svg = tree.querySelector(".tree-wires");
    if (getComputedStyle(svg).display === "none") { svg.innerHTML = ""; return; }
    const box = tree.getBoundingClientRect();
    const rect = (id) => {
      const el = tree.querySelector(`[data-card="${id}"]`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left - box.left + r.width / 2, top: r.top - box.top, bottom: r.bottom - box.top };
    };
    const id = tree.dataset.focus;
    const onTree = new Set($$("[data-card]", tree).map((el) => el.dataset.card));
    const edges = [];
    if (id) {
      const anc = ancestorsOf(id), desc = descendantsOf(id);
      const lit = new Set([id, ...anc, ...desc]);
      lit.forEach((x) => (courses[x]?.after || []).forEach((a) => {
        if (lit.has(a)) edges.push([a, x, (x === id || anc.has(x)) ? "in" : "out"]);
      }));
    } else if (state.showAll) {
      onTree.forEach((x) => courses[x].after.forEach((a) => edges.push([a, x, "all"])));
    }
    let out = "";
    edges.forEach(([from, to, cls]) => {
      if (!onTree.has(from) || !onTree.has(to)) return;
      const a = rect(from), b = rect(to);
      if (b.top <= a.bottom) return;
      const dy = Math.max(28, (b.top - a.bottom) * 0.5);
      out += `<path class="wire ${cls}" d="M${a.x} ${a.bottom} C${a.x} ${a.bottom + dy} ${b.x} ${b.top - dy} ${b.x} ${b.top}"/>`;
      if (cls !== "all") out += `<circle class="wire-dot ${cls}" cx="${b.x}" cy="${b.top}" r="3"/>`;
    });
    svg.innerHTML = out;
  }

  /* --------------------------------------------------------------- wires */
  let wireRaf = 0;
  const scheduleWires = () => { cancelAnimationFrame(wireRaf); wireRaf = requestAnimationFrame(() => { drawWires(); drawTreeWires(); }); };

  function focusSet(id) {
    return new Set([id, ...(courses[id]?.after || []), ...(leadsTo[id] || [])]);
  }

  function applyFocus() {
    applyTreeFocus();
    const plan = $("#plan");
    if (!plan) { scheduleWires(); return; }
    const id = state.hover || state.open;
    const onPlan = id && plan.querySelector(`.tile[data-id="${id}"]`);
    if (onPlan) {
      const set = focusSet(id);
      plan.dataset.focus = id;
      $$(".tile[data-id]", plan).forEach((el) => {
        el.classList.toggle("is-on", set.has(el.dataset.id));
        el.classList.toggle("is-self", el.dataset.id === id);
      });
    } else {
      delete plan.dataset.focus;
      $$(".tile", plan).forEach((el) => el.classList.remove("is-on", "is-self"));
    }
    if (state.area) {
      plan.dataset.area = state.area;
      $$(".tile[data-id]", plan).forEach((el) => el.classList.toggle("in-area", courses[el.dataset.id].area === state.area));
    } else delete plan.dataset.area;
    scheduleWires();
  }

  function drawWires() {
    const plan = $("#plan");
    if (!plan) return;
    const svg = plan.querySelector(".plan-wires");
    if (getComputedStyle(svg).display === "none") { svg.innerHTML = ""; return; }
    const box = plan.getBoundingClientRect();
    const rect = (id) => {
      const el = plan.querySelector(`.tile[data-id="${id}"]`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { l: r.left - box.left, r: r.right - box.left, y: r.top - box.top + r.height / 2 };
    };
    const id = plan.dataset.focus;
    const edges = [];
    if (id) {
      (courses[id].after || []).forEach((a) => edges.push([a, id, "in"]));
      (leadsTo[id] || []).forEach((b) => edges.push([id, b, "out"]));
    } else if (state.showAll) {
      $$(".tile[data-id]", plan).forEach((el) => courses[el.dataset.id].after.forEach((a) => edges.push([a, el.dataset.id, "all"])));
    }
    let out = "";
    edges.forEach(([from, to, cls]) => {
      const a = rect(from), b = rect(to);
      if (!a || !b) return;
      let d;
      if (b.l > a.r + 4) {
        const dx = Math.max(26, (b.l - a.r) * 0.5);
        d = `M${a.r} ${a.y} C${a.r + dx} ${a.y} ${b.l - dx} ${b.y} ${b.l} ${b.y}`;
      } else {
        const x = Math.max(a.r, b.r) + 18;
        d = `M${a.r} ${a.y} C${x} ${a.y} ${x} ${b.y} ${b.r} ${b.y}`;
      }
      out += `<path class="wire ${cls}" d="${d}"/>`;
      if (cls !== "all") out += `<circle class="wire-dot ${cls}" cx="${b.l > a.r + 4 ? b.l : b.r}" cy="${b.y}" r="3"/>`;
    });
    svg.innerHTML = out;
  }

  /* -------------------------------------------------------------- drawer */
  const drawer = $("#drawer");
  let lastFocus = null;

  function section(title, text, open) {
    const body = text ? `<p class="prose">${esc(text)}</p>` : `<p class="prose muted">${esc(t("noText"))}</p>`;
    return `<details class="fold"${open ? " open" : ""}><summary>${esc(title)}</summary>${body}</details>`;
  }

  function drawerHTML(c) {
    const other = state.lang === "pt" ? "en" : "pt";
    const pills = c.offerings.map((o) => `<span class="pill ${o.kind === "core" ? "kind-core" : ""}">${o.degree} · ${esc(t("yearSem", o.year, o.sem))} · ${esc(t("kind")[o.kind])}</span>`).join("");
    const h = c.hours || {};
    const builds = c.after.map((id) => courses[id]).filter(Boolean);
    const leads = (leadsTo[c.id] || []).map((id) => courses[id]);
    const where = (x) => x.offerings.map((o) => `${o.degree} ${o.year}.${o.sem}`).join(" · ");
    const twin = c.twin && courses[c.twin];
    const twinDeg = twin ? twin.offerings[0].degree : "";
    const biblio = c.biblio.length ? `<details class="fold"><summary>${esc(t("biblio"))}</summary><ul class="biblio">${c.biblio.map((b) => `<li>
        ${b.url ? `<a href="${esc(b.url)}" target="_blank" rel="noopener">${esc(b.title)}</a>` : `<strong>${esc(b.title)}</strong>`}
        ${b.details.length ? `<br><span>${esc(b.details.join(" · "))}</span>` : ""}
        ${b.kind === "secondary" ? ` <span class="kind">${esc(t("secondary"))}</span>` : ""}</li>`).join("")}</ul></details>` : "";
    const edition = c.edition?.label || "";
    return `<header class="d-head${neutralCls(c)}" style="${hueStyle(c)}">
        <button class="icon-btn d-close" type="button" data-close aria-label="${esc(t("close"))}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
        <div class="d-acr"><span>${esc(c.acr)}</span><span class="sw"></span><span>${esc(L(D.areas[c.area]))}</span></div>
        <h2 id="drawer-title">${esc(L(c.name))}</h2>
        ${c.name[other] && c.name[other] !== L(c.name) ? `<p class="en-name">${esc(c.name[other])}</p>` : ""}
        <div class="d-meta">${pills}<span class="pill">${fmtN(c.ects)} ECTS</span>${h.total ? `<span class="pill">${esc(t("hours", fmtN(h.total), h.contact ? fmtN(h.contact) : null))}</span>` : ""}</div>
      </header>
      <div class="d-body">
        <section>
          <p class="d-summary">${esc(L(c.summary) || t("noSummary"))}</p>
          ${L(c.topics).length ? `<div class="topics">${L(c.topics).map((x) => `<span class="topic">${esc(x)}</span>`).join("")}</div>` : ""}
        </section>
        <section class="d-sec">
          <h3>${esc(t("links"))}</h3>
          <div class="links-grid">
            <div><p class="eyebrow" style="margin:0 0 6px">${esc(t("buildsOn"))}</p>${builds.length ? `<div class="mini-list">${builds.map((x) => mini(x, where(x))).join("")}</div>` : `<p class="none">${esc(t("noBuilds"))}</p>`}</div>
            <div><p class="eyebrow" style="margin:0 0 6px">${esc(t("leadsTo"))}</p>${leads.length ? `<div class="mini-list">${leads.map((x) => mini(x, where(x))).join("")}</div>` : `<p class="none">${esc(t("noLeads"))}</p>`}</div>
          </div>
          ${twin ? `<div style="margin-top:14px"><p class="eyebrow" style="margin:0 0 6px">${esc(t("twinIn", twinDeg))}</p><div class="mini-list">${mini(twin, where(twin))}</div></div>` : ""}
        </section>
        ${section(t("objectives"), L(c.objectives), true)}
        ${section(t("program"), L(c.program), false)}
        ${section(t("assessment"), L(c.assessment), false)}
        ${biblio}
        ${c.staff.length ? `<section class="d-sec"><h3>${esc(t("staff"))}${edition ? " · " + esc(edition) : ""}</h3><ul class="staff">${c.staff.map((s) => `<li class="${s.lead ? "lead" : ""}">${esc(s.name)}${s.lead ? ` <span class="muted">(${esc(t("lead"))})</span>` : ""}</li>`).join("")}</ul></section>` : ""}
        <div class="d-actions">
          ${c.edition?.url ? `<a class="btn primary" href="${esc(c.edition.url)}" target="_blank" rel="noopener">${esc(t("openEdition"))} ↗</a>` : ""}
          ${c.shifts?.length || c.exams?.length ? `<a class="btn" href="#cal-${(c.offerings.some((o) => o.degree.toLowerCase() === state.lastDegree) ? state.lastDegree : c.offerings[0].degree.toLowerCase())}-${c.id}">${esc(t("calLink"))} →</a>` : ""}
          ${c.offerings.map((o) => `<a class="btn" href="${esc(o.fenix)}" target="_blank" rel="noopener">${esc(t("openPlan", o.degree))} ↗</a>`).join("")}
        </div>
        <p class="source-note">${esc(t("editorial", edition || "Fenix"))}</p>
      </div>`;
  }

  function openDrawer(id) {
    const c = courses[id];
    if (!c) return;
    if (!drawer.classList.contains("open")) lastFocus = document.activeElement;
    state.open = id;
    $("#drawer-body").innerHTML = drawerHTML(c);
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    $(".drawer-panel").scrollTop = 0;
    document.title = `${c.acr} · ${L(c.name)} · Mapa das Cadeiras`;
    requestAnimationFrame(() => $(".d-close")?.focus({ preventScroll: true }));
    applyFocus();
  }

  function closeDrawer(fromRoute) {
    if (!drawer.classList.contains("open")) return;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    state.open = null;
    document.title = "Mapa das Cadeiras";
    applyFocus();
    if (!fromRoute) history.replaceState(null, "", "#" + currentHash());
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }

  /* -------------------------------------------------------------- search */
  const input = $("#search");
  const results = $("#search-results");
  let hits = [], sel = -1;

  function fold(s) {
    const map = [];
    let n = "";
    for (let i = 0; i < s.length; i++) {
      const b = s[i].normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
      for (const ch of b) { n += ch; map.push(i); }
    }
    return { n, map };
  }
  const foldStr = (s) => fold(s || "").n;

  const index = all.map((c) => {
    const f = (lang) => ({
      name: foldStr(c.name[lang]),
      topics: foldStr((c.topics[lang] || []).join(" · ")),
      skills: foldStr((c.skills?.[lang] || []).join(" · ")),
      summary: foldStr(c.summary[lang]),
      body: foldStr(`${c.objectives[lang]} ${c.program[lang]}`),
    });
    return { c, acr: c.acr.toLowerCase(), pt: f("pt"), en: f("en"), staff: foldStr(c.staff.map((s) => s.name).join(" · ")) };
  });

  function highlight(text, tokens) {
    const { n, map } = fold(text);
    const marks = [];
    tokens.forEach((tk) => { let i = n.indexOf(tk); while (i !== -1) { marks.push([map[i], map[i + tk.length - 1] + 1]); i = n.indexOf(tk, i + tk.length); } });
    if (!marks.length) return esc(text);
    marks.sort((a, b) => a[0] - b[0]);
    let out = "", pos = 0;
    marks.forEach(([s, e]) => { if (s < pos) return; out += esc(text.slice(pos, s)) + "<mark>" + esc(text.slice(s, e)) + "</mark>"; pos = e; });
    return out + esc(text.slice(pos));
  }

  function snippet(text, tokens) {
    const clean = (text || "").replace(/\s+/g, " ");
    const { n, map } = fold(clean);
    let at = -1;
    for (const tk of tokens) { const i = n.indexOf(tk); if (i !== -1 && (at === -1 || i < at)) at = i; }
    if (at === -1) return "";
    const start = Math.max(0, map[at] - 50);
    const piece = (start > 0 ? "…" : "") + clean.slice(start, start + 150) + (start + 150 < clean.length ? "…" : "");
    return highlight(piece, tokens);
  }

  function runSearch(q) {
    const tokens = foldStr(q).split(/\s+/).filter((x) => x.length > 0);
    if (!tokens.length) return [];
    const lang = state.lang, alt = lang === "pt" ? "en" : "pt";
    const scored = [];
    index.forEach((e) => {
      let score = 0, where = null;
      for (const tk of tokens) {
        let best = 0, w = null;
        const F = e[lang], G = e[alt];
        if (e.acr === tk) best = 120;
        else if (e.acr.startsWith(tk) && tk.length > 1) best = 60;
        if (F.name.startsWith(tk)) best = Math.max(best, 90);
        if (new RegExp("\\b" + tk.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(F.name)) best = Math.max(best, 70);
        else if (F.name.includes(tk) || G.name.includes(tk)) best = Math.max(best, 50);
        if (best < 40 && (F.topics.includes(tk) || G.topics.includes(tk))) { best = 40; w = "topics"; }
        if (best < 35 && (F.skills.includes(tk) || G.skills.includes(tk))) { best = 35; w = "skills"; }
        if (best < 30 && (F.summary.includes(tk) || G.summary.includes(tk))) { best = 30; w = "summary"; }
        if (best < 25 && e.staff.includes(tk) && tk.length > 2) { best = 25; w = "staff"; }
        if (best < 12 && tk.length > 2 && (F.body.includes(tk) || G.body.includes(tk))) { best = 12; w = "body"; }
        if (!best) { score = 0; break; }
        score += best;
        if (!where && w) where = w;
      }
      if (score) scored.push({ c: e.c, score: score + (e.c.offerings.some((o) => o.kind === "core") ? 3 : 0), where });
    });
    return scored.sort((a, b) => b.score - a.score || L(a.c.name).localeCompare(L(b.c.name))).slice(0, 14).map((h) => ({ ...h, tokens }));
  }

  function renderResults(q) {
    hits = runSearch(q);
    sel = hits.length ? 0 : -1;
    if (!q.trim()) { results.hidden = true; input.setAttribute("aria-expanded", "false"); return; }
    results.hidden = false;
    input.setAttribute("aria-expanded", "true");
    if (!hits.length) { results.innerHTML = `<div class="sr-empty">${esc(t("noResults", q.trim()))}</div>`; return; }
    results.innerHTML = hits.map((h, i) => {
      const c = h.c;
      let snip = "";
      if (h.where === "staff") snip = `${esc(t("teaches"))}: ` + highlight(c.staff.map((s) => s.name).join(", "), h.tokens);
      else if (h.where === "skills") {
        const hit = L(c.skills).find((sk) => h.tokens.some((tk) => foldStr(sk).includes(tk))) || c.skills[state.lang === "pt" ? "en" : "pt"].find((sk) => h.tokens.some((tk) => foldStr(sk).includes(tk))) || "";
        snip = `${esc(t("skillWord"))}: ` + highlight(hit, h.tokens);
      }
      else if (h.where === "topics") snip = highlight(L(c.topics).join(" · "), h.tokens) || snippet(L(c.summary), h.tokens);
      else if (h.where === "body") snip = snippet(`${L(c.objectives)} ${L(c.program)}`, h.tokens) || snippet(`${c.objectives.pt} ${c.program.pt}`, h.tokens);
      else snip = esc(L(c.summary).slice(0, 140)) + (L(c.summary).length > 140 ? "…" : "");
      const meta = c.offerings.map((o) => `${o.degree} · ${t("yearSem", o.year, o.sem)}`).join("  ·  ");
      return `<button class="sr-item" role="option" type="button" data-id="${c.id}" aria-selected="${i === sel}" style="${hueStyle(c)}">
        <span class="sw"></span>
        <span class="sr-title">${highlight(L(c.name), h.tokens)} <span class="mono muted">${highlight(c.acr, h.tokens)}</span></span>
        <span class="sr-meta">${esc(meta)}</span>
        ${snip ? `<span class="sr-snip">${snip}</span>` : ""}
      </button>`;
    }).join("");
  }

  function moveSel(d) {
    if (!hits.length) return;
    sel = (sel + d + hits.length) % hits.length;
    $$(".sr-item", results).forEach((el, i) => el.setAttribute("aria-selected", i === sel));
    $$(".sr-item", results)[sel]?.scrollIntoView({ block: "nearest" });
  }

  function chooseResult(id) {
    results.hidden = true;
    input.setAttribute("aria-expanded", "false");
    input.blur();
    location.hash = "c-" + id;
  }

  input.addEventListener("input", () => renderResults(input.value));
  input.addEventListener("focus", () => { if (input.value.trim()) renderResults(input.value); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); moveSel(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); moveSel(-1); }
    else if (e.key === "Enter" && sel >= 0) { e.preventDefault(); chooseResult(hits[sel].c.id); }
    else if (e.key === "Escape") { input.value = ""; results.hidden = true; input.blur(); }
  });
  results.addEventListener("click", (e) => { const b = e.target.closest(".sr-item"); if (b) chooseResult(b.dataset.id); });
  document.addEventListener("click", (e) => { if (!e.target.closest(".search")) { results.hidden = true; input.setAttribute("aria-expanded", "false"); } });

  /* --------------------------------------------------------- render/route */
  function renderStatic() {
    document.documentElement.lang = state.lang === "pt" ? "pt-PT" : "en";
    $$("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
    input.placeholder = t("searchPh");
    input.setAttribute("aria-label", t("searchLabel"));
    const lb = $("#lang-toggle");
    lb.textContent = state.lang === "pt" ? "EN" : "PT";
    lb.setAttribute("aria-label", t("langLabel"));
    $("#theme-toggle").setAttribute("aria-label", t("themeLabel"));
    const date = new Date(D.scraped + "T12:00:00").toLocaleDateString(state.lang === "pt" ? "pt-PT" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
    $("#footer").innerHTML = `<div><p>${t("footer1")}</p><p>${esc(t("footer2", date))}</p><p>${esc(t("footer3"))}</p></div>
      <div><p><a href="https://fenix.ciencias.ulisboa.pt/degrees/engenharia-informatica-564500436615278" target="_blank" rel="noopener">Fenix · LEI ↗</a></p>
      <p><a href="https://fenix.ciencias.ulisboa.pt/degrees/tecnologias-de-informacao-564500436615450" target="_blank" rel="noopener">Fenix · LTI ↗</a></p></div>`;
  }

  function render() {
    renderStatic();
    app.innerHTML = state.view === "compare" ? compareView()
      : state.view.startsWith("skills-") ? skillsView(state.view.slice(7).toUpperCase())
      : state.view.startsWith("cal-") ? calView(calDeg())
      : degreeView(state.view.toUpperCase());
    applyFocus();
    if (state.open) openDrawer(state.open);
  }

  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h.startsWith("c-") && courses[h.slice(2)]) {
      const c = courses[h.slice(2)];
      if (!app.innerHTML.trim() || !app.querySelector(".intro")) {
        const first = c.offerings[0].degree.toLowerCase();
        if (state.view !== first && !c.offerings.some((o) => o.degree.toLowerCase() === state.view)) state.view = first;
        state.lastDegree = state.view.replace(/^(skills|cal)-/, "");
        render();
      }
      openDrawer(c.id);
      return;
    }
    const cal = h.match(/^cal-(lei|lti)(?:-(.+))?$/);
    if (cal) {
      let deg = cal[1];
      const id = cal[2] && courses[cal[2]] ? cal[2] : null;
      if (id && !courses[id].offerings.some((o) => o.degree.toLowerCase() === deg)) deg = courses[id].offerings[0].degree.toLowerCase();
      if (id) state.calSem = courses[id].offerings.find((o) => o.degree.toLowerCase() === deg).sem;
      const same = state.view === "cal-" + deg && app.querySelector("#cal");
      state.view = "cal-" + deg;
      state.lastDegree = deg;
      state.calCourse = id;
      closeDrawer(true);
      if (same) updateCal(!!id);
      else { render(); window.scrollTo({ top: 0 }); }
      return;
    }
    const view = ["lei", "lti", "compare", "skills-lei", "skills-lti"].includes(h) ? h : "lei";
    if (view === "lei" || view === "lti") state.lastDegree = view;
    if (view.startsWith("skills-")) state.lastDegree = view.slice(7);
    const changed = view !== state.view || !app.querySelector(".intro");
    state.view = view;
    closeDrawer(true);
    if (changed) { render(); window.scrollTo({ top: 0 }); }
  }

  /* ------------------------------------------------------------- events */
  app.addEventListener("click", (e) => {
    const jump = e.target.closest("[data-jump]");
    if (jump) { document.getElementById(jump.dataset.jump)?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    const calEl = e.target.closest("[data-cal]");
    if (calEl) { location.hash = `cal-${calDeg().toLowerCase()}-${calEl.dataset.cal}`; return; }
    if (e.target.closest("[data-calback]")) { location.hash = `cal-${calDeg().toLowerCase()}`; return; }
    const semBtn = e.target.closest("[data-calsem]");
    if (semBtn) {
      state.calSem = Number(semBtn.dataset.calsem);
      const c = state.calCourse && courses[state.calCourse];
      if (c && !c.offerings.some((o) => o.degree === calDeg() && o.sem === state.calSem)) location.hash = `cal-${calDeg().toLowerCase()}`;
      else updateCal();
      return;
    }
    const epBtn = e.target.closest("[data-epoca]");
    if (epBtn) { state.epoca = epBtn.dataset.epoca; updateCal(); return; }
    const tileEl = e.target.closest(".tile[data-id], [data-open]");
    if (tileEl) { location.hash = "c-" + (tileEl.dataset.id || tileEl.dataset.open); return; }
    const chip = e.target.closest(".area-chip[data-area]");
    if (chip) {
      state.area = state.area === chip.dataset.area ? null : chip.dataset.area;
      $$(".area-chip[data-area]").forEach((el) => el.setAttribute("aria-pressed", el.dataset.area === state.area));
      applyFocus();
    }
  });
  app.addEventListener("change", (e) => {
    if (e.target.id === "turma-select") { state.turma = e.target.value; store.set("turma", state.turma); updateCal(); return; }
    if (e.target.id === "show-all") { state.showAll = e.target.checked; store.set("showAll", state.showAll ? "1" : "0"); scheduleWires(); }
  });
  const hoverable = window.matchMedia("(hover: hover)");
  app.addEventListener("pointerover", (e) => {
    if (!hoverable.matches) return;
    const el = e.target.closest("#plan .tile[data-id], #tree [data-card]");
    const id = el ? el.dataset.id || el.dataset.card : null;
    if (id !== state.hover) { state.hover = id; applyFocus(); }
  });
  const markShift = (key) => $$("#cal-panel [data-shift]").forEach((el) => el.classList.toggle("is-hl", !!key && el.dataset.shift === key));
  app.addEventListener("pointerover", (e) => { if (state.view.startsWith("cal-")) markShift(e.target.closest("#cal-panel [data-shift]")?.dataset.shift); });
  app.addEventListener("focusin", (e) => { if (state.view.startsWith("cal-")) markShift(e.target.closest("#cal-panel [data-shift]")?.dataset.shift); });
  app.addEventListener("pointerleave", () => { if (state.hover) { state.hover = null; applyFocus(); } });
  app.addEventListener("focusin", (e) => {
    const el = e.target.closest("#plan .tile[data-id], #tree [data-card]");
    if (el) { state.hover = el.dataset.id || el.dataset.card; applyFocus(); }
  });
  app.addEventListener("focusout", (e) => {
    if (e.target.closest("#plan .tile[data-id], #tree [data-card]")) { state.hover = null; applyFocus(); }
  });

  drawer.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) { closeDrawer(); return; }
    const m = e.target.closest(".mini[data-id]");
    if (m) location.hash = "c-" + m.dataset.id;
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("open")) { closeDrawer(); return; }
    if (e.key === "/" && document.activeElement !== input && !e.target.closest("input, textarea")) { e.preventDefault(); input.focus(); }
    if (e.key === "Tab" && drawer.classList.contains("open")) {
      const f = $$("button, a[href], summary", $(".drawer-panel")).filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  $("#lang-toggle").addEventListener("click", () => {
    state.lang = state.lang === "pt" ? "en" : "pt";
    store.set("lang", state.lang);
    render();
    if (input.value.trim()) renderResults(input.value);
  });

  const root = document.documentElement;
  const savedTheme = store.get("theme");
  if (savedTheme === "light" || savedTheme === "dark") root.dataset.theme = savedTheme;
  $("#theme-toggle").addEventListener("click", () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    store.set("theme", root.dataset.theme);
  });

  window.addEventListener("hashchange", route);
  window.addEventListener("resize", scheduleWires);
  if (document.fonts?.ready) document.fonts.ready.then(scheduleWires);

  route();
})();
