import axios from "../utils/axiosWithAuth";
import { showPopup } from "./popup";
import { loadPoints } from "./loadPoints";
import { jsPanel } from "jspanel4";
import "jspanel4/es6module/jspanel.min.css";

export function deletePoint(id) {
  if (!id) return;

  jsPanel.create({
    headerTitle: "SİLME ONAYI",
    content: `
      <p>Bu kaydı silmek istediğinizden emin misiniz?</p>
      <div style="margin-top:12px;">
        <button id="btn-confirm-delete">Evet, Sil</button>
        <button id="btn-cancel-delete">İptal</button>
      </div>
    `,
    panelClass: "blue-panel-theme",
    position: "center-top 100 180",
    panelSize: "400 auto",
    callback: (panel) => {
      document.getElementById("btn-confirm-delete").onclick = async () => {
        try {
          const res = await axios.delete(`/point/${id}`);
          if (res.status !== 204 && res.status !== 200) {
            throw new Error("Silme başarısız");
          }
          showPopup("Kayıt silindi!");
          const refreshRes = await axios.get("/point");
          const data = refreshRes.data;
          loadPoints(data.value);
        } catch (err) {
          console.error("Silme hatası:", err);
          showPopup("Silme başarısız!", "error");
        } finally {
          panel.close();
        }
      };

      document.getElementById("btn-cancel-delete").onclick = () => {
        panel.close();
      };
    },
  });
}
