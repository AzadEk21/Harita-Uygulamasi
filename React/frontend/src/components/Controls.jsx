import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { startAddFeature, stopAddFeature } from "../openlayers/addpoints";
import { manualSearchByInput, enableAutoSearch } from "../openlayers/search";
import { openQueryPanel } from "../openlayers/query";
import { Link } from "react-router-dom";
import { openGeometryPanel } from "../openlayers/geometryPanel";
import { openUserPanel } from "../pages/userPanel";
import { openProfilePanel } from "../openlayers/profilePanel";
import "./controls.css";

const Controls = ({ onLoginClick }) => {
  const [adding, setAdding] = useState(false);
  const [geometryType, setGeometryType] = useState("Point");
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    enableAutoSearch("searchInput", "searchSuggestions");
  }, []);

  const toggleAdd = () => {
    if (adding) stopAddFeature();
    else startAddFeature(geometryType);
    setAdding(!adding);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="navbar">
      <div className="title">Türkiye Haritası</div>

      {/* ARAMA BÖLÜMÜ */}
      <div className="search-container">
        <input
          id="searchInput"
          name="searchInput" // özgün bir name
          type="text"
          placeholder="İsim Ara..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        <button onClick={() => manualSearchByInput("searchInput")}>Ara</button>
        <ul id="searchSuggestions"></ul>
      </div>

      <div className="controls">
        <label htmlFor="type">Şekil Türü:</label>
        <select
          id="type"
          value={geometryType}
          onChange={(e) => setGeometryType(e.target.value)}
        >
          <option value="Point">Nokta</option>
          <option value="LineString">Çizgi</option>
          <option value="Polygon">Alan</option>
        </select>

        <button onClick={toggleAdd}>
          {adding ? "Ekleme Kapat" : "Şekil Ekle"}
        </button>

        <button onClick={openQueryPanel}>Sorgu</button>
        <button
          onClick={openProfilePanel}
          style={{
            marginLeft: "10px",
            backgroundColor: "#6c63ff",
            color: "white",
          }}
        >
          Profil
        </button>

        {/* 🛡️ Admin Paneli Dropdown */}
        {user?.role === "Admin" && (
          <div className="admin-dropdown-wrapper">
            <button
              onClick={() => setAdminMenuOpen(!adminMenuOpen)}
              className="admin-toggle-btn"
            >
              Admin Paneli
            </button>
            {adminMenuOpen && (
              <div className="admin-dropdown">
                <button
                  onClick={() => {
                    openGeometryPanel();
                    setAdminMenuOpen(false);
                  }}
                >
                  Geometri Paneli
                </button>
                <button
                  onClick={() => {
                    openUserPanel();
                    setAdminMenuOpen(false);
                  }}
                >
                  Kullanıcı Paneli
                </button>
              </div>
            )}
          </div>
        )}

        {/* GİRİŞ/ÇIKIŞ */}
        {user ? (
          <>
            <span style={{ marginLeft: "10px" }}>
              Hoş geldin, <strong>{user.username}</strong>
            </span>
            <button onClick={handleLogout} style={{ marginLeft: "10px" }}>
              Çıkış Yap
            </button>
          </>
        ) : (
          <Link to="/login">
            <button style={{ backgroundColor: "#007bff", color: "white" }}>
              Giriş Yap
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Controls;
