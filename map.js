
let raceMap = null;
let raceMarkers = [];
let searchCenter = null;

function initializeRaceMap() {
  if (raceMap) {
    updateNearbyRaces();
    return;
  }

  const container = document.getElementById("mapContainer");
  if (!container || !window.L) return;

  raceMap = L.map("mapContainer").setView([36.2048, 138.2529], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(raceMap);

  searchCenter = {
    lat: 36.2048,
    lng: 138.2529
  };

  updateNearbyRaces();

  setTimeout(() => raceMap.invalidateSize(), 200);
}

function clearRaceMarkers() {
  raceMarkers.forEach(marker => raceMap.removeLayer(marker));
  raceMarkers = [];
}

function updateNearbyRaces() {
  if (!raceMap || !searchCenter) return;

  clearRaceMarkers();

  const radius = Number(document.getElementById("radiusSelect").value);

  const nearby = races
    .filter(r => Number.isFinite(Number(r.latitude)) &&
                 Number.isFinite(Number(r.longitude)))
    .map(r => ({
      ...r,
      distance: getDistance(
        searchCenter.lat,
        searchCenter.lng,
        Number(r.latitude),
        Number(r.longitude)
      )
    }))
    .filter(r => r.distance <= radius)
    .sort((a, b) => a.distance - b.distance);

  nearby.forEach(race => {
    const marker = L.marker([
      Number(race.latitude),
      Number(race.longitude)
    ]).addTo(raceMap);

    marker.bindPopup(`
      <strong>${escapeHtml(race.name)}</strong><br>
      ${escapeHtml(race.prefecture || "")}
      ${escapeHtml(race.city || "")}<br>
      ${formatDate(race.date)}<br>
      距離：約${race.distance.toFixed(1)} km
      ${race.url
        ? `<br><a href="${escapeHtml(race.url)}" target="_blank" rel="noopener noreferrer">公式情報</a>`
        : ""}
    `);

    raceMarkers.push(marker);
  });

  renderNearbyRaces(nearby);

  const status = document.getElementById("mapStatus");
  if (status) {
    status.textContent = `${radius} km以内：${nearby.length}件`;
  }
}

function renderNearbyRaces(list) {
  const container = document.getElementById("nearbyRaces");
  if (!container) return;

  container.innerHTML = list.length
    ? list.map(race => `
      <article class="race-card">
        <span class="race-date">${formatDate(race.date)}</span>
        <h3>${escapeHtml(race.name)}</h3>
        <p class="race-location">
          📍 ${escapeHtml(race.prefecture || "")}
          ${escapeHtml(race.city || "")}
        </p>
        <p class="race-description">
          現在の検索地点から約${race.distance.toFixed(1)} km
        </p>
        <button class="button secondary"
          onclick="focusRaceOnMap(races.find(r => r.id === '${escapeHtml(race.id)}'))">
          地図で確認
        </button>
      </article>
    `).join("")
    : '<div class="empty-state">この検索範囲に登録大会はありません。</div>';
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const rad = v => v * Math.PI / 180;

  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) *
    Math.cos(rad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function searchMapLocation() {
  const query = document.getElementById("locationSearch").value.trim();

  if (!query) {
    showToast("検索する場所を入力してください");
    return;
  }

  try {
    showToast("場所を検索しています...");

    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");
    url.searchParams.set("q", query);

    const response = await fetch(url);
    if (!response.ok) throw new Error("検索に失敗しました");

    const results = await response.json();

    if (!results.length) {
      showToast("場所が見つかりませんでした");
      return;
    }

    setMapCenter(Number(results[0].lat), Number(results[0].lon), 9);
    showToast("場所を検索しました");

  } catch (error) {
    console.error(error);
    showToast("場所の検索に失敗しました");
  }
}

function setMapCenter(lat, lng, zoom = 9) {
  searchCenter = { lat, lng };

  if (!raceMap) initializeRaceMap();

  raceMap.setView([lat, lng], zoom);

  L.circle([lat, lng], {
    radius: 1000,
    color: "#3489ff",
    fillOpacity: 0.08
  }).addTo(raceMap);

  updateNearbyRaces();
}

function focusRaceOnMap(race) {
  if (!race || !raceMap) return;

  const lat = Number(race.latitude);
  const lng = Number(race.longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

  raceMap.setView([lat, lng], 11);

  const marker = L.marker([lat, lng]).addTo(raceMap);
  marker.bindPopup(escapeHtml(race.name)).openPopup();

  setTimeout(() => raceMap.removeLayer(marker), 10000);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchLocation")
    ?.addEventListener("click", searchMapLocation);

  document.getElementById("locationSearch")
    ?.addEventListener("keydown", event => {
      if (event.key === "Enter") searchMapLocation();
    });

  document.getElementById("useLocation")
    ?.addEventListener("click", () => {
      if (!navigator.geolocation) {
        showToast("このブラウザは位置情報に対応していません");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          setMapCenter(
            position.coords.latitude,
            position.coords.longitude,
            10
          );

          showToast("現在地を取得しました");
        },
        () => showToast("位置情報を取得できませんでした"),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });

  document.getElementById("radiusSelect")
    ?.addEventListener("change", updateNearbyRaces);
});
