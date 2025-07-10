import axios from "axios";

const instance = axios.create({
  baseURL: "https://localhost:7261/api",
});

instance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn("Token okunurken hata:", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
