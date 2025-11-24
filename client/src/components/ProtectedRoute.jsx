// client/src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const token = localStorage.getItem("token");

  if (!token) {
    // 로그인 안 되어 있으면 로그인 페이지로
    return <Navigate to="/login" replace />;
  }

  // 통과
  return <Outlet />;
}
