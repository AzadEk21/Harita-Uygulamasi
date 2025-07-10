import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { loginAsync } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { showPopup } from "../openlayers/popup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { getPoints } from "../features/points/pointSlice";
import { vectorSource } from "../openlayers/map";
import "./Login.css";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resultAction = await dispatch(loginAsync(form));
      if (loginAsync.fulfilled.match(resultAction)) {
        vectorSource.clear();
        dispatch(getPoints());

        showPopup("Giriş başarılı!", "success");
        navigate("/");
      } else {
        showPopup("Giriş başarısız. Bilgileri kontrol edin.", "error");
      }
    } catch (err) {
      showPopup("Sunucu hatası.", "error");
    }
  };

  return (
    <div className="login-container">
      <h2>Giriş Yap</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Kullanıcı Adı"
          value={form.username}
          onChange={handleChange}
          required
        />
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Şifre"
            value={form.password}
            onChange={handleChange}
            required
          />
          <FontAwesomeIcon
            icon={showPassword ? faEyeSlash : faEye}
            onClick={() => setShowPassword(!showPassword)}
            className="password-toggle-icon"
          />
        </div>

        {/* Yeni eklenen link görünümünde şifre sıfırlama bağlantısı */}
        <div className="forgot-password-text">
          <span onClick={() => navigate("/forgot-password")}>
            Şifrenizi mi unuttunuz ?
          </span>
        </div>

        <button type="submit">Giriş Yap</button>
        <button type="button" onClick={() => navigate("/register")}>
          Kayıt Ol
        </button>
      </form>
    </div>
  );
};

export default Login;
