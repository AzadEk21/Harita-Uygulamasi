import { jsPanel } from "jspanel4";
import "jspanel4/es6module/jspanel.min.css";
import axios from "../utils/axiosWithAuth";
import { showPopup } from "../openlayers/popup";

const thStyle = "padding: 8px; border: 1px solid #ccc; text-align: left;";
const tdStyle = "padding: 6px; border: 1px solid #ddd;";

export function openUserPanel() {
  jsPanel.create({
    headerTitle: "KULLANICI PANELİ",
    panelSize: "750 auto",
    position: "center-top 0 140",
    borderRadius: 12,
    callback: async (panel) => {
      try {
        const res = await axios.get("/user/all");
        const users = res.data || [];

        panel.content.innerHTML = `
          <div style="color:#333; font-family:sans-serif; font-size:14px;">
            <table style="width:100%; border-collapse: collapse;">
              <thead style="background:#f0f0f0;">
                <tr>
                  <th style="${thStyle}">ID</th>
                  <th style="${thStyle}">Kullanıcı Adı</th>
                  <th style="${thStyle}">Rol</th>
                  <th style="${thStyle}">İşlem</th>
                </tr>
              </thead>
              <tbody>
                ${users
                  .map(
                    (u) => `
                  <tr>
                    <td style="${tdStyle}">${u.id}</td>
                    <td style="${tdStyle}">${u.username}</td>
                    <td style="${tdStyle}">
                      <select class="roleSelect" data-id="${u.id}" style="
                        padding: 6px 10px;
                        background: white;
                        border: 1px solid #ccc;
                        border-radius: 6px;
                        font-size: 14px;
                        color: #333;
                        min-width: 100px;
                      ">
                        <option value="User" ${
                          u.role === "User" ? "selected" : ""
                        }>User</option>
                        <option value="Admin" ${
                          u.role === "Admin" ? "selected" : ""
                        }>Admin</option>
                      </select>
                    </td>
                    <td style="${tdStyle}; border-left: 1px solid #ddd;">
                      <button class="btn-delete" data-id="${
                        u.id
                      }" style="margin-left:6px;">Sil</button>
                    </td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `;

        panel.content.querySelectorAll(".roleSelect").forEach((select) => {
          select.onchange = () => {
            const id = select.dataset.id;
            const newRole = select.value;
            const username = select.closest("tr").children[1].textContent;

            jsPanel.create({
              headerTitle: "ROL DEĞİŞİKLİĞİ ONAYI",
              content: `
                <div style="padding: 16px; font-family: sans-serif;">
                  <p style="margin-bottom: 20px;">
                    <strong>${username}</strong> adlı kullanıcının rolünü <strong>${newRole}</strong> olarak değiştirmek istiyor musunuz?
                  </p>
                  <div style="display: flex; justify-content: flex-end; gap: 12px;">
                    <button id="btn-confirm-role" style="
                      padding: 8px 16px;
                      background: linear-gradient(to bottom, #00aaff, #007bff);
                      border: none;
                      color: white;
                      font-weight: bold;
                      border-radius: 8px;
                      min-width: 100px;
                      cursor: pointer;
                    ">Evet</button>
        
                    <button id="btn-cancel-role" style="
                      padding: 8px 16px;
                      background: linear-gradient(to bottom, #00aaff, #007bff);
                      border: none;
                      color: white;
                      font-weight: bold;
                      border-radius: 8px;
                      min-width: 100px;
                      cursor: pointer;
                    ">İptal</button>
                  </div>
                </div>
              `,
              panelClass: "blue-panel-theme",
              panelSize: "420 auto",
              position: "center-top 0 250",
              borderRadius: 12,
              callback: (confirmPanel) => {
                document.getElementById("btn-cancel-role").onclick = () => {
                  confirmPanel.close();
                  openUserPanel();
                };

                document.getElementById("btn-confirm-role").onclick =
                  async () => {
                    try {
                      await axios.put(`/user/${id}/role`, { role: newRole });
                      showPopup("Rol güncellendi", "success");
                    } catch (err) {
                      showPopup("Rol güncellenemedi", "error");
                    } finally {
                      confirmPanel.close();
                    }
                  };
              },
            });
          };
        });

        panel.content.querySelectorAll(".btn-delete").forEach((btn) => {
          btn.onclick = () => {
            const userId = btn.dataset.id;
            const username = btn.closest("tr").children[1].textContent;
            panel.close();

            jsPanel.create({
              headerTitle: "SİLME ONAYI",
              content: `
                <div style="padding: 16px; font-family: sans-serif;">
                  <p style="margin-bottom: 20px;">
                    <strong>${username}</strong> adlı kullanıcıyı silmek istediğinizden emin misiniz?
                  </p>
                  <div style="display: flex; justify-content: flex-end; gap: 12px;">
                    <button id="btn-confirm-delete" style="
                      padding: 8px 16px;
                      background: linear-gradient(to bottom, #00aaff, #007bff);
                      border: none;
                      color: white;
                      font-weight: bold;
                      border-radius: 8px;
                      min-width: 100px;
                      cursor: pointer;
                    ">Evet, Sil</button>
            
                    <button id="btn-cancel-delete" style="
                      padding: 8px 16px;
                      background: linear-gradient(to bottom, #00aaff, #007bff);
                      border: none;
                      color: white;
                      font-weight: bold;
                      border-radius: 8px;
                      min-width: 100px;
                      cursor: pointer;
                    ">İptal</button>
                  </div>
                </div>
              `,
              panelClass: "blue-panel-theme",
              panelSize: "400 auto",
              position: "center-top 0 200",
              borderRadius: 12,
              callback: (confirmPanel) => {
                document.getElementById("btn-cancel-delete").onclick = () => {
                  confirmPanel.close();
                  openUserPanel(); // paneli tekrar aç
                };

                document.getElementById("btn-confirm-delete").onclick =
                  async () => {
                    try {
                      await axios.delete(`/user/${userId}`);
                      showPopup(`"${username}" silindi`, "success");
                    } catch (err) {
                      console.error(err);
                      showPopup("Kullanıcı silinemedi", "error");
                    } finally {
                      confirmPanel.close();
                      openUserPanel(); // güncel verilerle tekrar aç
                    }
                  };
              },
            });
          };
        });
      } catch (err) {
        console.error(err);
        showPopup("Kullanıcılar alınamadı", "error");
      }
    },
  });
}
