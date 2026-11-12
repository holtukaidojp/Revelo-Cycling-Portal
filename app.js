
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function formatDate(date) {
  if (!date) return "日程未定";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return escapeHtml(date);

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(parsed);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

function navigate() {
  const hash = location.hash || "#home";
  const target = hash.slice(1);

  const validPages = ["home", "races", "map", "manual", "news"];
  const page = validPages.includes(target) ? target : "home";

  document.querySelectorAll(".page").forEach(element => {
    element.classList.toggle("active", element.id === page);
  });

  document.querySelectorAll(".nav-link").forEach(element => {
    element.classList.toggle(
      "active",
      element.getAttribute("href") === `#${page}`
    );
  });

  document.getElementById("navigation")?.classList.remove("open");

  if (page === "map" && raceMap) {
    setTimeout(() => raceMap.invalidateSize(), 100);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("menuToggle")?.addEventListener("click", () => {
    document.getElementById("navigation").classList.toggle("open");
  });

  window.addEventListener("hashchange", navigate);

  navigate();

  await Promise.all([
    loadRaces(),
    loadNews(),
    loadManuals()
  ]);
});
