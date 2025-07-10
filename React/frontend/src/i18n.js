import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          title: "Turkey Map",
          search: "Search",
          searchPlaceholder: "Search by name...",
          shapeType: "Shape Type",
          point: "Point",
          line: "Line",
          polygon: "Polygon",
          addGeometry: "Add Geometry",
          cancelAdd: "Cancel",
          query: "Query",
          profile: "Profile",
          adminPanel: "Admin Panel",
          geometryPanel: "Geometry Panel",
          userPanel: "User Panel",
          login: "Login",
          logout: "Logout",
          email: "Email",
          password: "Password",
          welcome: "Welcome"
        }
      },
      tr: {
        translation: {
          title: "Türkiye Haritası",
          search: "Ara",
          searchPlaceholder: "İsim Ara...",
          shapeType: "Şekil Türü",
          point: "Nokta",
          line: "Çizgi",
          polygon: "Alan",
          addGeometry: "Şekil Ekle",
          cancelAdd: "Ekleme Kapat",
          query: "Sorgu",
          profile: "Profil",
          adminPanel: "Admin Paneli",
          geometryPanel: "Geometri Paneli",
          userPanel: "Kullanıcı Paneli",
          login: "Giriş Yap",
          logout: "Çıkış Yap",
          email: "E-posta",
          password: "Şifre",
          welcome: "Hoş geldin"
        }
      }
    },
    fallbackLng: "tr",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
