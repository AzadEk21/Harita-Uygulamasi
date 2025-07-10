import Draw from "ol/interaction/Draw";
import Snap from "ol/interaction/Snap";
import { map, vectorSource } from "./map";
import WKT from "ol/format/WKT";
import { loadPoints } from "./loadPoints";
import { showPopup } from "./popup";
import { jsPanel } from "jspanel4";
import "jspanel4/es6module/jspanel.min.css";

let draw, snap;

export function startAddFeature(type = "Point") {
  draw = new Draw({ source: vectorSource, type });
  snap = new Snap({ source: vectorSource });
  map.addInteraction(draw);
  map.addInteraction(snap);

  draw.once("drawend", function (event) {
    map.removeInteraction(draw);
    map.removeInteraction(snap);

    const drawnFeature = event.feature;
    drawnFeature.set("temp", true);
    vectorSource.removeFeature(drawnFeature);

    const format = new WKT();
    const clone = drawnFeature.clone();
    clone.getGeometry().transform("EPSG:3857", "EPSG:4326");
    const wkt = format.writeFeature(clone);

    jsPanel.create({
      headerTitle: "Yeni Şekil Ekle",
      content: `
        <label>İsim Girin:</label><br/>
        <input type="text" id="feature-name" placeholder="Örn: Okul"
        style="margin-top:6px; padding:6px; width:95%; border:1px solid black; color: black;"/>

        <div style="margin-top:12px;">
          <button id="btn-add">Ekle</button>
          <button id="btn-cancel">İptal</button>
        </div>
      `,
      panelClass: "blue-panel-theme",
      position: "center-top 100 180",
      panelSize: "400 auto",
      callback: (panel) => {
        document.getElementById("btn-add").onclick = async () => {
          const name = document.getElementById("feature-name").value.trim();
          if (!name) {
            showPopup("İsim girilmedi!", "error");
            return;
          }

          try {
            const response = await fetch("https://localhost:7261/api/point", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("token"),
              },
              body: JSON.stringify({ geometry: wkt, name }),
            });

            if (!response.ok) {
              const errText = await response.text();
              throw new Error(errText || response.statusText);
            }

            const result = await response.json();
            console.log("Sunucu yanıtı:", result); 

            showPopup("Ekleme başarılı!");
            loadPoints();
            panel.close();
          } catch (err) {
            console.error("Ekleme hatası:", err);
            showPopup("Ekleme başarısız!", "error");
          }
        };

        document.getElementById("btn-cancel").onclick = () => {
          panel.close();
        };
      },
    });
  });
}

export function stopAddFeature() {
  map.removeInteraction(draw);
  map.removeInteraction(snap);
}
