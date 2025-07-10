import { map, vectorSource } from "./map";
import { getCenter } from "ol/extent";
import { showPopup } from "./popup";

export function searchFeatures(query) {
  const searchValue = query.trim().toLowerCase();
  const results = [];

  if (!searchValue) return results;

  vectorSource.forEachFeature((feature) => {
    const name = (feature.get("name") || "").toLowerCase();
    if (name.includes(searchValue)) {
      results.push(feature);
    }
  });

  return results;
}

export function zoomToFeature(feature) {
  if (!feature || !feature.getGeometry) return;

  const geometry = feature.getGeometry();
  const center =
    geometry.getType() === "Point"
      ? geometry.getCoordinates()
      : getCenter(geometry.getExtent());

  map.getView().animate({
    center: center,
    zoom: 8,
    duration: 1000,
  });
}

export function enableAutoSearch(
  inputId = "searchInput",
  suggestionId = "searchSuggestions"
) {
  const input = document.getElementById(inputId);
  const suggestionBox = document.getElementById(suggestionId);

  let selectedIndex = -1;
  let currentResults = [];

  input.addEventListener("input", () => {
    const value = input.value.trim().toLowerCase();
    suggestionBox.innerHTML = "";
    selectedIndex = -1;

    if (!value) return;

    const results = searchFeatures(value);
    currentResults = results;

    results.slice(0, 10).forEach((feature, index) => {
      const li = document.createElement("li");
      li.textContent = feature.get("name");
      li.className = "suggestion-item";

      li.onclick = () => {
        input.value = feature.get("name");
        suggestionBox.innerHTML = "";
        zoomToFeature(feature);
      };

      suggestionBox.appendChild(li);
    });
  });

  input.addEventListener("keydown", (e) => {
    const items = suggestionBox.querySelectorAll(".suggestion-item");

    if (e.key === "ArrowDown") {
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
    } else if (e.key === "ArrowUp") {
      selectedIndex = Math.max(selectedIndex - 1, 0);
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && currentResults[selectedIndex]) {
        input.value = currentResults[selectedIndex].get("name");
        zoomToFeature(currentResults[selectedIndex]);
        suggestionBox.innerHTML = "";
        e.preventDefault();
      } else if (input.value.trim() === "") {
        showPopup("İsim giriniz", "error");
      } else {
        const results = searchFeatures(input.value);
        if (results.length > 0) {
          input.value = results[0].get("name");
          zoomToFeature(results[0]);
          suggestionBox.innerHTML = "";
        } else {
          showPopup("Sonuç bulunamadı", "error");
        }
        e.preventDefault();
      }
    }

    items.forEach((el, i) => {
      el.style.backgroundColor =
        i === selectedIndex ? "#cce5ff" : "transparent";
    });
  });
}

export function manualSearchByInput(inputId = "searchInput") {
  const input = document.getElementById(inputId);
  const value = input?.value?.trim()?.toLowerCase();

  if (!value) {
    showPopup("İsim giriniz", "error");
    return;
  }

  const matches = searchFeatures(value);
  if (matches.length > 0) {
    zoomToFeature(matches[0]);
  } else {
    showPopup("Sonuç bulunamadı", "error");
  }
}
