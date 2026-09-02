const ORIGINAL_LESSONS = {
  1: [["Hören & Laute","👂","teal","Lautanalyse","Welcher Laut steht am Anfang von „Maus“?",["M","N","W"],0,"Sprich gedehnt: Mmm-aus. So hörst du M am Anfang.","Maus"]],
  2: [["Rechtschreibung","✏️","blue","Verlängern","Höre das Wort genau. Welche Schreibweise ist richtig?",["Hund","Hunt","Hundt","Hung"],0,"Verlängere: Hund → Hunde. Jetzt hörst du das d.","Hund"]],
  3: [["Wortfamilien","🌳","green","Wortstamm","Welches Wort gehört NICHT zur Familie „fahr“?",["Fahrt","Fahrer","Farbe"],2,"Fahrt und Fahrer sind mit fahren verwandt. Farbe nicht.","Fahrt. Fahrer. Farbe"]],
  4: [["Rechtschreibung","🧠","blue","Verlängern","Welcher Trick hilft bei „lang“?",["lang → lange","Silben klatschen","Artikel suchen"],0,"Verlängere: lang → lange. Jetzt hörst du g.","lang. lange"]]
};

const lessons = (typeof EXERCISE_BANK !== "undefined" ? EXERCISE_BANK : ORIGINAL_LESSONS);

const explain = [
  ["📘","Nomen","Nomen sind Namen für Menschen, Tiere, Pflanzen, Dinge und Begriffe. Sie werden großgeschrieben. Oft passen der, die oder das davor."],
  ["🏃","Verben","Verben sagen, was jemand tut oder was passiert. Die Grundform endet oft auf -en: laufen, spielen, schreiben."],
  ["⭐","Adjektive","Adjektive beschreiben, wie jemand oder etwas ist: groß, leise, fröhlich, kalt."],
  ["👥","Einzahl & Mehrzahl","Einzahl heißt: eines. Mehrzahl heißt: mehrere. der Hund → die Hunde."],
  ["🌳","Wortfamilien","Verwandte Wörter teilen einen Wortstamm: fahren, Fahrer, Fahrt. Das hilft beim Rechtschreiben."],
  ["🔎","Verlängern","Wenn du den Endlaut nicht sicher hörst, verlängere: Hund → Hunde, Wald → Wälder, lang → lange."],
  ["🧩","Ableiten","Suche ein verwandtes Wort: Haus → Häuser, Wald → Wälder. So kannst du Schreibungen begründen."],
  ["👏","Silben","Sprich Wörter rhythmisch in Silben. Das macht Wortteile hör- und sichtbar: kom-men, Kat-ze."],
  ["🚀","Wortsprung","Fange das gehörte Wort, lande auf der passenden Plattform und lies danach in Ruhe vor. Hören, Sehen und Bewegen helfen dem Gedächtnis."],
  ["✍️","Schreibschrift","Übe zuerst die Bewegung, dann Buchstaben, Verbindungen, Silben, Wörter und kurze Sätze. Langsam und lesbar ist wichtiger als schnell."]
];

const curriculum = {
  1: "Laute und Buchstaben unterscheiden; Wörter in Laute und Sprechsilben zerlegen; Wörter, Wortgruppen und kurze Sätze ab- und aufschreiben; erste Formveränderungen entdecken; phonologische Bewusstheit.",
  2: "Schulschrift angenäherte Buchstaben und Zeichen; erarbeiteten Wortschatz zunehmend orthografisch korrekt schreiben; einfache Zusammensetzungen zerlegen; Morpheme/Wortstämme und Wortfamilien; wichtigste Wortarten in ihrer Funktion.",
  3: "Rechtschreibstrategien ausbauen; Wortformen, Wortbildung und sprachliche Strukturen bewusster untersuchen; Rechtschreibwissen zunehmend übertragen und begründen.",
  4: "Erworbenes Regelwissen und Rechtschreibstrategien selbstständiger nutzen; von gesicherten Wörtern auf andere Wortformen schließen; Schreibungen begründen und Rechtschreibhilfen verwenden."
};

