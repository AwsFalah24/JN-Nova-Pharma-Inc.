/**
 * JN Nova Pharma — site interactions
 * Vanilla JavaScript only
 */

(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const primaryNav = document.querySelector(".primary-nav");
  const dropdowns = document.querySelectorAll(".nav-dropdown");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --------------------------------------------------------------------------
     Sticky header — solid white after scroll
     -------------------------------------------------------------------------- */
  function updateHeader() {
    if (!header) return;
    if (window.scrollY > 24) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* --------------------------------------------------------------------------
     Mobile navigation
     -------------------------------------------------------------------------- */
  function closeMobileNav() {
    if (!navToggle || !primaryNav) return;
    navToggle.setAttribute("aria-expanded", "false");
    primaryNav.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", function () {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      primaryNav.classList.toggle("is-open", !expanded);
      document.body.style.overflow = expanded ? "" : "hidden";
    });

    primaryNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMobileNav);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMobileNav();
        dropdowns.forEach(function (d) {
          d.classList.remove("is-open");
          const btn = d.querySelector("button");
          if (btn) btn.setAttribute("aria-expanded", "false");
        });
      }
    });
  }

  /* --------------------------------------------------------------------------
     Dropdown menus
     -------------------------------------------------------------------------- */
  dropdowns.forEach(function (dropdown) {
    const button = dropdown.querySelector("button");
    if (!button) return;

    button.addEventListener("click", function (event) {
      event.stopPropagation();
      const isOpen = dropdown.classList.contains("is-open");
      dropdowns.forEach(function (d) {
        d.classList.remove("is-open");
        const b = d.querySelector("button");
        if (b) b.setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        dropdown.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  document.addEventListener("click", function () {
    dropdowns.forEach(function (d) {
      d.classList.remove("is-open");
      const b = d.querySelector("button");
      if (b) b.setAttribute("aria-expanded", "false");
    });
  });

  /* --------------------------------------------------------------------------
     Scroll-triggered animations via IntersectionObserver
     -------------------------------------------------------------------------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    const revealEls = document.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right, .stagger"
    );

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    document
      .querySelectorAll(".reveal, .reveal-left, .reveal-right, .stagger")
      .forEach(function (el) {
        el.classList.add("is-visible");
      });
  }

  /* --------------------------------------------------------------------------
     Subtle parallax on large images
     -------------------------------------------------------------------------- */
  if (!reduceMotion) {
    const parallaxEls = document.querySelectorAll(".parallax-img");

    if (parallaxEls.length) {
      let ticking = false;

      function updateParallax() {
        const scrollY = window.scrollY;
        parallaxEls.forEach(function (el) {
          const rect = el.getBoundingClientRect();
          const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * 0.04;
          el.style.transform = "translateY(" + offset.toFixed(2) + "px)";
        });
        ticking = false;
      }

      window.addEventListener(
        "scroll",
        function () {
          if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
          }
        },
        { passive: true }
      );
    }
  }

  /* --------------------------------------------------------------------------
     Accordion
     -------------------------------------------------------------------------- */
  document.querySelectorAll(".accordion-trigger").forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      const expanded = trigger.getAttribute("aria-expanded") === "true";
      const panelId = trigger.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;

      trigger.setAttribute("aria-expanded", String(!expanded));
      if (panel) {
        panel.classList.toggle("is-open", !expanded);
      }
    });
  });

  /* --------------------------------------------------------------------------
     Contact form — client-side validation + Netlify Forms submission
     -------------------------------------------------------------------------- */
  const contactForm = document.getElementById("contact-form");

  if (contactForm) {
    const successEl = document.getElementById("form-success");
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    function setFieldError(field, message) {
      const group = field.closest(".form-group");
      if (!group) return;
      group.classList.add("has-error");
      field.classList.add("is-invalid");
      const error = group.querySelector(".form-error");
      if (error) error.textContent = message;
    }

    function clearFieldError(field) {
      const group = field.closest(".form-group");
      if (!group) return;
      group.classList.remove("has-error");
      field.classList.remove("is-invalid");
    }

    function isValidEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function showSuccess() {
      if (successEl) {
        successEl.classList.add("is-visible");
        successEl.setAttribute("role", "status");
      }
      contactForm.reset();
    }

    function showSubmitError() {
      if (successEl) {
        successEl.textContent =
          "Something went wrong. Please try again, or email us directly if the problem continues.";
        successEl.classList.add("is-visible");
      }
    }

    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      let valid = true;
      const name = contactForm.querySelector("#name");
      const email = contactForm.querySelector("#email");
      const subject = contactForm.querySelector("#subject");
      const message = contactForm.querySelector("#message");

      [name, email, subject, message].forEach(clearFieldError);

      if (!name.value.trim()) {
        setFieldError(name, "Please enter your name.");
        valid = false;
      }

      if (!email.value.trim()) {
        setFieldError(email, "Please enter your email.");
        valid = false;
      } else if (!isValidEmail(email.value.trim())) {
        setFieldError(email, "Please enter a valid email address.");
        valid = false;
      }

      if (!subject.value.trim()) {
        setFieldError(subject, "Please enter a subject.");
        valid = false;
      }

      if (!message.value.trim()) {
        setFieldError(message, "Please enter a message.");
        valid = false;
      } else if (message.value.trim().length < 10) {
        setFieldError(message, "Please enter a message of at least 10 characters.");
        valid = false;
      }

      if (!valid) {
        const firstInvalid = contactForm.querySelector(".is-invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      const formData = new FormData(contactForm);

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      })
        .then(function (response) {
          if (!response.ok) throw new Error("Network response was not ok");
          if (successEl) {
            successEl.textContent = "Thank you. Your message has been sent.";
          }
          showSuccess();
        })
        .catch(function () {
          showSubmitError();
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit";
          }
        });
    });

    contactForm.querySelectorAll("input, textarea").forEach(function (field) {
      field.addEventListener("input", function () {
        clearFieldError(field);
      });
    });
  }

  /* --------------------------------------------------------------------------
     Current year in footer
     -------------------------------------------------------------------------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
