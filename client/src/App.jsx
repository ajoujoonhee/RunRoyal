// client/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import RunCreate from "./pages/RunCreate";

export default function App() {
  return (
    <Routes>
      {/* 로그인 페이지 */}
      <Route path="/login" element={<Login />} />

      {/* 🔐 보호된 페이지 (Outlet 방식) */}
      <Route element={<ProtectedRoute />}>
        {/* 메인 대시보드 */}
        <Route path="/" element={<Dashboard />} />

        {/* 러닝 기록 업로드 개별 페이지 (선택 사항, 이미 만들었으면 사용) */}
        <Route path="/runs/new" element={<RunCreate />} />
      </Route>

      {/* 잘못된 주소 접근하면 "/"로 보내기 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
