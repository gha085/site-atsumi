(async function () {
  const grid = document.getElementById("refsGrid");
  const q = document.getElementById("refs-q");
  const chipsWrap =
    document.getElementById("refsChips") || document.querySelector(".refs-chips");

  if (!grid) return;

  // página define lang como pt-BR / en-US / fr-FR no frontmatter (teus .njk já fazem isso)
  const htmlLang = (document.documentElement.lang || "pt-BR").toLowerCase();
  const langKey = htmlLang.startsWith("en") ? "en" : htmlLang.startsWith("fr") ? "fr" : "pt";

  // i18n via data-* (já está OK nos .njk)
  const i18n = {
    noResults: grid.dataset.i18nNoresults || "Nenhum resultado para os filtros atuais.",
    all: grid.dataset.i18nAll || "Todos",
    ariaCardPrefix: grid.dataset.i18nAriaCardPrefix || "Referência profissional:",
    ariaTags: grid.dataset.i18nAriaTags || "Tags de contexto",
  };

  // resolve valor i18n (aceita string simples ou {pt,en,fr})
  function t(v) {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (typeof v === "object") return v[langKey] || v.pt || v.en || v.fr || "";
    return String(v);
  }

  const res = await fetch("/data/referencias.json", { cache: "no-store" });
  const raw = await res.json();

  // normaliza dataset para o idioma atual (assim filtros/busca funcionam no idioma)
  const data = raw.map((item) => ({
    ...item,
    role: t(item.role),
    why: t(item.why),
    tags: {
      primary: t(item?.tags?.primary),
      secondary: Array.isArray(item?.tags?.secondary) ? item.tags.secondary.map(t) : [],
    },
    links: Array.isArray(item?.links)
      ? item.links.map((l) => ({ ...l, label: t(l.label) }))
      : [],
  }));

  let activeFilter = "__all";
  let query = "";

  function normalize(s) {
    return (s || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function getPrimary(item) {
    return item?.tags?.primary || "";
  }

  function getSecondary(item) {
    return Array.isArray(item?.tags?.secondary) ? item.tags.secondary : [];
  }

  function matches(item) {
    const primary = getPrimary(item);
    const secondary = getSecondary(item);

    const okFilter =
      activeFilter === "__all" || normalize(primary) === normalize(activeFilter);

    const hay = normalize(
      [item.name, item.role, item.why, primary, ...secondary].join(" ")
    );

    const okQuery = !query || hay.includes(normalize(query));
    return okFilter && okQuery;
  }

  function render(items) {
    if (!items.length) {
      grid.innerHTML = `<div class="muted">${i18n.noResults}</div>`;
      return;
    }

    grid.innerHTML = items
      .map((item) => {
        const primary = getPrimary(item);
        const secondary = getSecondary(item);

        const tagsHtml = [
          primary ? `<li>${primary}</li>` : "",
          ...secondary.map((x) => `<li>${x}</li>`),
        ].join("");

        const links = (item.links || [])
          .map((l) => {
            const cls = l.primary ? "ref-link ref-link-primary" : "ref-link";
            return `<a class="${cls}" href="${l.href}" target="_blank" rel="noopener">${l.label} →</a>`;
          })
          .join("");

        const avatar = item.avatar
          ? `<img src="${item.avatar}" alt="" loading="lazy" />`
          : "";

        const avatarClass = item.avatar ? "ref-avatar" : "ref-avatar ref-avatar-empty";

        return `
          <article class="ref-card" aria-label="${i18n.ariaCardPrefix} ${item.name}">
            <div class="ref-top">
              <div class="${avatarClass}" aria-hidden="true">${avatar}</div>

              <div class="ref-head">
                <h3 class="ref-name">${item.name}</h3>
                <p class="ref-role">${item.role || ""}</p>
                <ul class="ref-tags" aria-label="${i18n.ariaTags}">${tagsHtml}</ul>
              </div>
            </div>

            <p class="ref-why">${item.why || ""}</p>

            <div class="ref-links">${links}</div>
          </article>
        `;
      })
      .join("");
  }

  function update() {
    render(data.filter(matches));
  }

  function buildChips() {
    if (!chipsWrap) return;

    const primaries = Array.from(new Set(data.map(getPrimary).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, document.documentElement.lang || "pt-BR")
    );

    const capped = primaries.slice(0, 8);

    chipsWrap.innerHTML = [
      `<button class="chip is-active" type="button" data-filter="__all">${i18n.all}</button>`,
      ...capped.map((p) => `<button class="chip" type="button" data-filter="${p}">${p}</button>`),
    ].join("");

    chipsWrap.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;

      chipsWrap.querySelectorAll(".chip").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      activeFilter = btn.dataset.filter || "__all";
      update();
    });
  }

  if (q) {
    q.addEventListener("input", () => {
      query = q.value;
      update();
    });
  }

  buildChips();
  update();
})();
