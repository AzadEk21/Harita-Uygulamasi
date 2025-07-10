import Modify from "ol/interaction/Modify";
import Collection from "ol/Collection";
import WKT from "ol/format/WKT";
import { map } from "./map";
import { loadPoints } from "./loadPoints";
import { showPopup } from "./popup";
import { jsPanel } from "jspanel4";
import "jspanel4/es6module/jspanel.min.css";
import axios from "../utils/axiosWithAuth";

let modifyInteraction = null;
let activePanel = null;


export function updateFeatureViaMap(feature, onFinish = () => {}) {
  if (!feature) return;

  jsPanel.create({
    headerTitle: "GÜNCELLEME TÜRÜ",
    content: `
      <p>Güncellemeyi nasıl yapmak istersiniz?</p>
      <div style="margin-top:12px;">
        <button id="btn-manual">Manuel</button>
        <button id="btn-map">Harita Üzerinden</button>
      </div>
    `,
    panelClass: "blue-panel-theme",
    position: "center",
    panelSize: { width: 400, height: "auto" },
    callback: (panel) => {
      document.getElementById("btn-manual").onclick = () => {
        panel.close();
        openManualUpdatePanel(feature, onFinish);
      };

      document.getElementById("btn-map").onclick = () => {
        panel.close();
        openMapUpdatePanel(feature, onFinish);
      };
    },
  });
}


function openManualUpdatePanel(feature, onFinish) {
  const currentName = feature.get("name") || "";
  const currentId = feature.get("id") || "";
  const format = new WKT();
  const geometry = feature.getGeometry().clone();
  geometry.transform("EPSG:3857", "EPSG:4326");
  const currentWKT = format.writeGeometry(geometry);

  jsPanel.create({
    headerTitle: "MANUEL GÜNCELLEME",
    content: `
      <input type="hidden" id="update-id" value="${currentId}" />
      <label style="color:black;">İsim:</label>
      <input type="text" id="update-name" value="${currentName}" style="color:black; background:white;" /><br/><br/>
      <label style="color:black;">WKT:</label>
      <textarea id="update-wkt" style="width:100%; height:80px; color:black; background:white;">${currentWKT}</textarea>
      <div style="margin-top:12px;">
        <button id="btn-save-manual">Kaydet</button>
        <button id="btn-cancel-manual">İptal</button>
      </div>
    `,
    panelClass: "blue-panel-theme",
    position: "center",
    panelSize: "500 auto",
    callback: (panel) => {
      document.getElementById("btn-save-manual").onclick = () => {
        const updatedName = document.getElementById("update-name").value.trim();
        const updatedWKT = document.getElementById("update-wkt").value.trim();

        axios
          .put(`/point/${currentId}`, {
            id: currentId,
            name: updatedName,
            geometry: updatedWKT,
          })
          .then(() => {
            showPopup("Manuel güncelleme başarılı!");
            loadPoints();
            panel.close();
            onFinish();
          })
          .catch((err) => {
            console.error("Hata:", err);
            showPopup("Manuel güncelleme başarısız!", "error");
          });
      };

      document.getElementById("btn-cancel-manual").onclick = () => {
        panel.close();
      };
    },
  });
}


function openMapUpdatePanel(feature, onFinish) {
  const originalGeometry = feature.getGeometry().clone();

  if (modifyInteraction) {
    map.removeInteraction(modifyInteraction);
    modifyInteraction = null;
  }

  modifyInteraction = new Modify({
    features: new Collection([feature]),
  });

  map.addInteraction(modifyInteraction);

  if (activePanel) {
    activePanel.close();
  }

  activePanel = jsPanel.create({
    headerTitle: "HARİTA ÜZERİNDEN GÜNCELLE",
    content: `
      <p>Sürükleyerek yeni konumu belirleyin.</p>
      <div style="margin-top:12px;">
        <button id="btn-save-map">Kaydet</button>
        <button id="btn-cancel-map">İptal</button>
      </div>
    `,
    panelClass: "blue-panel-theme",
    position: "right-top",
    panelSize: { width: 300, height: "auto" },
    callback: (panel) => {
      activePanel = panel;

      document.getElementById("btn-save-map").onclick = () => {
        const format = new WKT();
        const tempFeature = feature.clone();
        tempFeature.getGeometry().transform("EPSG:3857", "EPSG:4326");

        const updatedWKT = format.writeFeature(tempFeature);
        const updatedName = feature.get("name") || "";
        const pointId = feature.get("id");

        axios
        .put(`/point/${pointId}`, {
          id: pointId,
          geometry: updatedWKT,
          name: updatedName,
        })
        .then(async () => {
          const res = await axios.get("/point");
          loadPoints(res.data.value); 
          showPopup("Haritadan güncelleme başarılı!");
          panel.close();
          onFinish();
        })
      
          .catch((err) => {
            console.error("Güncelleme hatası:", err);
            showPopup("Güncelleme başarısız!", "error");
          })
          .finally(() => {
            map.removeInteraction(modifyInteraction);
            modifyInteraction = null;
          });
      };

      document.getElementById("btn-cancel-map").onclick = () => {
        feature.setGeometry(originalGeometry);
        map.removeInteraction(modifyInteraction);
        modifyInteraction = null;
        panel.close();
      };
    },
  });
}
