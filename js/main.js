
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // Année automatique dans le footer
  const yearElement = document.getElementById("current-year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Menu mobile
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");
  const navItems = document.querySelectorAll(".nav-link, .nav-contact");

  function closeMenu() {
    if (!menuToggle || !navLinks) return;

    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Ouvrir le menu");
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");

      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Fermer le menu" : "Ouvrir le menu"
      );
    });

    navItems.forEach((item) => {
      item.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) closeMenu();
    });
  }

  // Mettre en évidence la section visible dans la navigation
  const sections = document.querySelectorAll("main section[id]");
  const mainNavLinks = document.querySelectorAll(".nav-link");

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          mainNavLinks.forEach((link) => {
            const isCurrent =
              link.getAttribute("href") === `#${entry.target.id}`;

            link.classList.toggle("active", isCurrent);
          });
        });
      },
      {
        rootMargin: "-25% 0px -60% 0px",
        threshold: 0
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  // Animations légères au défilement
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if ("IntersectionObserver" in window && !reducedMotion) {
    const revealElements = document.querySelectorAll(
      ".section-heading, .project-feature, .project-card, " +
      ".case-grid, .case-stack, .about-grid, .skill-card, " +
      ".timeline-item, .contact-panel"
    );

    revealElements.forEach((element) => {
      element.classList.add("reveal");
    });

    document.documentElement.classList.add("reveal-ready");

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12
      }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  }
});

document.addEventListener("DOMContentLoaded", () => {
    const emailToggle = document.getElementById("email-toggle");
    const emailDetails = document.getElementById("email-details");
    const copyButton = document.getElementById("copy-email");
    const emailAddress = document.getElementById("email-address");
    const feedback = document.getElementById("email-feedback");

    if (emailToggle && emailDetails) {
        emailToggle.addEventListener("click", () => {
            const isExpanded =
                emailToggle.getAttribute("aria-expanded") === "true";

            emailToggle.setAttribute("aria-expanded", String(!isExpanded));
            emailDetails.hidden = isExpanded;

            emailToggle.innerHTML = isExpanded
                ? 'Me contacter par e-mail <span aria-hidden="true">↗</span>'
                : 'Masquer mon adresse <span aria-hidden="true">↑</span>';
        });
    }

    if (copyButton && emailAddress && feedback) {
        copyButton.addEventListener("click", async () => {
            const email = emailAddress.textContent.trim();

            try {
                await navigator.clipboard.writeText(email);
                feedback.textContent = "Adresse e-mail copiée !";
            } catch {
                feedback.textContent =
                    "Sélectionne l'adresse et copie-la manuellement.";
            }
        });
    }
});