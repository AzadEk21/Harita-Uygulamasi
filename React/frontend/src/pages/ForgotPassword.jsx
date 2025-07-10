import React, { useState } from "react";
import axios from "../utils/axiosWithAuth";
import { showPopup } from "../openlayers/popup";
import "../App.css";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const isEmailValid = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEmailValid(email)) {
      showPopup("Lütfen geçerli bir e-posta adresi girin.", "error");
      return;
    }

    try {
      await axios.post("/auth/forgot-password", { email });
      showPopup("Şifre sıfırlama e-postası gönderildi.", "success");
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || "İşlem sırasında hata oluştu.";
      showPopup(errorMessage, "error");
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Şifre Sıfırla</h2>

      {/* 🟡 Açıklayıcı metin */}
      <p style={{ fontSize: "14px", marginBottom: "10px", color: "#555" }}>
        Kayıtlı e-posta adresinizi giriniz. Şifre sıfırlama bağlantısı e-posta adresinize gönderilecektir.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Kayıtlı e-posta adresiniz"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ color: "black" }}
        />
        <button type="submit">Gönder</button>

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
          Geri Dön
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
