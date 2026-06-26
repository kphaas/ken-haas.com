async function loadResume() {
  const response = await fetch("/data/resume.json");
  if (!response.ok) throw new Error("Unable to load resume data");
  return response.json();
}

function matches(item, filter) {
  return filter === "All" || item.tags.includes(filter);
}

function renderResume(data, filter = "All") {
  const highlights = document.querySelector("[data-highlights]");
  const timeline = document.querySelector("[data-timeline]");
  const skills = document.querySelector("[data-skills]");

  if (highlights) {
    highlights.innerHTML = data.highlights
      .filter((item) => matches(item, filter))
      .map((item) => `<article class="card"><h3>${item.label}</h3><p>${item.text}</p></article>`)
      .join("");
  }

  if (timeline) {
    timeline.innerHTML = data.timeline
      .filter((item) => matches(item, filter))
      .map(
        (item) => `<li><div class="timeline-company"><span>${item.company}</span><span>${item.period}</span></div><h3 class="timeline-role">${item.role}</h3><p>${item.focus}</p></li>`,
      )
      .join("");
  }

  if (skills) {
    skills.innerHTML = data.skills.map((skill) => `<li>${skill}</li>`).join("");
  }
}

function renderFilters(data) {
  const controls = document.querySelector("[data-resume-controls]");
  if (!controls) return;

  const filters = ["All", ...data.filters];
  controls.innerHTML = filters
    .map((filter, index) => `<button class="filter" type="button" aria-pressed="${index === 0}" data-filter="${filter}">${filter}</button>`)
    .join("");

  controls.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    controls.querySelectorAll("[data-filter]").forEach((item) => item.setAttribute("aria-pressed", "false"));
    button.setAttribute("aria-pressed", "true");
    renderResume(data, button.dataset.filter);
  });
}

function setupContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const note = form.querySelector(".form-note");
    const fields = new FormData(form);
    const message = [
      fields.get("name"),
      fields.get("company"),
      fields.get("message"),
    ]
      .filter(Boolean)
      .join(" - ");

    if (navigator.clipboard && message) {
      await navigator.clipboard.writeText(message);
    }

    note.textContent = "Message copied. LinkedIn will open in a new tab.";
    window.open("https://www.linkedin.com/in/kphaas/", "_blank", "noopener,noreferrer");
  });
}

loadResume()
  .then((data) => {
    renderFilters(data);
    renderResume(data);
    setupContactForm();
  })
  .catch(() => {
    setupContactForm();
  });
