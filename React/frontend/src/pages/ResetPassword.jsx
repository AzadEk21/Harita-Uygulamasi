import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "../utils/axiosWithAuth";
import { showPopup } from "../openlayers/popup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "../App.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const isPasswordValid = (password) => {
    return password.length >= 8 && /[A-Z]/.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      showPopup("Geçersiz veya eksik bağlantı.", "error");
      return;
    }

    if (!isPasswordValid(newPassword)) {
      showPopup("Şifre en az 8 karakter ve en az bir büyük harf içermelidir.", "error");
      return;
    }

    try {
      const response = await axios.post("/auth/reset-password", {
        token,
        newPassword,
      });

      if (response.data?.success === false) {
        showPopup(response.data.message || "Token zaten kullanılmış veya geçersiz.", "error");
        return;
      }

      showPopup("Şifre başarıyla sıfırlandı.", "success");
      navigate("/login");
    } catch {
      showPopup("Şifre sıfırlama başarısız.", "error");
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Yeni Şifre Belirle</h2>

      {/* 🔔 Bilgilendirme mesajı */}
      <p className="password-hint">
        Şifre en az <strong>8 karakter</strong> ve en az <strong>bir büyük harf</strong> içermelidir.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="password-wrapper">
          <input
            type={showNewPassword ? "text" : "password"}
            placeholder="Yeni Şifre"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={{ color: "black" }}
          />
          <FontAwesomeIcon
            icon={showNewPassword ? faEyeSlash : faEye}
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="password-toggle-icon"
          />
        </div>

        <button type="submit">Şifreyi Güncelle</button>

        <button
          type="button"
          onClick={() => navigate("/login")}
          style={{
            marginTop: "10px",
            background: "#ccc",
            color: "#333",
            border: "none",
            padding: "10px 16px",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Giriş Sayfasına Dön
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
