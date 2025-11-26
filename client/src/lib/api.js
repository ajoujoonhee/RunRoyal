// client/src/lib/api.js
import axios from "axios";

// .env에
// VITE_API_URL=http://localhost:4000   (로컬)
// 또는
// VITE_API_URL=https://runroyal.onrender.com   (배포)
// 이런 식으로 넣어둔 값을 읽어온다.
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

// 우리 백엔드 라우트가 /api/... 로 시작하니까
// baseURL 뒤에 /api 를 붙여 줌
const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: false,
});

// 현재 메모리에 보관할 토큰
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
