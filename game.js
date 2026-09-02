const Game = (() => {
  const canvas = document.getElementById("gameCanvas");
  const overlay = document.getElementById("gameOverlay");
  const caughtList = document.getElementById("caughtList");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlayText = document.getElementById("overlayText");
  const overlayOk = document.getElementById("overlayOk");
  const hint = document.getElementById("touchHint");

  let running = false;
  let raf = 0;
  let W = 400, H = 600;
  let keys = { l: false, r: false, j: false };
  let worldY = 0;
  let score = 0;
  let lives = 3;
  let platforms = [];
  let clouds = [];
  let dog = { x: 200, y: 420, vx: 0, vy: 0, w: 46, h: 46 };
  let target = "";
  let words = [];
  let caught = [];
  let sinceRead = 0;
  let lastLand = null;
  let paused = false;
  let grounded = false;

  function resize() {
    const stage = document.getElementById("gameStage");
    const r = stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(280, Math.floor(r.width));
    H = Math.max(320, Math.floor(r.height));
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function pickWords() {
    words = (typeof wordsForGrade === "function" ? wordsForGrade() : ["Hund", "Maus", "Sonne", "Schule", "Blume", "Katze", "Baum", "Buch"]);
    if (words.length < 6) words = words.concat(["Mama", "Hase", "Wald", "Freund", "spielen", "lesen"]);
  }

  function newTarget() {
    const pool = words.filter(w => w !== target);
    target = pool[Math.floor(Math.random() * pool.length)] || words[0];
    const el = document.getElementById("targetWord");
    if (el) el.textContent = target;
    if (typeof renderSyllables === "function") renderSyllables(document.getElementById("targetSyl"), target);
    speakTarget();
  }

  function speakTarget() {
    if (typeof speakText === "function") speakText(target, "de-AT");
  }

  function makePlatform(y, forceWord) {
    const width = 92 + Math.random() * 46;
    const x = 16 + Math.random() * Math.max(20, W - width - 32);
    let word = forceWord;
    if (!word) {
      if (Math.random() < 0.28) word = target;
      else word = words[Math.floor(Math.random() * words.length)];
    }
    return { x, y, w: width, h: 22, word, used: false, kind: word === target ? "good" : "normal" };
  }

  function seedWorld() {
    platforms = [];
    clouds = [];
    worldY = 0;
    dog.x = W / 2;
    dog.y = H - 120;
    dog.vx = 0;
    dog.vy = -11;
    platforms.push({ x: W / 2 - 60, y: H - 70, w: 120, h: 22, word: "Start", used: true, kind: "start" });
    let y = H - 160;
    for (let i = 0; i < 18; i++) {
      y -= 70 + Math.random() * 28;
      platforms.push(makePlatform(y));
    }
    for (let i = 0; i < 8; i++) {
      clouds.push({ x: Math.random() * W, y: Math.random() * H * 3, s: 28 + Math.random() * 36 });
    }
  }

  function ensurePlatforms() {
    if (!platforms.length) return;
    let highest = Math.min(...platforms.map(p => p.y));
    while (highest - worldY > -80) {
      highest -= 70 + Math.random() * 30;
      platforms.push(makePlatform(highest));
      if (platforms.length > 36) platforms.shift();
    }
  }

  function landOn(p) {
    if (p === lastLand) return;
    lastLand = p;
    dog.vy = -12.4;
    grounded = true;
    if (p.kind === "start") return;
    if (p.word === target && !p.used) {
      p.used = true;
      p.kind = "caught";
      score += 1;
      state.stars += 1;
      caught.push(p.word);
      sinceRead += 1;
      save();
      updateHud();
      if (typeof speakText === "function") speakText(p.word, "de-AT");
      if (sinceRead >= 5) showReadPause();
      else newTarget();
    } else if (p.word !== target && p.kind !== "caught") {
      lives -= 1;
      updateHud();
      dog.vy = -8;
      if (lives <= 0) showGameOver();
    }
  }

  function updateHud() {
    document.getElementById("gameScore").textContent = "⭐ " + score;
    document.getElementById("gameLives").textContent = "❤️".repeat(Math.max(0, lives)) + "🤍".repeat(Math.max(0, 3 - lives));
  }

  function showReadPause() {
    paused = true;
    sinceRead = 0;
    overlay.classList.remove("hide");
    overlayTitle.textContent = "Wortkorb 🧺";
    overlayText.textContent = "Tippe jedes Wort an, hör zu und lies es leise oder laut vor.";
    caughtList.innerHTML = "";
    const unique = [...new Set(caught.slice(-8))];
    unique.forEach(w => {
      const b = document.createElement("button");
      b.textContent = w;
      b.onclick = () => {
        if (typeof speakText === "function") speakText(w, "de-AT");
        if (typeof renderSyllables === "function") renderSyllables(document.getElementById("targetSyl"), w);
      };
      caughtList.appendChild(b);
    });
    overlayOk.textContent = "Ich habe vorgelesen";
    overlayOk.onclick = () => {
      overlay.classList.add("hide");
      paused = false;
      newTarget();
      loop();
    };
  }

  function showGameOver() {
    paused = true;
    running = false;
    state.game = (state.game || 0) + 1;
    save();
    overlay.classList.remove("hide");
    overlayTitle.textContent = score >= 5 ? "Starke Runde!" : "Pause vom Springen";
    overlayText.textContent = "Du hast " + score + " Wörter gefangen. Lies sie noch einmal in Ruhe.";
    caughtList.innerHTML = "";
    [...new Set(caught)].forEach(w => {
      const b = document.createElement("button");
      b.textContent = w;
      b.onclick = () => { if (typeof speakText === "function") speakText(w, "de-AT"); };
      caughtList.appendChild(b);
    });
    overlayOk.textContent = "Nochmal spielen";
    overlayOk.onclick = () => { overlay.classList.add("hide"); start(); };
  }

  function physics() {
    if (keys.l) dog.vx -= 0.7;
    if (keys.r) dog.vx += 0.7;
    dog.vx *= 0.86;
    dog.vy += 0.38;
    dog.x += dog.vx;
    dog.y += dog.vy;
    if (dog.x < 16) dog.x = 16;
    if (dog.x > W - 16) dog.x = W - 16;

    if (dog.vy > 0) {
      for (const p of platforms) {
        const py = p.y - worldY;
        if (dog.x > p.x - 8 && dog.x < p.x + p.w + 8 &&
            dog.y + 20 > py && dog.y + 20 < py + p.h + 14 &&
            dog.y - dog.vy + 20 <= py + 4) {
          dog.y = py - 20;
          landOn(p);
        }
      }
    }

    const focus = H * 0.42;
    if (dog.y < focus) {
      const dy = focus - dog.y;
      worldY -= dy;
      dog.y = focus;
    }

    if (dog.y > H + 80) {
      lives -= 1;
      updateHud();
      dog.y = H * 0.5;
      dog.vy = -11;
      if (lives <= 0) showGameOver();
    }
    ensurePlatforms();
  }

  function draw() {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#7ec8f5");
    sky.addColorStop(0.55, "#d7f3ff");
    sky.addColorStop(1, "#d8f5c4");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "rgba(255,255,255,.75)";
    clouds.forEach(cl => {
      const y = ((cl.y - worldY * 0.3) % (H + 80) + (H + 80)) % (H + 80) - 40;
      round(ctx, cl.x, y, cl.s, cl.s * 0.55, 16);
      ctx.fill();
    });

    platforms.forEach(p => {
      const y = p.y - worldY;
      if (y < -40 || y > H + 40) return;
      ctx.fillStyle = p.kind === "caught" ? "#7bc47b" : p.kind === "good" ? "#f3c45a" : "#8d6239";
      round(ctx, p.x, y, p.w, p.h, 8);
      ctx.fill();
      ctx.fillStyle = p.kind === "normal" || p.kind === "start" ? "#fff8e8" : "#243445";
      if (p.kind === "good") ctx.fillStyle = "#243445";
      ctx.font = "bold 15px Trebuchet MS, Arial";
      ctx.textAlign = "center";
      ctx.fillText(p.word, p.x + p.w / 2, y + 16);
    });

    // dog
    ctx.font = "40px serif";
    ctx.textAlign = "center";
    ctx.fillText("🐶", dog.x, dog.y + 8);

    ctx.fillStyle = "rgba(36,52,69,.08)";
    ctx.beginPath();
    ctx.ellipse(dog.x, dog.y + 22, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function round(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function loop() {
    if (!running || paused) return;
    physics();
    draw();
    raf = requestAnimationFrame(loop);
  }

  function bindControls() {
    const L = document.getElementById("btnLeft");
    const R = document.getElementById("btnRight");
    const J = document.getElementById("btnJump");
    const down = (k) => (e) => { e.preventDefault(); keys[k] = true; };
    const up = (k) => (e) => { e.preventDefault(); keys[k] = false; };
    [["l", L], ["r", R], ["j", J]].forEach(([k, el]) => {
      el.onpointerdown = down(k);
      el.onpointerup = up(k);
      el.onpointerleave = up(k);
    });
    J.addEventListener("pointerdown", () => { if (dog.vy > -4) dog.vy = -12; });

    canvas.onpointerdown = (e) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      keys.l = x < r.width / 2;
      keys.r = x >= r.width / 2;
      if (hint) hint.style.display = "none";
    };
    canvas.onpointerup = () => { keys.l = keys.r = false; };
    window.onkeydown = (e) => {
      if (e.key === "ArrowLeft") keys.l = true;
      if (e.key === "ArrowRight") keys.r = true;
      if (e.key === "ArrowUp" || e.key === " ") { keys.j = true; dog.vy = -12; e.preventDefault(); }
    };
    window.onkeyup = (e) => {
      if (e.key === "ArrowLeft") keys.l = false;
      if (e.key === "ArrowRight") keys.r = false;
      if (e.key === "ArrowUp" || e.key === " ") keys.j = false;
    };
  }

  function start() {
    stop(false);
    resize();
    pickWords();
    score = 0;
    lives = 3;
    caught = [];
    sinceRead = 0;
    lastLand = null;
    paused = false;
    running = true;
    overlay.classList.add("hide");
    seedWorld();
    newTarget();
    updateHud();
    bindControls();
    loop();
    window.addEventListener("resize", resize);
  }

  function stop(saveRound) {
    running = false;
    paused = false;
    cancelAnimationFrame(raf);
    keys.l = keys.r = keys.j = false;
    if (saveRound && score > 0) {
      state.game = (state.game || 0) + 1;
      save();
    }
  }

  return { start, stop, speakTarget };
})();
