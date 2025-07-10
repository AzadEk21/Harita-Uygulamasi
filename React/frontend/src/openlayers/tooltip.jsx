import { map } from "./map";

let isEditing = false;

const tooltip = document.createElement("div");
tooltip.id = "tooltip";
document.body.appendChild(tooltip);

export function setEditingMode(value) {
  isEditing = value;
}

map.on("pointermove", function (evt) {
  if (evt.dragging || isEditing) {
    tooltip.classList.remove("show");
    return;
  }

  const pixel = map.getEventPixel(evt.originalEvent);

  const feature = map.forEachFeatureAtPixel(pixel, (f) => f, {
    hitTolerance: 6,
  });

  if (feature && feature.get("name")) {
    const name = feature.get("name");
    const desc = feature.get("description") || "";

    tooltip.innerHTML = `<strong>${name}</strong>${
      desc ? `<br/><small>${desc}</small>` : ""
    }`;
    tooltip.style.left = `${evt.originalEvent.pageX + 10}px`;
    tooltip.style.top = `${evt.originalEvent.pageY - 30}px`;
    tooltip.classList.add("show");
  } else {
    tooltip.classList.remove("show");
  }
});
