(() => {
  const tl = document.getElementById("timeline");
  const eras = [...document.querySelectorAll(".era")];
  if (!tl || !eras.length) return;
  document.documentElement.classList.add("js");

  // Redaction bars read as "redacted" to screen readers instead of block characters
  document.querySelectorAll(".bar").forEach((b) => {
    b.setAttribute("role", "img");
    b.setAttribute("aria-label", "redacted");
  });

  const yearEl = document.querySelector("[data-rail-year]");
  const placeEl = document.querySelector("[data-rail-place]");
  const links = [...document.querySelectorAll("[data-rail]")];
  const scenes = [...document.querySelectorAll(".scene, .present")];
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let queued = false;

  function update() {
    queued = false;
    const vh = innerHeight;
    const mark = vh * 0.45;
    const r = tl.getBoundingClientRect();
    document.body.classList.toggle("in-timeline", r.top < vh * 0.55 && r.bottom > vh * 0.45);

    // rail: hold the era's year while reading it, roll forward through the hand-off
    let i = 0;
    for (let k = 0; k < eras.length; k++) if (eras[k].getBoundingClientRect().top <= mark) i = k;
    const cur = eras[i];
    const next = eras[i + 1];
    const y0 = Number(cur.dataset.year);
    let year = y0;
    if (next) {
      const a = cur.getBoundingClientRect();
      const p = (mark - a.top) / a.height;
      const t = Math.min(1, Math.max(0, (p - 0.8) / 0.2));
      year = Math.round(y0 + (Number(next.dataset.year) - y0) * t);
    }
    if (yearEl) yearEl.textContent = year;
    if (placeEl) placeEl.textContent = year === y0 ? cur.dataset.place : "";
    links.forEach((l) => l.classList.toggle("on", l.dataset.rail === cur.dataset.year));

    if (still) return;
    // parallax progress for scenes in or near the viewport; horizontal drift for tape and film
    for (const s of scenes) {
      const b = s.getBoundingClientRect();
      if (b.bottom < -80 || b.top > vh + 80) continue;
      s.style.setProperty("--p", Math.min(1, Math.max(0, (vh - b.top) / (vh + b.height))).toFixed(3));
    }
    if (r.top < vh && r.bottom > 0) tl.style.setProperty("--sx", Math.round(-r.top));
  }

  addEventListener("scroll", () => {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }, { passive: true });
  addEventListener("resize", update);
  update();

  const reveal = (el) => el.closest(".era").classList.add("seen");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -18% 0px" });
    document.querySelectorAll(".era-body").forEach((b) => io.observe(b));
  } else {
    eras.forEach((e) => e.classList.add("seen"));
  }
})();
