(async function () {
  const grid = document.getElementById("refsGrid");
  const q = document.getElementById("refs-q");
  const chips = document.querySelectorAll(".refs-chips .chip");

  if (!grid) return;

  const res = await fetch("/data/referencias.json", { cache: "no-store" });
  const data = await res.json();

  let activeFilter = "__all";
  let query = "";

  function normalize(s) {
    return (s || "")
      .toString()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function matches(item) {
    const tags = (item.tags || []).map(normalize);
    const hay = normalize([item.name, item.role, item.why, ...(item.tags || [])].join(" "));

    const okFilter = activeFilter === "__all" || tags.includes(normalize(activeFilter));
    const okQuery = !query || hay.includes(normalize(query));

    return okFilter && okQuery;
  }

  function render(items) {
    if (!items.length) {
      grid.innerHTML = `<div class="muted">Nenhum resultado para os filtros atuais.</div>`;
      return;
    }

    grid.innerHTML = items.map(item => {
      const tags = (item.tags || []).map(t => `<li>${t}</li>`).join("");
      const links = (item.links || []).map(l => {
        const cls = l.primary ? "ref-link ref-link-primary" : "ref-link";
        return `<a class="${cls}" href="${l.href}" target="_blank" rel="noopener">${l.label} →</a>`;
      }).join("");

      const avatar = item.avatar
        ? `<img src="${item.avatar}" alt="" loading="lazy" />`
        : "";

      const avatarClass = item.avatar ? "ref-avatar" : "ref-avatar ref-avatar-empty";

      return `
        <article class="ref-card" aria-label="Referência profissional: ${item.name}">
          <div class="ref-top">
            <div class="${avatarClass}" aria-hidden="true">${avatar}</div>

            <div class="ref-head">
              <h3 class="ref-name">${item.name}</h3>
              <p class="ref-role">${item.role || ""}</p>
              <ul class="ref-tags" aria-label="Tags de contexto">${tags}</ul>
            </div>
          </div>

          <p class="ref-why">${item.why || ""}</p>

          <div class="ref-links">${links}</div>
        </article>
      `;
    }).join("");
  }

  function update() {
    render(data.filter(matches));
  }

  chips.forEach(btn => {
    btn.addEventListener("click", () => {
      chips.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      activeFilter = btn.dataset.filter || "__all";
      update();
    });
  });

  if (q) {
    q.addEventListener("input", () => {
      query = q.value;
      update();
    });
  }

  update();
})();
