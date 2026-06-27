async function loadResume() {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", "/data/resume.json?v=4");
    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        reject(new Error("Unable to load resume data"));
        return;
      }
      resolve(JSON.parse(request.responseText));
    };
    request.onerror = () => reject(new Error("Unable to load resume data"));
    request.send();
  });
}

function matches(item, filter) {
  return filter === "All" || item.tags.includes(filter);
}

function button(label, attr, value, pressed = false) {
  return `<button class="filter" type="button" aria-pressed="${pressed}" ${attr}="${value}">${label}</button>`;
}

function renderHighlights(data, filter = "All", root = document) {
  const highlights = root.querySelector("[data-highlights]");
  if (!highlights) return;
  highlights.innerHTML = data.highlights
    .filter((item) => matches(item, filter))
    .map((item) => `<article class="card"><h3>${item.label}</h3><p>${item.text}</p></article>`)
    .join("");
}

function renderTimeline(data, filter = "All", root = document) {
  const timeline = root.querySelector("[data-timeline]");
  if (!timeline) return;
  timeline.innerHTML = data.timeline
    .filter((item) => matches(item, filter))
    .map(
      (item) => `<li><div class="timeline-company"><span>${item.company}</span><span>${item.period}</span></div><h3 class="timeline-role">${item.role}</h3><p>${item.focus}</p></li>`,
    )
    .join("");
}

function renderSkills(data) {
  const skills = document.querySelector("[data-skills]");
  if (skills) skills.innerHTML = data.skills.map((skill) => `<li>${skill}</li>`).join("");
}

function setupResumeFilters(data) {
  document.querySelectorAll("[data-resume-controls]").forEach((controls) => {
    const root = controls.closest("[data-resume-root]") || document;
    const filters = ["All", ...data.filters];
    controls.innerHTML = filters.map((filter, index) => button(filter, "data-filter", filter, index === 0)).join("");
    controls.addEventListener("click", (event) => {
      const selected = event.target.closest("[data-filter]");
      if (!selected) return;
      controls.querySelectorAll("[data-filter]").forEach((item) => item.setAttribute("aria-pressed", "false"));
      selected.setAttribute("aria-pressed", "true");
      renderHighlights(data, selected.dataset.filter, root);
      renderTimeline(data, selected.dataset.filter, root);
    });
    renderHighlights(data, "All", root);
    renderTimeline(data, "All", root);
  });
}

function renderLens(explorer, lens) {
  const title = explorer.querySelector("[data-lens-title]");
  const summary = explorer.querySelector("[data-lens-summary]");
  const points = explorer.querySelector("[data-lens-points]");
  if (title) title.textContent = lens.title;
  if (summary) summary.textContent = lens.summary;
  if (points) points.innerHTML = lens.points.map((point) => `<li>${point}</li>`).join("");
}

function setupLensExplorers(data) {
  document.querySelectorAll("[data-lens-explorer]").forEach((explorer) => {
    const controls = explorer.querySelector("[data-lens-controls]");
    if (!controls) return;
    controls.innerHTML = data.lenses.map((lens, index) => button(lens.label, "data-lens", lens.id, index === 0)).join("");
    controls.addEventListener("click", (event) => {
      const selected = event.target.closest("[data-lens]");
      if (!selected) return;
      const lens = data.lenses.find((item) => item.id === selected.dataset.lens);
      if (!lens) return;
      controls.querySelectorAll("[data-lens]").forEach((item) => item.setAttribute("aria-pressed", "false"));
      selected.setAttribute("aria-pressed", "true");
      renderLens(explorer, lens);
    });
    renderLens(explorer, data.lenses[0]);
  });
}

function renderStats(data) {
  const stats = document.querySelector("[data-stats]");
  if (!stats) return;
  stats.innerHTML = data.stats.map((stat) => `<li><strong>${stat.value}</strong><span>${stat.label}</span></li>`).join("");
}

function renderAt0(data) {
  const capabilities = document.querySelector("[data-at0-capabilities]");
  if (!capabilities) return;
  capabilities.innerHTML = data.at0.capabilities
    .map((item) => `<article class="card compact"><h3>${item.label}</h3><p>${item.text}</p></article>`)
    .join("");
}

function renderWriting(data) {
  const writing = document.querySelector("[data-writing]");
  if (!writing) return;
  writing.innerHTML = data.writing
    .map((item) => `<article class="card compact"><p class="metric">${item.source}</p><h3>${item.title}</h3><a class="text-link" href="${item.url}">Read on LinkedIn</a></article>`)
    .join("");
}

function setupContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const note = form.querySelector(".form-note");
    const fields = new FormData(form);
    const message = [fields.get("name"), fields.get("company"), fields.get("message")].filter(Boolean).join(" - ");

    if (navigator.clipboard && message) await navigator.clipboard.writeText(message);

    note.textContent = "Message copied. LinkedIn will open in a new tab.";
    window.open("https://www.linkedin.com/in/kphaas/", "_blank", "noopener,noreferrer");
  });
}

loadResume()
  .then((data) => {
    setupResumeFilters(data);
    setupLensExplorers(data);
    renderSkills(data);
    renderStats(data);
    renderAt0(data);
    renderWriting(data);
    setupContactForm();
  })
  .catch(() => setupContactForm());
