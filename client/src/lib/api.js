// client/src/lib/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
  withCredentials: false,
});

// 현재 메모리에 보관할 토큰 (선택 사항)
let token = localStorage.getItem("token") || null;

export function setToken(newToken) {
  token = newToken;
  if (newToken) {
    localStorage.setItem("token", newToken);
  } else {
    localStorage.removeItem("token");
  }
}

// 요청마다 Authorization 헤더에 토큰 자동 추가
api.interceptors.request.use((config) => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
