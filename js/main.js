"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (selector, ctx = document) => ctx.querySelector(selector);
  const $$ = (selector, ctx = document) => [...ctx.querySelectorAll(selector)];

  // Active les styles "avant animation" uniquement si le JS fonctionne
  document.documentElement.classList.add("js");

  // ---------- Année du footer ----------
  const year = $("#current-year");
  if (year) year.textContent = new Date().getFullYear();

  // ---------- Menu mobile ----------
  const toggle = $("#menu-toggle");
  const sidebar = $("#sidebar");

  function setMenu(open) {
    sidebar.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  }

  if (toggle && sidebar) {
    toggle.addEventListener("click", () => setMenu(!sidebar.classList.contains("open")));
    $$(".nav-link").forEach((link) => link.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
    window.addEventListener("resize", () => { if (window.innerWidth > 980) setMenu(false); });
  }

  // ---------- Lien actif dans le menu ----------
  const navLinks = $$(".nav-link");

  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) =>
            link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`)
          );
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );

    $$("main section[id]").forEach((section) => navObserver.observe(section));
  }

  // ---------- Effet "machine à écrire" ----------
  function typeInto(el, text, { speed = 30, delay = 0, render = (t) => t, keepCaret = true, onDone } = {}) {
    if (!el) return;

    if (reduce) {
      el.innerHTML = render(text);
      if (onDone) onDone();
      return;
    }

    let i = 0;

    setTimeout(function tick() {
      el.innerHTML = render(text.slice(0, i)) + (keepCaret || i < text.length ? '<span class="caret"></span>' : "");
      if (i++ < text.length) {
        setTimeout(tick, speed + Math.random() * 35);
      } else if (onDone) {
        onDone();
      }
    }, delay);
  }

  // Coloration simple du code Python
  const highlight = (text) =>
    text.replace(
      /(#.*$)|("(?:[^"\\\n]|\\.)*"?)|\b(def|return|True|False|None)\b|\b(\d+)\b/gm,
      (match, comment, string, keyword) =>
        comment ? `<span class="c-com">${match}</span>`
        : string ? `<span class="c-str">${match}</span>`
        : keyword ? `<span class="c-kw">${match}</span>`
        : `<span class="c-num">${match}</span>`
    );

  const codeText =
`user = {
    "id": 24,
    "name": "Ramatoulaye",
    "role": "developer",
    "passion": "build solutions"
}

def build():
    return impact

# Code. Solve. Impact.`;

  typeInto($("#typed-code"), codeText, { speed: 26, delay: 600, render: highlight });

  // Commande SQL dans le terminal
  typeInto($("#term-cmd"), "SELECT impact FROM solutions\n  WHERE purpose = 'utile' AND secure = true;", {
    speed: 38,
    delay: 3200,
    keepCaret: false
  });

  // Mots qui changent dans la phrase d'accroche
  const words = ["claires.", "utiles.", "sécurisées.", "évolutives."];
  const wordsEl = $("#typed-words");

  if (wordsEl) {
    if (reduce) {
      wordsEl.textContent = "claires, utiles et sécurisées.";
    } else {
      let w = 0;
      let c = 0;
      let deleting = false;

      (function loop() {
        const word = words[w];
        c += deleting ? -1 : 1;
        wordsEl.innerHTML = word.slice(0, c) + '<span class="caret"></span>';

        let wait = deleting ? 45 : 95;

        if (!deleting && c === word.length) { deleting = true; wait = 1500; }
        else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; wait = 350; }

        setTimeout(loop, wait);
      })();
    }
  }

  // ---------- Apparition au défilement + déclencheurs ----------
  const revealEls = $$(".reveal");

  function animateCount(el) {
    const target = Number(el.dataset.count);
    if (reduce) { el.textContent = target; return; }

    const duration = 1400;
    const start = performance.now();

    (function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) requestAnimationFrame(step);
    })(start);
  }

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          $$("[data-count]", entry.target).forEach(animateCount);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => {
      el.classList.add("is-visible");
      $$("[data-count]", el).forEach(animateCount);
    });
  }

  // ---------- Effet 3D sur les cartes ----------
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$(".tilt").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg) translateY(-5px)`;
      });

      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });

    // Lueur qui suit la souris
    const glow = $(".cursor-glow");
    let gx = innerWidth / 2, gy = innerHeight / 2, mx = gx, my = gy;

    window.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });

    (function follow() {
      gx += (mx - gx) * 0.08;
      gy += (my - gy) * 0.08;
      if (glow) glow.style.transform = `translate(${gx}px, ${gy}px)`;
      requestAnimationFrame(follow);
    })();
  }

  // ---------- Fond animé : réseau de points ----------
  const canvas = $("#bg");

  if (canvas) {
    const ctx = canvas.getContext("2d");
    const mouse = { x: -999, y: -999 };
    let W = 0, H = 0, points = [];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(70, Math.floor((W * H) / 22000));

      points = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      points.forEach((p, i) => {
        if (!reduce) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(56, 189, 248, 0.8)";
        ctx.fill();

        for (let j = i + 1; j < points.length; j++) {
          const q = points[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);

          if (d < 130) {
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.18 * (1 - d / 130)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);

        if (dm < 160) {
          ctx.strokeStyle = `rgba(34, 211, 238, ${0.4 * (1 - dm / 160)})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      });

      if (!reduce) requestAnimationFrame(draw);
    }

    window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener("resize", () => { resize(); if (reduce) draw(); });

    resize();
    draw();
  }

  // ---------- Contact : afficher / copier l'e-mail ----------
  const emailToggle = $("#email-toggle");
  const emailDetails = $("#email-details");
  const copyButton = $("#copy-email");
  const emailAddress = $("#email-address");
  const feedback = $("#email-feedback");

  if (emailToggle && emailDetails) {
    emailToggle.addEventListener("click", () => {
      const expanded = emailToggle.getAttribute("aria-expanded") === "true";

      emailToggle.setAttribute("aria-expanded", String(!expanded));
      emailDetails.hidden = expanded;

      emailToggle.innerHTML = expanded
        ? 'Me contacter par e-mail <span aria-hidden="true">↗</span>'
        : 'Masquer mon adresse <span aria-hidden="true">↑</span>';
    });
  }

  if (copyButton && emailAddress && feedback) {
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(emailAddress.textContent.trim());
        feedback.textContent = "Adresse e-mail copiée !";
      } catch {
        feedback.textContent = "Sélectionne l'adresse et copie-la manuellement.";
      }
    });
  }
});