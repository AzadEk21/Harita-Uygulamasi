import { jsPanel } from "jspanel4";
import "jspanel4/es6module/jspanel.min.css";
import { showPopup } from "./popup";
import { updateFeatureViaMap } from "./updatePoint";
import { deletePoint } from "./deletePoint";
import { showLocationOnMap } from "./showLocation";
import { loadPoints } from "./loadPoints";
import axios from "../utils/axiosWithAuth";
import WKT from "ol/format/WKT";

import { store } from "../app/store";
const user = store.getState().auth.user;

export function openQueryPanel() {
  fetch("https://localhost:7261/api/point", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Yetkisiz veya başarısız istek");
      return res.json();
    })
    .then((data) => {
      if (!Array.isArray(data.value)) {
        showPopup("Veriler alınamadı", "error");
        return;
      }

      const ownFeatures = data.value.filter(
        (item) => item.username === user?.username
      );

      const tableRows = ownFeatures
        .map((item) => {
          const geometryType = item.geometry.split("(")[0];
          return `
            <tr>
              <td style="padding:10px; border:1px solid #ddd;">${item.name}</td>
              <td style="padding:10px; border:1px solid #ddd;"><code style="font-size:12px;">${geometryType}</code></td>

              <td style="padding:10px; border:1px solid #ddd;">
                <button class="btn-show geometry-show"
                        data-wkt="${item.geometry}"
                        data-name="${item.name}"
                        data-username="${item.username || "-"}">Göster</button>
                <button class="btn-edit geometry-update"
                        data-id="${item.id}"
                        data-name="${item.name}"
                        data-geometry="${item.geometry}">Güncelle</button>
                <button class="btn-delete geometry-delete" data-id="${
                  item.id
                }">Sil</button>
              </td>
            </tr>
          `;
        })
        .join("");

      const tableHTML = `
        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:14px;">
            <thead>
              <tr style="background:#f2f2f2;">
                <th style="padding:10px; border:1px solid #ddd;">Ad</th>
                <th style="padding:10px; border:1px solid #ddd;">Geometri Türü</th>

                <th style="padding:10px; border:1px solid #ddd;">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      `;

      jsPanel.create({
        headerTitle: "KAYITLI GEOMETRİLER",
        content: tableHTML,
        panelClass: "blue-panel-theme",
        position: "center 0 60",
        panelSize: "700 400",

        callback: function (panel) {
          panel.content.querySelectorAll(".btn-show").forEach((btn) => {
            const wkt = btn.dataset.wkt;
            const name = btn.dataset.name;
            const username = btn.dataset.username;

            btn.onclick = () => {
              showLocationOnMap(
                wkt,
                name,
                user?.role === "Admin" ? username : undefined
              );
              panel.close();
            };
          });

          panel.content.querySelectorAll(".btn-edit").forEach((btn) => {
            const format = new WKT();
            const olFeature = format.readFeature(btn.dataset.geometry, {
              dataProjection: "EPSG:4326",
              featureProjection: "EPSG:3857",
            });

            olFeature.set("id", btn.dataset.id);
            olFeature.set("name", btn.dataset.name);

            btn.onclick = () => {
              panel.close();
              updateFeatureViaMap(olFeature);
            };
          });

          panel.content.querySelectorAll(".btn-delete").forEach((btn) => {
            btn.onclick = () => {
              panel.close();
              deletePoint(btn.dataset.id);
            };
          });
        },

        onclosed: async () => {
          try {
            const res = await axios.get("/point");
            if (Array.isArray(res.data.value)) {
              loadPoints(res.data.value);
            }
          } catch (e) {
            console.error("Veriler yenilenemedi", e);
            showPopup("Harita verileri güncellenemedi", "error");
          }
        },
      });
    })
    .catch((err) => {
      console.error("Sorgu hatası:", err);
      showPopup("Sorgu sırasında hata oluştu.", "error");
    });
}
