
let newsItems = [];

async function loadNews() {
  try {
    const response = await fetch("news.json");
    if (!response.ok) throw new Error("ニュース読み込み失敗");

    newsItems = await response.json();

    renderNews();
    renderHomeNews();

    document.getElementById("newsCount").textContent = newsItems.length;

  } catch (error) {
    console.error(error);
    document.getElementById("newsList").innerHTML =
      '<div class="empty-state">お知らせを読み込めませんでした。</div>';
  }
}

function renderNews() {
  const container = document.getElementById("newsList");

  const sorted = [...newsItems].sort((a, b) =>
    (b.date || "").localeCompare(a.date || "")
  );

  container.innerHTML = sorted.length
    ? sorted.map(createNewsItem).join("")
    : '<div class="empty-state">現在、お知らせはありません。</div>';
}

function renderHomeNews() {
  const container = document.getElementById("homeNews");

  const sorted = [...newsItems]
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .slice(0, 3);

  container.innerHTML = sorted.length
    ? sorted.map(createNewsItem).join("")
    : '<div class="empty-state">現在、お知らせはありません。</div>';
}

function createNewsItem(item) {
  return `
    <article class="news-item">
      <div class="news-date">${formatDate(item.date)}</div>
      <div>
        <span class="tag">${escapeHtml(item.category || "NEWS")}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.description || "")}</p>
      </div>
    </article>
  `;
}