let grade = +(localStorage.wwGrade || 2), cur = null, queue = [], qi = 0;
let state = JSON.parse(localStorage.wwState || '{"stars":0,"right":0,"tries":0,"writing":0,"errors":{},"game":0}');
if (!state.game) state.game = 0;
if (!state.errors) state.errors = {};

function save() {
  localStorage.wwGrade = grade;
  localStorage.wwState = JSON.stringify(state);
  const gt = document.getElementById("gradeTag");
  const st = document.getElementById("starTag");
  if (gt) gt.textContent = grade + ". Klasse";
  if (st) st.textContent = "⭐ " + state.stars;
}

function go(id) {
  if (id !== "game" && window.Game) Game.stop(false);
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if (id === "home") renderHome();
  if (id === "learn") renderLearn();
  if (id === "adult") renderAdult();
  if (id === "curriculum") renderCurr();
  scrollTo(0, 0);
}

function openGame() {
  go("game");
  if (window.Game) Game.start();
}

function stopGame() {
  if (window.Game) Game.stop(true);
  go("home");
}

function renderHome() {
  grades.innerHTML = [1, 2, 3, 4].map(g =>
    `<button class="${g === grade ? "on" : ""}" onclick="setGrade(${g})">${g}. Klasse</button>`
  ).join("");

  modules.innerHTML = "";
  const play = document.createElement("div");
  play.className = "card play";
  play.innerHTML = `<div><div class="emoji">🚀</div><h2>Wortsprung</h2><p>Wie Doodle Jump: springe, fange Wörter und lies sie vor.</p></div><button class="primary">Spielen →</button>`;
  play.querySelector("button").onclick = openGame;
  modules.appendChild(play);

  const seen = {};
  (lessons[grade] || []).forEach(x => {
    if (seen[x[0]]) return;
    seen[x[0]] = 1;
    const d = document.createElement("div");
    d.className = "card " + x[2];
    d.innerHTML = `<div><div class="emoji">${x[1]}</div><h2>${x[0]}</h2><p>${x[3]} · kurze Übung mit Lerntrick</p></div><button>Üben →</button>`;
    d.querySelector("button").onclick = () => startCategory(x[0]);
    modules.appendChild(d);
  });

  const w = document.createElement("div");
  w.className = "card purple";
  w.innerHTML = `<div><div class="emoji">✍️</div><h2>Schreibschrift</h2><p>Buchstaben, Silben und Wörter nachspuren und frei schreiben.</p></div><button>Schreiben →</button>`;
  w.querySelector("button").onclick = () => go("write");
  modules.appendChild(w);
}

function setGrade(g) {
  grade = g;
  queue = [];
  qi = 0;
  save();
  renderHome();
}

function shuffled(items) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startCategory(topic) {
  const all = (lessons[grade] || []).filter(x => x[0] === topic);
  queue = shuffled(all);
  qi = 0;
  if (queue.length) start(queue[0]);
}

