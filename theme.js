(() => {
  const key = "alisher-portfolio-theme";
  const saved = localStorage.getItem(key);
  const initial = saved === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = initial;
  const style = document.createElement("style");
  style.textContent = `
    html[data-theme="light"] { color-scheme: light; }
    html[data-theme="dark"] { color-scheme: dark; }
    .theme-toggle {
      position: fixed; right: 20px; bottom: 20px; z-index: 9999;
      display: inline-flex; align-items: center; gap: 9px;
      border: 1px solid #65747b; border-radius: 999px;
      padding: 11px 16px; background: #1b272e; color: #edf2f4;
      box-shadow: 0 5px 22px #0003; font: 700 13px system-ui,sans-serif;
      cursor: pointer; transition: transform .18s, background .18s;
    }
    .theme-toggle:hover { transform: translateY(-2px); }
    .theme-toggle:focus-visible { outline: 3px solid #e6b65d; outline-offset: 3px; }
    html[data-theme="light"] .theme-toggle { background: #fff; color: #182326; border-color: #cbd3d0; }
    html[data-theme="light"] body { background: #f5f5f3 !important; color: #182326 !important; }
    html[data-theme="light"] nav, html[data-theme="light"] .bar, html[data-theme="light"] .site-nav {
      background: #fff !important; color: #182326 !important; border-color: #d8dedb !important;
    }
    html[data-theme="light"] nav a, html[data-theme="light"] .bar a, html[data-theme="light"] .site-nav a { color: #182326 !important; }
    html[data-theme="light"] .hero, html[data-theme="light"] .archive-intro { background: #e8eeeb !important; color: #182326 !important; }
    html[data-theme="light"] .hero-kicker, html[data-theme="light"] .hero-index,
    html[data-theme="light"] .archive-meta, html[data-theme="light"] .archive-intro > p { color: #526168 !important; }
    html[data-theme="light"] .row, html[data-theme="light"] .assignment-link,
    html[data-theme="light"] .task, html[data-theme="light"] .item,
    html[data-theme="light"] .panel, html[data-theme="light"] .card, html[data-theme="light"] fieldset {
      background: #fff !important; color: #182326 !important; border-color: #d8dedb !important;
    }
    html[data-theme="light"] h1, html[data-theme="light"] h2, html[data-theme="light"] h3,
    html[data-theme="light"] h4, html[data-theme="light"] strong, html[data-theme="light"] label,
    html[data-theme="light"] .row-copy h3, html[data-theme="light"] .details strong,
    html[data-theme="light"] .copy strong { color: #182326 !important; }
    html[data-theme="light"] p, html[data-theme="light"] li, html[data-theme="light"] .intro,
    html[data-theme="light"] .back, html[data-theme="light"] .muted, html[data-theme="light"] .hint,
    html[data-theme="light"] .row-copy p, html[data-theme="light"] .details span,
    html[data-theme="light"] .copy span, html[data-theme="light"] .student-note,
    html[data-theme="light"] .eyebrow, html[data-theme="light"] .archive-content-head p {
      color: #647276 !important;
    }
    html[data-theme="light"] input, html[data-theme="light"] select, html[data-theme="light"] textarea {
      background: #fff !important; color: #182326 !important; border-color: #c7d0cc !important;
    }
    html[data-theme="light"] pre, html[data-theme="light"] code { background: #eef1ef !important; color: #182326 !important; }
    html[data-theme="light"] footer, html[data-theme="light"] .site-footer {
      background: #fff !important; color: #647276 !important; border-color: #d8dedb !important;
    }
    html[data-theme="light"] a { color: #315f70; }
    html[data-theme="light"] .num, html[data-theme="light"] .assignment-index, html[data-theme="light"] .number {
      background: #e6b65d !important; color: #172126 !important;
    }
    @media (prefers-reduced-motion: reduce) { .theme-toggle { transition: none; } }
  `;
  document.head.appendChild(style);
  const button = document.createElement("button");
  button.className = "theme-toggle";
  button.type = "button";
  button.setAttribute("aria-label", "Switch color theme");
  function render() {
    const light = document.documentElement.dataset.theme === "light";
    button.innerHTML = light ? "☾ <span>Dark mode</span>" : "☀ <span>Light mode</span>";
    button.setAttribute("aria-pressed", String(light));
  }
  button.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem(key, next);
    render();
  });
  document.addEventListener("DOMContentLoaded", () => document.body.appendChild(button));
  render();
})();