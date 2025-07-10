import React, { useEffect, useState } from "react";
import axios from "../utils/axiosWithAuth";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../App.css"; // CSS dosyası

const EmailVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Yükleniyor...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("Doğrulama kodu bulunamadı.");
      return;
    }

    axios
      .post("/auth/verify-email", { token })
      .then(() => setStatus("E-posta başarıyla doğrulandı!"))
      .catch(() => setStatus("Doğrulama başarısız."));
  }, [searchParams]);

  return (
    <div style={{ padding: "30px", textAlign: "center" }}>
      <h2>{status}</h2>

      {/* Girişe dön butonu */}
      <button
        onClick={() => navigate("/login")}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          cursor: "pointer",
          fontSize: "15px",
        }}
      >
        Giriş Sayfasına Git
      </button>
    </div>
  );
};

export default EmailVerify;
