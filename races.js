
let races = [];

async function loadRaces() {
  try {
    const response = await fetch("races.json");

    if (!response.ok) {
      throw new Error("大会データを読み込めませんでした");
    }

    races = await response.json();

    renderRaceFilters();
    renderRaces();
    renderHomeRaces();
    updateStatistics();

    if (typeof initializeRaceMap === "function") {
      initializeRaceMap();
    }
  } catch (error) {
    console.error(error);
    showToast("大会データの読み込みに失敗しました");
  }
}

function renderRaceFilters() {
  const prefectureSelect = document.getElementById("prefectureFilter");
  const categorySelect = document.getElementById("categoryFilter");
  const yearSelect = document.getElementById("yearFilter");

  if (!prefectureSelect || !categorySelect || !yearSelect) return;

  const prefectures = [...new Set(races.map(r => r.prefecture).filter(Boolean))].sort();
  const categories = [...new Set(races.map(r => r.category).filter(Boolean))].sort();
  const years = [...new Set(races.map(r => r.date?.slice(0, 4)).filter(Boolean))].sort();

  prefectureSelect.innerHTML =
    '<option value="">すべての都道府県</option>' +
    prefectures.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join("");

  categorySelect.innerHTML =
    '<option value="">すべての競技種目</option>' +
    categories.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join("");

  yearSelect.innerHTML =
    '<option value="">すべての年</option>' +
    years.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}年</option>`).join("");
}

function filterRaces() {
  const search = document.getElementById("raceSearch").value.trim().toLowerCase();
  const prefecture = document.getElementById("prefectureFilter").value;
  const category = document.getElementById("categoryFilter").value;
  const year = document.getElementById("yearFilter").value;

  return races.filter(race => {
    const text = [
      race.name,
      race.prefecture,
      race.city,
      race.category
    ].join(" ").toLowerCase();

    return (
      (!search || text.includes(search)) &&
      (!prefecture || race.prefecture === prefecture) &&
      (!category || race.category === category) &&
      (!year || race.date?.startsWith(year))
    );
  });
}

function renderRaces() {
  const list = document.getElementById("raceList");
  if (!list) return;

  const filtered = filterRaces();

  document.getElementById("resultCount").textContent =
    `${filtered.length}件`;

  if (!filtered.length) {
    list.innerHTML = '<div class="empty-state">該当する大会がありません。</div>';
    return;
  }

  list.innerHTML = filtered.map(createRaceCard).join("");
}

function renderHomeRaces() {
  const container = document.getElementById("homeRaces");
  if (!container) return;

  const today = new Date().toISOString().slice(0, 10);

  const upcoming = races
    .filter(r => r.date && r.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  container.innerHTML = upcoming.length
    ? upcoming.map(createRaceCard).join("")
    : '<div class="empty-state">現在、開催予定の大会は登録されていません。</div>';
}

function createRaceCard(race) {
  const status = race.entry_status || "情報掲載";
  const closed = status === "受付終了";

  const officialLink = race.url
    ? `<a href="${escapeHtml(race.url)}" target="_blank" rel="noopener noreferrer">公式情報</a>`
    : "";

  const mapButton =
    Number.isFinite(Number(race.latitude)) &&
    Number.isFinite(Number(race.longitude))
      ? `<button onclick="showRaceOnMap('${escapeHtml(race.id)}')">地図で見る</button>`
      : "";

  return `
    <article class="race-card">
      <span class="race-date">${formatDate(race.date)}</span>
      <h3>${escapeHtml(race.name)}</h3>

      <p class="race-location">
        📍 ${escapeHtml(race.prefecture || "")}
        ${escapeHtml(race.city || "")}
      </p>

      <p class="race-description">
        ${escapeHtml(race.description || "大会情報は公式サイトをご確認ください。")}
      </p>

      <div class="race-tags">
        <span class="tag">${escapeHtml(race.category || "自転車競技")}</span>
        <span class="status ${closed ? "closed" : ""}">
          ${escapeHtml(status)}
        </span>
      </div>

      <div class="card-actions">
        ${officialLink}
        ${mapButton}
      </div>
    </article>
  `;
}

function updateStatistics() {
  const raceCount = document.getElementById("raceCount");
  if (raceCount) raceCount.textContent = races.length;
}

function showRaceOnMap(id) {
  const race = races.find(r => r.id === id);
  if (!race) return;

  location.hash = "#map";

  setTimeout(() => {
    if (typeof focusRaceOnMap === "function") {
      focusRaceOnMap(race);
    }
  }, 300);
}

document.addEventListener("DOMContentLoaded", () => {
  ["raceSearch", "prefectureFilter", "categoryFilter", "yearFilter"]
    .forEach(id => {
      document.getElementById(id)?.addEventListener("input", renderRaces);
      document.getElementById(id)?.addEventListener("change", renderRaces);
    });

  document.getElementById("resetFilters")?.addEventListener("click", () => {
    document.getElementById("raceSearch").value = "";
    document.getElementById("prefectureFilter").value = "";
    document.getElementById("categoryFilter").value = "";
    document.getElementById("yearFilter").value = "";
    renderRaces();
  });
});
