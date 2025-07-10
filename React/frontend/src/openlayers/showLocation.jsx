import { map } from "./map";
import WKT from "ol/format/WKT";
import { getCenter } from "ol/extent";
import Overlay from "ol/Overlay";

import { store } from "../app/store";
const user = store.getState().auth.user;

let popupOverlay;

export function showLocationOnMap(
  wktGeometry,
  name = "Bilinmiyor",
  username = "-"
) {
  if (!wktGeometry) return;

  const format = new WKT();
  let feature;

  try {
    feature = format.readFeature(wktGeometry, {
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857",
    });
  } catch (error) {
    console.error("WKT okunamadı:", error);
    return;
  }

  const geometry = feature.getGeometry();
  const center =
    geometry.getType() === "Point"
      ? geometry.getCoordinates()
      : getCenter(geometry.getExtent());

  map.getView().animate({
    center: center,
    zoom: 8,
    duration: 1500,
  });

  if (popupOverlay) {
    map.removeOverlay(popupOverlay);
    popupOverlay = null;
  }

  const popup = document.createElement("div");
  popup.className = "map-popup";
  popup.innerHTML = `
    <b>Ad:</b> ${name}<br/>
    ${user?.role === "Admin" ? `<b>Ekleyen:</b> ${username}` : ""}
  `;

  popupOverlay = new Overlay({
    element: popup,
    positioning: "bottom-center",
    stopEvent: false,
    offset: [0, -12],
  });

  popupOverlay.setPosition(center);
  map.addOverlay(popupOverlay);

  map.once("click", () => {
    if (popupOverlay) {
      map.removeOverlay(popupOverlay);
      popupOverlay = null;
    }
  });
}
