import { jsPanel } from "jspanel4";
import "jspanel4/es6module/jspanel.min.css";
import axios from "../utils/axiosWithAuth";
import { showLocationOnMap } from "./showLocation";
import { deletePoint } from "./deletePoint";
import { showPopup } from "./popup";
import { loadPoints } from "./loadPoints";

export function openGeometryPanel() {
  jsPanel.create({
    headerTitle: "KAYITLI GEOMETRİLER",
    panelSize: "800 auto",
    position: "center-top 0 100",
    borderRadius: 12,
    callback: async (panel) => {
      try {
        const res = await axios.get("/point");
        const points = res.data.value || [];

        panel.content.innerHTML = `
          <table style="width:100%; border-collapse: collapse; font-family: sans-serif;">
            <thead style="background:#f0f0f0;">
              <tr>
                <th style="${thStyle}">Ad</th>
                <th style="${thStyle}">Geometri Türü</th>
                <th style="${thStyle}">Ekleyen</th>
                <th style="${thStyle}">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              ${points
                .map(
                  (p) => `
                <tr>
                  <td style="${tdStyle}">${p.name}</td>
                  <td style="${tdStyle}">${p.geometry.split("(")[0]}</td>
                  <td style="${tdStyle}">${p.username || "-"}</td>
                  <td style="${tdStyle}">
                    <button class="btn-show" 
                            data-wkt="${p.geometry}" 
                            data-name="${p.name || "Bilinmiyor"}" 
                            data-username="${p.username || "-"}">Göster</button>
                    <button class="btn-edit" data-id="${p.id}">Güncelle</button>
                    <button class="btn-delete" data-id="${p.id}">Sil</button>
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        `;

        // GÖSTERME
        panel.content.querySelectorAll(".btn-show").forEach((btn) => {
          btn.onclick = () => {
            const wkt = btn.dataset.wkt;
            const name = btn.dataset.name;
            const username = btn.dataset.username;
            showLocationOnMap(wkt, name, username);
            panel.close();
          };
        });

        // SİLME
        panel.content.querySelectorAll(".btn-delete").forEach((btn) => {
          btn.onclick = () => {
            const pointId = btn.dataset.id;
            panel.close();
            deletePoint(pointId);
          };
        });

        // GÜNCELLEME
        panel.content.querySelectorAll(".btn-edit").forEach((btn) => {
          btn.onclick = async () => {
            const id = parseInt(btn.dataset.id);
            const point = points.find((p) => p.id === id);
            if (!point) return;

            panel.close();

            const WKT = (await import("ol/format/WKT")).default;
            const format = new WKT();
            const olFeature = format.readFeature(point.geometry, {
              dataProjection: "EPSG:4326",
              featureProjection: "EPSG:3857",
            });

            olFeature.set("id", point.id);
            olFeature.set("name", point.name);

            const { updateFeatureViaMap } = await import("./updatePoint");

            updateFeatureViaMap(olFeature, async () => {
              try {
                const updated = await axios.get("/point");
                loadPoints(updated.data.value);
                openGeometryPanel();
              } catch (e) {
                console.error("Veri yüklenemedi", e);
                showPopup("Güncellenen veriler yüklenemedi", "error");
              }
            });
          };
        });
      } catch (err) {
        showPopup("Geometriler alınamadı", "error");
        console.error(err);
      }
    },
  });
}

const thStyle = "padding: 8px; border: 1px solid #ccc; text-align: left;";
const tdStyle = "padding: 6px; border: 1px solid #ddd;";
