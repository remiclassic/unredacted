(() => {
  const root = document.documentElement.dataset.root || ".";
  const lb = document.getElementById("lightbox");
  const lbBody = document.getElementById("lb-body");
  const lbCap = document.getElementById("lb-cap");

  function openLightbox(node, caption) {
    if (!lb) return;
    lbBody.replaceChildren(node);
    lbCap.textContent = caption || "";
    lb.showModal();
  }
  if (lb) {
    lb.addEventListener("click", (e) => {
      if (e.target === lb || e.target.closest("[data-close]")) lb.close();
    });
    lb.addEventListener("close", () => {
      const v = lbBody.querySelector("video");
      if (v) v.pause();
      lbBody.replaceChildren();
    });
  }

  // Gallery (landing page)
  const GALLERY = [
    ["shot-09.jpg", "Tactical pause: queue the moves, then execute."],
    ["shot-05.jpg", "Night infiltration at the compound."],
    ["shot-02.jpg", "The Interview. Ten questions, no second chances."],
    ["shot-03.jpg", "The office that fronts the operation."],
    ["shot-04.jpg", "The File Organizer."],
    ["shot-06.jpg", "Through the gardens of the house."],
    ["shot-07.jpg", "The mansion, after dark."],
    ["shot-08.jpg", "Contact."],
    ["shot-01.jpg", "The title screen: the council convenes."],
  ];
  // Exhibit viewer: one large image, a caption bar, and a strip of thumbnails
  const gal = document.getElementById("gallery");
  if (gal) {
    const pad = (n) => String(n).padStart(2, "0");
    const main = document.createElement("figure");
    main.className = "viewer-main";
    const zoom = document.createElement("button");
    zoom.type = "button"; zoom.className = "viewer-zoom";
    const bar = document.createElement("figcaption");
    bar.className = "viewer-bar";
    const count = document.createElement("span"); count.className = "viewer-count";
    const cap = document.createElement("span"); cap.className = "viewer-cap";
    const nav = document.createElement("span"); nav.className = "viewer-nav";
    const prev = document.createElement("button"); prev.type = "button"; prev.textContent = "←"; prev.setAttribute("aria-label", "Previous screenshot");
    const next = document.createElement("button"); next.type = "button"; next.textContent = "→"; next.setAttribute("aria-label", "Next screenshot");
    nav.append(prev, next); bar.append(count, cap, nav); main.append(zoom, bar);
    const strip = document.createElement("div");
    strip.className = "viewer-strip"; strip.setAttribute("role", "tablist"); strip.setAttribute("aria-label", "Screenshots");
    const bigs = [], tabs = [];
    let cur = 0;
    function show(i, focus) {
      cur = (i + GALLERY.length) % GALLERY.length;
      const [file, text] = GALLERY[cur];
      if (!bigs[cur]) {
        const im = new Image();
        im.src = `${root}/assets/img/${file}`; im.alt = text;
        bigs[cur] = im; zoom.append(im);
      }
      bigs.forEach((im, k) => im && im.classList.toggle("on", k === cur));
      tabs.forEach((t, k) => { t.setAttribute("aria-selected", k === cur ? "true" : "false"); t.tabIndex = k === cur ? 0 : -1; });
      count.textContent = `Exhibit ${pad(cur + 1)} / ${pad(GALLERY.length)}`;
      cap.textContent = text;
      zoom.setAttribute("aria-label", "Enlarge: " + text);
      if (focus) tabs[cur].focus();
      if (strip.scrollWidth > strip.clientWidth) strip.scrollTo({ left: tabs[cur].offsetLeft - strip.clientWidth / 2 + tabs[cur].clientWidth / 2, behavior: "smooth" });
    }
    GALLERY.forEach(([file, text], i) => {
      const t = document.createElement("button");
      t.type = "button"; t.setAttribute("role", "tab"); t.setAttribute("aria-label", text);
      const im = new Image();
      im.src = `${root}/assets/img/${file}`; im.alt = ""; im.loading = "lazy";
      t.append(im);
      t.addEventListener("click", () => show(i));
      t.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); show(cur + 1, true); }
        if (e.key === "ArrowLeft") { e.preventDefault(); show(cur - 1, true); }
      });
      tabs.push(t); strip.append(t);
    });
    prev.addEventListener("click", () => show(cur - 1));
    next.addEventListener("click", () => show(cur + 1));
    zoom.addEventListener("click", () => {
      const big = new Image();
      big.src = bigs[cur].src; big.alt = GALLERY[cur][1];
      openLightbox(big, GALLERY[cur][1]);
    });
    gal.append(main, strip);
    show(0);
  }

  // The job: on wide screens a sticky stage shows the image for the step being read
  const loop = document.querySelector("[data-loop]");
  if (loop && "IntersectionObserver" in window) {
    const steps = [...loop.querySelectorAll(".step")];
    const frame = loop.querySelector(".stage-frame");
    const nEl = loop.querySelector("[data-stage-n]");
    const tagEl = loop.querySelector("[data-stage-tag]");
    const ticks = [...loop.querySelectorAll(".stage-ticks i")];
    const imgs = steps.map((st) => {
      const src = st.querySelector(".step-media img");
      const im = new Image();
      im.src = src.src; im.alt = ""; im.loading = "lazy";
      frame.prepend(im);
      return im;
    });
    const set = (i) => {
      steps.forEach((st, k) => st.classList.toggle("on", k === i));
      imgs.forEach((im, k) => im.classList.toggle("on", k === i));
      ticks.forEach((t, k) => t.classList.toggle("on", k <= i));
      nEl.textContent = String(i + 1).padStart(2, "0");
      tagEl.textContent = steps[i].querySelector("figcaption").textContent;
    };
    set(0);
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) set(steps.indexOf(e.target)); });
    }, { rootMargin: "-48% 0px -48% 0px" });
    steps.forEach((st) => io.observe(st));
    const wide = matchMedia("(min-width: 980px)");
    const apply = () => loop.classList.toggle("enhanced", wide.matches);
    wide.addEventListener("change", apply);
    apply();
  }

  // Inline trailer: the poster cover starts playback
  document.querySelectorAll("[data-inline-play]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const player = btn.closest(".player");
      const v = player.querySelector("video");
      player.classList.add("playing");
      v.play().catch(() => {});
      v.focus();
    })
  );

  // "Watch the trailer" buttons open the trailer in a modal
  document.querySelectorAll("[data-play-trailer]").forEach((b) =>
    b.addEventListener("click", () => {
      const inline = document.getElementById("trailer-video");
      if (inline) inline.pause();
      const v = document.createElement("video");
      v.controls = true; v.autoplay = true; v.playsInline = true;
      v.poster = `${root}/assets/img/trailer-poster.jpg`;
      v.src = `${root}/assets/video/trailer-720p.mp4`;
      openLightbox(v, "UNREDACTED: The Deep State · Announce trailer · Pre-alpha footage");
    })
  );

  // Operative dossiers: hover/focus "decrypts" a line
  const LINES = ["FILE: ████████ ██████", "CLEARANCE REQUIRED", "MENTAL STATE: MONITORED", "LAST SEEN: ██/██/1898"];
  document.querySelectorAll(".op").forEach((card, i) => {
    const out = card.querySelector("[data-reveal]");
    if (!out) return;
    let t;
    const run = () => {
      clearInterval(t);
      const target = LINES[(i + 1) % LINES.length];
      let n = 0;
      t = setInterval(() => {
        n++;
        out.textContent = target.slice(0, n) + (n < target.length ? "▌" : "");
        if (n >= target.length) clearInterval(t);
      }, 28);
    };
    card.addEventListener("mouseenter", run);
    card.addEventListener("focus", run);
  });

  // Copy buttons (press kit)
  document.querySelectorAll("[data-copy]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      const src = document.getElementById(btn.dataset.copy);
      if (!src) return;
      const text = src.innerText.trim();
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "Copied";
      } catch {
        const r = document.createRange();
        r.selectNodeContents(src);
        const s = getSelection(); s.removeAllRanges(); s.addRange(r);
        btn.textContent = "Selected, press Ctrl+C";
      }
      setTimeout(() => (btn.textContent = "Copy text"), 2200);
    })
  );
})();
