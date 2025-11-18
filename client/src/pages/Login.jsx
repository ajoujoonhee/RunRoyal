import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setToken } from "../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      // ✅ 예전처럼 /api/auth/... 사용
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const payload =
        mode === "login" ? { email, password } : { email, password, nickname };

      const { data } = await api.post(url, payload);

      // ✅ 예전처럼 토큰/유저 저장 + setToken 호출
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);

      navigate("/");
    } catch (e) {
      setErr(e?.response?.data?.message || "요청 실패");
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        onSubmit={submit}
        className="bg-white w-[350px] p-8 rounded-xl shadow-sm"
      >
        <h1 className="text-3xl font-extrabold mb-6 text-gray-800">
          {mode === "login" ? "로그인" : "회원가입"}
        </h1>

        <input
          className="border border-gray-300 rounded w-full px-3 py-2 mb-3"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {mode === "signup" && (
          <input
            className="border border-gray-300 rounded w-full px-3 py-2 mb-3"
            placeholder="Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        )}

        <input
          className="border border-gray-300 rounded w-full px-3 py-2 mb-3"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {err && <div className="text-red-500 text-sm mb-2">{err}</div>}

        {/* ▶ 항상 진하게 보이는 버튼 */}
        <button
          type="submit"
          className="w-full py-2 rounded mb-3 bg-black text-white font-semibold hover:bg-gray-900 active:scale-[.99] transition"
        >
          {mode === "login" ? "로그인" : "회원가입"}
        </button>

        <button
          type="button"
          className="w-full border border-gray-300 py-2 rounded text-blue-600 hover:bg-gray-50 transition"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "회원가입으로 전환" : "로그인으로 전환"}
        </button>
      </form>
    </div>
  );
}