function syllabify(word) {
  if (!word) return [];
  const clean = String(word).replace(/[„“".!?]/g, " ").trim().split(/\s+/)[0];
  const w = clean.replace(/[^A-Za-zÄÖÜäöüß]/g, "");
  if (w.length <= 2) return [w];
  const clusters = "sch|ch|ck|tz|pf|ph|qu|st|sp|ei|ie|eu|äu|au|ai|ay|ey|aa|ee|oo|äh|öh|üh";
  const re = new RegExp("(" + clusters + "|[aeiouäöüy]+|[^aeiouäöüy]+)", "gi");
  const parts = w.match(re) || [w];
  const syl = [];
  let buf = "";
  parts.forEach(p => {
    buf += p;
    if (/[aeiouäöüy]/i.test(p)) {
      syl.push(buf);
      buf = "";
    }
  });
  if (buf) {
    if (syl.length) syl[syl.length - 1] += buf;
    else syl.push(buf);
  }
  return syl.length ? syl : [w];
}

function renderSyllables(el, text) {
  if (!el) return;
  const word = String(text || "").split(/[.!?]/)[0].trim().split(/\s+/).pop() || "";
  el.innerHTML = syllabify(word).map(s => `<b>${s}</b>`).join("");
}

function start(x) {
  cur = x;
  qTopic.textContent = x[0];
  strategyBadge.textContent = "Strategie: " + x[3];
  qText.textContent = x[4];
  help.textContent = "Versuche zuerst selbst. Danach bekommst du einen passenden Lerntrick.";
  renderSyllables(document.getElementById("syllableHint"), x[8] || x[4]);
  choices.innerHTML = "";
  result.className = "result hide";
  const kind = x[9] || "choice";
  if (kind === "input") {
    const inp = document.createElement("input");
    inp.id = "textAnswer";
    inp.className = "textAnswer";
    inp.autocomplete = "off";
    inp.spellcheck = false;
    inp.placeholder = "Hier schreiben …";
    const b = document.createElement("button");
    b.className = "primary";
    b.textContent = "Prüfen";
    b.onclick = () => answerInput();
    choices.append(inp, b);
    setTimeout(() => inp.focus(), 100);
  } else {
    x[5].forEach((a, i) => {
      const b = document.createElement("button");
      b.textContent = a;
      b.onclick = () => answer(i);
      choices.appendChild(b);
    });
    if (kind === "listen") setTimeout(speak, 250);
  }
  go("quiz");
}

function answerInput() {
  const inp = document.getElementById("textAnswer");
  if (!inp) return;
  state.tries++;
  const expected = (cur[10] && cur[10].answer) || cur[6];
  const got = inp.value.trim();
  if (got.toLocaleLowerCase("de-AT") === String(expected).toLocaleLowerCase("de-AT")) {
    state.right++;
    state.stars += 3;
    result.className = "result";
    result.innerHTML = `<b>⭐ Richtig geschrieben!</b><p>${cur[7]}</p><button class="primary" onclick="next()">Weiter →</button>`;
  } else {
    state.errors[cur[3]] = (state.errors[cur[3]] || 0) + 1;
    result.className = "result retry";
    result.innerHTML = `<b>Schau noch einmal genau.</b><p>${cur[7]}</p><button onclick="retryInput()">Noch einmal</button>`;
  }
  help.textContent = cur[7];
  save();
}

function retryInput() {
  const inp = document.getElementById("textAnswer");
  if (inp) { inp.value = ""; inp.focus(); }
  result.className = "result hide";
}

function answer(i) {
  state.tries++;
  document.querySelectorAll("#choices button").forEach(b => b.disabled = true);
  if (i === cur[6]) {
    state.right++;
    state.stars += 2;
    result.className = "result";
    result.innerHTML = `<b>⭐ Richtig! Gut untersucht.</b><p>${cur[7]}</p><button class="primary" onclick="next()">Weiter →</button>`;
  } else {
    state.errors[cur[3]] = (state.errors[cur[3]] || 0) + 1;
    result.className = "result retry";
    result.innerHTML = `<b>Fast. Nutze den Lerntrick:</b><p>${cur[7]}</p><button onclick="retry()">Noch einmal</button>`;
  }
  help.textContent = cur[7];
  save();
}

function retry() {
  document.querySelectorAll("#choices button").forEach(b => b.disabled = false);
  result.className = "result hide";
}

function startAdaptive() {
  const all = [...(lessons[grade] || [])];
  all.sort(() => Math.random() - 0.5);
  all.sort((a, b) => (state.errors[b[3]] || 0) - (state.errors[a[3]] || 0));
  queue = all.slice(0, 10);
  qi = 0;
  if (queue[0]) start(queue[0]);
}

function next() {
  if (queue.length && qi < queue.length - 1) {
    qi++;
    start(queue[qi]);
    return;
  }
  const done = queue.length;
  queue = [];
  qi = 0;
  go("home");
  if (done > 1) setTimeout(() => alert("⭐ Übungsrunde geschafft! " + done + " Aufgaben bearbeitet."), 120);
}

function speakText(text, lang) {
  if (!text || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang || "de-AT";
  u.rate = 0.9;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

function speak() {
  if (!cur) return;
  speakText(cur[8] || cur[4], "de-AT");
}

function renderLearn() {
  learnGrid.innerHTML = explain.map(x =>
    `<div class="card"><div class="emoji">${x[0]}</div><h2>${x[1]}</h2><p>${x[2]}</p></div>`
  ).join("");
}

function renderCurr() {
  currGrid.innerHTML = [1, 2, 3, 4].map(g =>
    `<div class="card blue"><h2>${g}. Klasse</h2><p>${curriculum[g]}</p><button onclick="setGrade(${g});go('home')">Zu den Übungen</button></div>`
  ).join("");
}

function renderAdult() {
  const p = state.tries ? Math.round(state.right / state.tries * 100) : 0;
  adultStats.innerHTML = `
    <p><b>Klasse:</b> ${grade}</p>
    <p><b>Sterne:</b> ${state.stars}</p>
    <p><b>Aufgaben:</b> ${state.tries} · richtig: ${state.right}</p>
    <div class="meter"><i style="width:${p}%"></i></div>
    <p>${p}% der bisherigen Versuche richtig.</p>
    <p><b>Schreibübungen:</b> ${state.writing || 0}</p>
    <p><b>Wortsprung-Runden:</b> ${state.game || 0}</p>`;
  const es = Object.entries(state.errors || {}).sort((a, b) => b[1] - a[1]);
  weak.innerHTML = es.length
    ? es.map(e => `<p><b>${e[0]}</b>: ${e[1]} Lernhinweis(e)</p>`).join("")
    : "<p>Noch keine Fehlerschwerpunkte gespeichert.</p>";
}

function resetAll() {
  if (confirm("Alle lokalen Lerndaten löschen?")) {
    state = { stars: 0, right: 0, tries: 0, writing: 0, errors: {}, game: 0 };
    save();
    renderAdult();
  }
}

let trace = "m", writeLevel = "letters", ghostVisible = true;

const writeSets = {
  letters: ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","Ä","Ö","Ü","ä","ö","ü","ß"],
  joins: ["am","an","ar","au","be","bl","ch","ei","en","er","fa","fr","ge","gr","ie","in","la","le","li","ma","me","mi","na","ne","ni","sch","sp","st","tr","un"],
  syllables: ["ma","me","mi","mo","mu","la","le","li","lo","lu","sa","se","si","so","su","ba","be","bi","bo","bu","fahr","spiel","schreib","lern","freund"],
  words: ["Mama","Maus","Hund","Hase","Sonne","Schule","Blume","Wald","Hunde","Katze","Baum","Buch","fahren","spielen","schreiben","Wörter","Häuser","Freund","fröhlich","Fahrrad"],
  sentences: ["Mama liest.","Der Hund läuft.","Wir spielen.","Die Sonne scheint.","Ich schreibe schön.","Der Hase ist schnell.","Meine Schule ist groß.","Wir fahren mit dem Rad.","Der Vogel sitzt im Baum.","Heute lese ich ein Buch."]
};

function renderWriteButtons() {
  const vals = writeSets[writeLevel];
  writeBtns.innerHTML = `<div class="traceNav"><select id="traceSelect" aria-label="Schreibvorlage auswählen"></select><button type="button" onclick="stepTrace(-1)">← Vorherige</button><button type="button" onclick="stepTrace(1)">Nächste →</button></div><div class="traceChoices">${vals.map((v, i) => `<button type="button" data-trace-index="${i}">${v}</button>`).join("")}</div>`;
  const sel = document.getElementById("traceSelect");
  vals.forEach((v, i) => {
    const o = document.createElement("option");
    o.value = String(i);
    o.textContent = v;
    sel.appendChild(o);
  });
  let idx = Math.max(0, vals.indexOf(trace));
  sel.value = String(idx);
  sel.onchange = () => setTrace(vals[+sel.value]);
  writeBtns.querySelectorAll("[data-trace-index]").forEach(b => b.onclick = () => setTrace(vals[+b.dataset.traceIndex]));
  document.querySelectorAll(".writelevels button").forEach(b =>
    b.classList.toggle("active", b.textContent.toLowerCase().startsWith(({
      letters: "buch", joins: "ver", syllables: "sil", words: "wör", sentences: "sät"
    })[writeLevel]))
  );
}

function stepTrace(delta) {
  const vals = writeSets[writeLevel];
  let i = vals.indexOf(trace);
  if (i < 0) i = 0;
  i = (i + delta + vals.length) % vals.length;
  setTrace(vals[i]);
}

function setWriteLevel(l) {
  writeLevel = l;
  renderWriteButtons();
  setTrace(writeSets[l][0]);
  writeHint.textContent =
    l === "letters" ? "Achte auf Startpunkt, Richtung und Form." :
    l === "joins" ? "Beobachte, welche Buchstaben verbunden werden und wo eine natürliche Unterbrechung entsteht." :
    l === "syllables" ? "Schreibe die Silbe in einem ruhigen Bewegungsfluss." :
    l === "words" ? "Sprich das Wort zuerst und schreibe es anschließend in einem gleichmäßigen Rhythmus." :
    "Schreibe den Satz lesbar. Zwischen Wörtern bleibt ein klarer Abstand.";
}

function setTrace(s) {
  trace = s;
  ghost.textContent = s;
  clearCanvas();
  const sel = document.getElementById("traceSelect");
  if (sel) {
    const i = writeSets[writeLevel].indexOf(s);
    if (i >= 0) sel.value = String(i);
  }
  if (writeBtns) writeBtns.querySelectorAll("[data-trace-index]").forEach(b =>
    b.classList.toggle("active", writeSets[writeLevel][+b.dataset.traceIndex] === s)
  );
}

function toggleGhost() {
  ghostVisible = !ghostVisible;
  ghost.style.visibility = ghostVisible ? "visible" : "hidden";
}

function checkPrimaFont() {
  if (typeof fontStatus !== "undefined" && fontStatus) {
    fontStatus.innerHTML = "✅ <b>Primæ Cursive ist eingebettet.</b> Offline bereit.";
  }
}

function sayTrace() { speakText(trace, "de-AT"); }
function finishWriting() {
  state.writing++;
  state.stars++;
  save();
  alert("⭐ Geschafft!");
}

const c = document.getElementById("canvas");
const ctx = c.getContext("2d");
let draw = false;

function xy(e) {
  const r = c.getBoundingClientRect();
  const p = e.touches ? e.touches[0] : e;
  return [(p.clientX - r.left) * c.width / r.width, (p.clientY - r.top) * c.height / r.height];
}
function dn(e) { draw = true; const p = xy(e); ctx.beginPath(); ctx.moveTo(...p); e.preventDefault(); }
function mv(e) {
  if (!draw) return;
  ctx.lineWidth = 9; ctx.lineCap = "round"; ctx.strokeStyle = "#263746";
  ctx.lineTo(...xy(e)); ctx.stroke(); e.preventDefault();
}
function up() { draw = false; }
["mousedown", "touchstart"].forEach(n => c.addEventListener(n, dn, { passive: false }));
["mousemove", "touchmove"].forEach(n => c.addEventListener(n, mv, { passive: false }));
["mouseup", "mouseleave", "touchend"].forEach(n => c.addEventListener(n, up));
function clearCanvas() { ctx.clearRect(0, 0, c.width, c.height); }

function wordsForGrade() {
  const bank = lessons[grade] || [];
  const set = new Set();
  bank.forEach(x => {
    const raw = String(x[8] || "").split(/[.!?]/)[0];
    raw.split(/[·,;/]+|\s+/).forEach(w => {
      const t = w.replace(/[„“"']/g, "").trim();
      if (t.length >= 3 && t.length <= 12 && /[A-Za-zÄÖÜäöüß]/.test(t)) set.add(t);
    });
  });
  const fallback = writeSets.words;
  const list = [...set];
  return list.length >= 8 ? list : [...new Set([...list, ...fallback])];
}

save();
renderHome();
renderWriteButtons();
checkPrimaFont();
