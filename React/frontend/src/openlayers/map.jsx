import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { fromLonLat } from "ol/proj";
import { getArea, getLength } from "ol/sphere";
import { updateFeatureViaMap } from "./updatePoint";
import { deletePoint } from "./deletePoint";
import { defaults as defaultControls } from "ol/control";
import { jsPanel } from "jspanel4";
import "jspanel4/es6module/jspanel.min.css";

export const vectorSource = new VectorSource();
export const vectorLayer = new VectorLayer({ source: vectorSource });

export const map = new Map({
  target: null,
  layers: [
    new TileLayer({ source: new OSM() }),
    vectorLayer,
  ],
  view: new View({
    center: fromLonLat([35, 39]),
    zoom: 6,
  }),
  controls: defaultControls({ zoom: false, attribution: false, rotate: false }),
});
let currentClickListener = null;

export function setupMapInteractions(user) {
  if (currentClickListener) {
    map.un("singleclick", currentClickListener);
  }

  currentClickListener = function (evt) {
    map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
      if (layer !== vectorLayer || feature.get("temp")) return;

      const name = feature.get("name") || "";
      const id = feature.get("id");
      const username = feature.get("username") || "-";
      const geometry = feature.getGeometry();

      let measurementInfo = "";
      if (geometry.getType() === "Polygon") {
        const area = getArea(geometry);
        measurementInfo = area > 10000
          ? (area / 1000000).toFixed(2) + " km²"
          : area.toFixed(2) + " m²";
      } else if (geometry.getType() === "LineString") {
        const length = getLength(geometry);
        measurementInfo = length > 100
          ? (length / 1000).toFixed(2) + " km"
          : length.toFixed(2) + " m";
      } else {
        measurementInfo = "Ölçüm yok";
      }

      const addedByHtml = user?.role === "Admin"
        ? `<p><strong>Ekleyen:</strong> ${username}</p>`
        : "";

      jsPanel.create({
        headerTitle: "GEOMETRİ BİLGİSİ",
        content: `
          <p><strong>İsim:</strong> ${name}</p>
          <p><strong>Ölçüm:</strong> ${measurementInfo}</p>
          <p><strong>Geometri Türü:</strong> <code>${geometry.getType()}</code></p>
          ${addedByHtml}
          <div style="margin-top:12px; display:flex; gap:10px;">
            <button id="btn-update">Güncelle</button>
            <button id="btn-delete">Sil</button>
          </div>
        `,
        panelClass: "blue-panel-theme",
        headerControls: { maximize: "remove", smallify: "remove" },
        position: "center",
        callback: function (panel) {
          document.getElementById("btn-update").onclick = () => {
            panel.close();
            updateFeatureViaMap(feature);
          };
          document.getElementById("btn-delete").onclick = () => {
            panel.close();
            deletePoint(id);
          };
        },
      });

      return true;
    });
  };
  map.on("singleclick", currentClickListener);
}
