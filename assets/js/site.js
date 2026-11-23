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
    ["shot-01.jpg", "The title screen: the council convenes."],
    ["shot-02.jpg", "The Interview. Ten questions, no second chances."],
    ["shot-03.jpg", "The office that fronts the operation."],
    ["shot-04.jpg", "The File Organizer."],
    ["shot-05.jpg", "Night infiltration at the compound."],
    ["shot-06.jpg", "Through the gardens of the house."],
    ["shot-07.jpg", "The mansion, after dark."],
    ["shot-08.jpg", "Contact."],
    ["shot-09.jpg", "Tactical pause: queue the moves, then execute."],
  ];
  const gal = document.getElementById("gallery");
  if (gal) {
    for (const [file, cap] of GALLERY) {
      const fig = document.createElement("figure");
      fig.style.margin = "0";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", "Enlarge: " + cap);
      const img = new Image();
      img.src = `${root}/assets/img/${file}`;
      img.alt = cap;
      img.loading = "lazy";
      img.width = 1920; img.height = 1080;
      btn.append(img);
      btn.addEventListener("click", () => {
        const big = new Image();
        big.src = img.src; big.alt = cap;
        openLightbox(big, cap);
      });
      const fc = document.createElement("figcaption");
      fc.textContent = cap;
      fig.append(btn, fc);
      gal.append(fig);
    }
  }

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
