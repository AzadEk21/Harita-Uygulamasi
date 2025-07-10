import { jsPanel } from "jspanel4";
import "jspanel4/es6module/jspanel.min.css";
import axios from "../utils/axiosWithAuth";
import { showPopup } from "./popup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import ReactDOMServer from "react-dom/server";
import "../App.css"; // CSS dosyası

export function openProfilePanel() {
  jsPanel.create({
    headerTitle: "PROFİL PANELİ",
    panelClass: "blue-panel-theme",
    position: "center-top 0 70",
    contentSize: "700 auto",
    contentStyle: "max-height: 90vh; overflow-y: auto;",

    content: `<div id="profile-content" style="padding:20px;font-family:sans-serif;">Yükleniyor...</div>`,

    callback: async function (panel) {
      const container = panel.content.querySelector("#profile-content");
      try {
        const res = await axios.get("/user/me");
        const user = res.data;

        container.innerHTML = `
  <div style="text-align:center">
    <img id="profileImage" src="data:image/jpeg;base64,${
      user.profileImageBase64 || ""
    }" 
         alt="Profil Fotoğrafı" style="width:100px;height:100px;border-radius:50%;margin-bottom:10px;object-fit:cover;" />
    <p style="margin-top:6px;font-size:16px;"><strong>Kullanıcı Adı:</strong> ${
      user.username
    }</p>
  </div>

  <hr style="margin:20px 0"/>

  <div style="margin-top:10px">
    <label style="font-weight:bold;">Yeni Profil Fotoğrafı</label>
    <p style="font-size:13px;color:gray;margin:4px 0 10px;">Sadece resim dosyaları (.jpg, .png, .jpeg)</p>
    <label for="photoInput" style="
      display:inline-block;
      padding:8px 16px;
      background:linear-gradient(to right, #0072ff, #00c6ff);
      color:white;
      border-radius:8px;
      cursor:pointer;
      font-weight:bold;
    ">
      Dosya Seç
    </label>
    <input type="file" id="photoInput" accept="image/*" style="display:none;" />
  </div>

  <hr style="margin:24px 0"/>

  <div>
    <h4 style="margin-bottom:10px;">Şifre Değiştir</h4>

    <label for="oldPassword" style="font-weight:bold;">Eski Şifre:</label><br>
    <div class="password-wrapper">
      <input type="password" id="oldPassword" placeholder="Eski Şifre"
             class="password-input" autocomplete="current-password" />
      <span id="toggleOld" class="password-toggle-icon">
        ${ReactDOMServer.renderToStaticMarkup(<FontAwesomeIcon icon={faEye} />)}
      </span>
    </div>

    <label for="newPassword" style="font-weight:bold;margin-top:12px;">Yeni Şifre:</label><br>
    <div class="password-wrapper">
      <input type="password" id="newPassword" placeholder="Yeni Şifre"
             class="password-input" autocomplete="new-password" />
      <span id="toggleNew" class="password-toggle-icon">
        ${ReactDOMServer.renderToStaticMarkup(<FontAwesomeIcon icon={faEye} />)}
      </span>
    </div>

    <div class="password-hint" style="margin-top:6px;">
      En az 8 karakter, bir büyük harf, bir küçük harf ve bir rakam içermelidir.
    </div>

    <button id="btn-password-update" class="theme-button" style="margin-top:14px;">
      Şifreyi Güncelle
    </button>
  </div>

  <div style="margin-top:30px;text-align:center">
    <button id="btn-history" class="theme-button secondary">Geometri Geçmişim</button>
  </div>
`;

        const toggleOld = container.querySelector("#toggleOld");
        const toggleNew = container.querySelector("#toggleNew");
        const oldInput = container.querySelector("#oldPassword");
        const newInput = container.querySelector("#newPassword");

        toggleOld.onclick = () => {
          const showing = oldInput.type === "text";
          oldInput.type = showing ? "password" : "text";
          toggleOld.innerHTML = ReactDOMServer.renderToStaticMarkup(
            <FontAwesomeIcon icon={showing ? faEye : faEyeSlash} />
          );
        };

        toggleNew.onclick = () => {
          const showing = newInput.type === "text";
          newInput.type = showing ? "password" : "text";
          toggleNew.innerHTML = ReactDOMServer.renderToStaticMarkup(
            <FontAwesomeIcon icon={showing ? faEye : faEyeSlash} />
          );
        };

        const photoInput = container.querySelector("#photoInput");
        const profileImage = container.querySelector("#profileImage");
        photoInput.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file || !file.type.startsWith("image/")) {
            showPopup("Lütfen geçerli bir resim dosyası seçin", "error");
            return;
          }
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64 = reader.result.split(",")[1];
            await axios.post("/user/photo", { base64Image: base64 });
            profileImage.src = reader.result;
            showPopup("Profil fotoğrafı güncellendi", "success");
          };
          reader.readAsDataURL(file);
        };

        const btnUpdate = container.querySelector("#btn-password-update");
        btnUpdate.onclick = async () => {
          const oldPass = oldInput.value;
          const newPass = newInput.value;

          if (!oldPass || !newPass) {
            showPopup("Lütfen her iki şifre alanını da doldurun", "error");
            return;
          }

          if (oldPass === newPass) {
            showPopup("Yeni şifre eski şifre ile aynı olamaz", "error");
            return;
          }

          const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
          if (!passRegex.test(newPass)) {
            showPopup("Yeni şifre kurallarına uymuyor.", "error");
            return;
          }

          try {
            await axios.put("/user/password", {
              oldPassword: oldPass,
              newPassword: newPass,
            });
            showPopup("Şifre değiştirildi", "success");
            oldInput.value = "";
            newInput.value = "";
          } catch (e) {
            showPopup(
              e.response?.data || "Şifre güncelleme başarısız",
              "error"
            );
          }
        };

        const btnHistory = container.querySelector("#btn-history");
        btnHistory.onclick = async () => {
          try {
            const res = await axios.get("/point");
            const currentUser = user.username;
            const list = res.data.value?.filter(
              (x) => x.username === currentUser
            );
            const table = list
              .map(
                (item) => `
              <tr>
                <td style='border:1px solid #ddd;padding:6px;'>${item.name}</td>
                <td style='border:1px solid #ddd;padding:6px;'>${
                  item.geometry.split("(")[0]
                }</td>
                <td style='border:1px solid #ddd;padding:6px;'>${new Date(
                  item.createdAt
                ).toLocaleString()}</td>
              </tr>
            `
              )
              .join("");

            jsPanel.create({
              headerTitle: "Geometri Geçmişim",
              content: `
                <div style='padding:15px'>
                  <table style='width:100%;border-collapse:collapse'>
                    <thead>
                      <tr style='background:#f0f0f0'>
                        <th style='border:1px solid #ddd;padding:6px;'>Ad</th>
                        <th style='border:1px solid #ddd;padding:6px;'>Tür</th>
                        <th style='border:1px solid #ddd;padding:6px;'>Tarih</th>
                      </tr>
                    </thead>
                    <tbody>${table}</tbody>
                  </table>
                </div>
              `,
              panelClass: "blue-panel-theme",
              position: "center 70 100",
              contentSize: "700 auto",
              contentStyle: "max-height: 90vh; overflow-y: auto;",
            });
          } catch (err) {
            showPopup("Geçmiş verileri alınamadı", "error");
          }
        };
      } catch (err) {
        container.innerHTML =
          "<p style='color:red'>Profil verileri yüklenemedi.</p>";
        console.error("Profil paneli hatası:", err);
      }

      // 🔽 Bu kısmı buraya ekle
      setTimeout(() => {
        const input = document.getElementById("searchInput");
        if (document.activeElement === input) {
          input.blur();
        }
      }, 50);
    },
  });
}
