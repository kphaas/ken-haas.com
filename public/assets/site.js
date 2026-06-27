async function loadResume() {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", "/data/resume.json?v=9");
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

function setupResumeDialog() {
  const dialog = document.querySelector("[data-resume-dialog]");
  if (!dialog) return;

  const kicker = dialog.querySelector("[data-dialog-kicker]");
  const title = dialog.querySelector("[data-dialog-title]");
  const body = dialog.querySelector("[data-dialog-body]");
  const points = dialog.querySelector("[data-dialog-points]");

  document.querySelectorAll("[data-resume-modal]").forEach((tile) => {
    tile.addEventListener("click", () => {
      if (kicker) kicker.textContent = tile.dataset.kicker || "";
      if (title) title.textContent = tile.dataset.title || "";
      if (body) body.textContent = tile.dataset.body || "";
      if (points) {
        points.innerHTML = "";
        (tile.dataset.points || "").split("|").filter(Boolean).forEach((point) => {
          const item = document.createElement("li");
          item.textContent = point;
          points.append(item);
        });
      }
      if (dialog.showModal) dialog.showModal();
      else dialog.setAttribute("open", "");
    });
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog && dialog.close) dialog.close();
  });
}

setupResumeDialog();

loadResume()
  .then((data) => {
    setupResumeFilters(data);
    renderStats(data);
    renderAt0(data);
    renderWriting(data);
    setupContactForm();
  })
  .catch(() => setupContactForm());
