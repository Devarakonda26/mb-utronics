/* MB Utronics — site behaviour (vanilla JS, no dependencies) */
(function () {
  "use strict";

  document.documentElement.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Mobile navigation ---------- */
  function initNav() {
    var toggle = $("#nav-toggle");
    var links = $("#nav-links");
    if (!toggle || !links) return;

    function setOpen(open) {
      links.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1080) setOpen(false);
    });
  }

  /* ---------- Active link highlighting ---------- */
  function initScrollSpy() {
    var navLinks = $$("a[data-nav]");
    var map = {};
    navLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    // "Why choose us" has no nav item; Projects/Technologies etc. do.
    var sections = Object.keys(map).map(function (id) { return document.getElementById(id); }).filter(Boolean);
    if (!sections.length || !("IntersectionObserver" in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.remove("is-active"); a.removeAttribute("aria-current"); });
        var a = map[entry.target.id];
        if (a) { a.classList.add("is-active"); a.setAttribute("aria-current", "true"); }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var items = $$(".reveal");
    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 60 + "ms";
      io.observe(el);
    });
  }

  /* ---------- Animated counters ---------- */
  function initCounters() {
    var nums = $$("[data-count]");
    function finalText(el) { return el.getAttribute("data-count") + (el.getAttribute("data-suffix") || ""); }
    if (!("IntersectionObserver" in window) || reduceMotion) {
      nums.forEach(function (el) { el.textContent = finalText(el); });
      return;
    }
    function run(el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      var suffix = el.getAttribute("data-suffix") || "";
      var duration = 1200;
      var start = null;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + (p === 1 ? suffix : "");
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { el.textContent = "0"; io.observe(el); });
  }

  /* ---------- Back to top + year ---------- */
  function initBackToTop() {
    var btn = $("#back-top");
    var year = $("#year");
    if (year) year.textContent = new Date().getFullYear();
    if (!btn) return;
    btn.hidden = false;
    function toggle() { btn.classList.toggle("is-visible", window.scrollY > 600); }
    window.addEventListener("scroll", toggle, { passive: true });
    toggle();
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Service / project -> contact topic ---------- */
  function initTopic() {
    var input = $("#topic-input");
    var note = $("#topic-note");
    var name = $("#topic-name");
    var clear = $("#topic-clear");
    if (!input || !note) return;

    function setTopic(t) {
      input.value = t || "";
      name.textContent = t || "";
      note.hidden = !t;
    }
    $$("[data-topic]").forEach(function (a) {
      a.addEventListener("click", function () { setTopic(a.getAttribute("data-topic")); });
    });
    if (clear) clear.addEventListener("click", function () { setTopic(""); $("#name").focus(); });
  }

  /* ---------- Contact form ---------- */
  function initForm() {
    var form = $("#contact-form");
    if (!form) return;
    var btn = $("#submit-btn");
    var label = $(".btn__label", btn);
    var status = $("#form-status");
    var sending = false;

    var rules = {
      name: function (v) { return v.trim().length >= 2 ? "" : "Please enter your name."; },
      email: function (v) {
        if (!v.trim()) return "Please enter your email address.";
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please enter a valid email address.";
      },
      message: function (v) { return v.trim().length >= 10 ? "" : "Please enter a message (at least 10 characters)."; }
    };

    function validateField(field) {
      var input = form.elements[field];
      var err = $("#" + field + "-error");
      var msg = rules[field](input.value);
      err.textContent = msg;
      if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
      return !msg;
    }
    Object.keys(rules).forEach(function (f) {
      var input = form.elements[f];
      input.addEventListener("blur", function () { validateField(f); });
      input.addEventListener("input", function () { if (input.getAttribute("aria-invalid")) validateField(f); });
    });

    function showStatus(kind, html) {
      status.className = "form__status is-" + kind;
      status.innerHTML = html;
      status.hidden = false;
    }
    function setSending(on) {
      sending = on;
      btn.classList.toggle("is-loading", on);
      btn.setAttribute("aria-disabled", String(on));
      label.textContent = on ? "Sending…" : "Send Message";
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sending) return; // prevent duplicate submissions
      status.hidden = true;

      var firstInvalid = null;
      Object.keys(rules).forEach(function (f) {
        if (!validateField(f) && !firstInvalid) firstInvalid = form.elements[f];
      });
      if (firstInvalid) { firstInvalid.focus(); return; }

      // Honeypot: bots fill this in; silently stop.
      if (form.elements._gotcha && form.elements._gotcha.value) return;

      var endpoint = (form.getAttribute("data-endpoint") || "").trim();
      if (!endpoint) {
        // Never pretend a message was delivered when nothing is configured.
        showStatus("error", "This form isn't connected yet, so your message was <strong>not</strong> sent. Please email <a href=\"mailto:mbutronics3@gmail.com\">mbutronics3@gmail.com</a> or call us directly.");
        return;
      }

      var payload = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        message: form.elements.message.value.trim(),
        topic: form.elements.topic.value || undefined
      };

      setSending(true);
      var controller = "AbortController" in window ? new AbortController() : null;
      var timer = controller ? setTimeout(function () { controller.abort(); }, 15000) : null;

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
        signal: controller ? controller.signal : undefined
      }).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        $("#topic-input").value = "";
        $("#topic-note").hidden = true;
        showStatus("success", "Thank you. Your message has been sent and we'll get back to you shortly.");
      }).catch(function () {
        showStatus("error", "Sorry, your message couldn't be sent. Please try again, or email <a href=\"mailto:mbutronics3@gmail.com\">mbutronics3@gmail.com</a>.");
      }).then(function () {
        if (timer) clearTimeout(timer);
        setSending(false);
      });
    });
  }

  initNav();
  initScrollSpy();
  initReveal();
  initCounters();
  initBackToTop();
  initTopic();
  initForm();
})();
