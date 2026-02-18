function initTimeline() {

  const grid = document.querySelector(".timeline-grid");
  if (!grid) return;

  // 🔴 Se for mobile, não aplicar posicionamento programático
  if (window.innerWidth <= 980) {
    grid.querySelectorAll(".t-card").forEach(el => {
      el.style.gridRow = "";
      el.style.removeProperty("--lane");
    });
    return;
  }

  const yearsEl = grid.querySelector(".timeline-years");

  const yearNodes = [...yearsEl.querySelectorAll(".year")];

  const yearToRow = new Map();
  yearNodes.forEach((n, idx) => {
    yearToRow.set(parseInt(n.textContent.trim()), idx + 1);
  });

  const minYear = Math.min(...yearToRow.keys());
  const maxYear = Math.max(...yearToRow.keys());
  const currentYear = new Date().getFullYear();

  function clampYear(y){
    return Math.max(minYear, Math.min(maxYear, y));
  }

  function rowForYear(y){
    return yearToRow.get(clampYear(y));
  }

  function assignLanes(cards){
    cards.sort((a,b)=>a.rowStart-b.rowStart||a.rowEnd-b.rowEnd);
    const lanesEnd = [];

    for(const c of cards){
      let lane = 0;
      while(lane < lanesEnd.length && lanesEnd[lane] >= c.rowStart) lane++;
      if(lane === lanesEnd.length) lanesEnd.push(c.rowEnd);
      else lanesEnd[lane] = c.rowEnd;
      c.el.style.setProperty("--lane", lane);
    }
  }

  function positionCards(selector){
    const els = [...grid.querySelectorAll(selector)];
    const cards = [];

    for(const el of els){

      const start = parseInt(el.dataset.start);
      const end = el.dataset.end ? parseInt(el.dataset.end) : currentYear;

      const yTop = Math.max(start, end);
      const yBottom = Math.min(start, end);

      const rowTop = rowForYear(yTop);
      const rowBottom = rowForYear(yBottom);

      el.style.gridRow = `${rowTop} / ${rowBottom + 1}`;

      cards.push({el, rowStart: rowTop, rowEnd: rowBottom});
    }

    assignLanes(cards);
  }

  positionCards(".timeline-left .t-card");
  positionCards(".timeline-right .t-card");
}

document.addEventListener("DOMContentLoaded", initTimeline);

window.addEventListener("resize", () => {
  document.querySelectorAll(".t-card").forEach(el => {
    el.style.gridRow = "";
    el.style.removeProperty("--lane");
  });
  initTimeline();
});

