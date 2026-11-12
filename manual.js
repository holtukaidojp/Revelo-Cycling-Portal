
let manuals = [];
let selectedManualCategory = "すべて";

async function loadManuals() {
  try {
    const response = await fetch("data/manual.json");
    if (!response.ok) throw new Error("マニュアル読み込み失敗");

    manuals = await response.json();

    renderManualCategories();
    renderManuals();

    document.getElementById("manualCount").textContent = manuals.length;

  } catch (error) {
    console.error(error);
    document.getElementById("manualList").innerHTML =
      '<div class="empty-state">マニュアルを読み込めませんでした。</div>';
  }
}

function renderManualCategories() {
  const categories = [
    "すべて",
    ...new Set(manuals.map(item => item.category).filter(Boolean))
  ];

  document.getElementById("manualCategories").innerHTML =
    categories.map(category => `
      <button
        class="category-button ${selectedManualCategory === category ? "active" : ""}"
        onclick="selectManualCategory('${escapeHtml(category)}')">
        ${escapeHtml(category)}
      </button>
    `).join("");
}

function selectManualCategory(category) {
  selectedManualCategory = category;
  renderManualCategories();
  renderManuals();
}

function renderManuals() {
  const container = document.getElementById("manualList");

  const filtered = manuals.filter(item =>
    selectedManualCategory === "すべて" ||
    item.category === selectedManualCategory
  );

  container.innerHTML = filtered.length
    ? filtered.map(item => `
      <article class="manual-card">
        <span class="tag">${escapeHtml(item.category || "ガイド")}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary || "")}</p>

        <button class="manual-toggle"
          onclick="toggleManual('${escapeHtml(item.id)}')">
          詳細を読む ＋
        </button>

        <div class="manual-content" id="manual-${escapeHtml(item.id)}" hidden>
          ${escapeHtml(item.content || "")}
        </div>
      </article>
    `).join("")
    : '<div class="empty-state">記事がありません。</div>';
}

function toggleManual(id) {
  const content = document.getElementById(`manual-${id}`);
  if (!content) return;

  content.hidden = !content.hidden;
}
