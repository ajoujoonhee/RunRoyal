// client/src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setToken } from "../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      if (mode === "signup") {
        const res = await api.post("/api/auth/signup", {
          email,
          password,
          nickname,
        });
        // 회원가입 후 바로 로그인 상태로 만들고 싶으면:
        setToken(res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        alert("회원가입 성공! 이제 러닝 기록 서비스를 이용해보세요.");
        navigate("/");
      } else {
        const res = await api.post("/api/auth/login", { email, password });
        setToken(res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        alert("로그인 성공!");
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      setErr(error.response?.data?.message || "에러 발생");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        onSubmit={onSubmit}
        className="bg-white w-[350px] p-8 rounded-xl shadow-sm"
      >
        <h1 className="text-3xl font-extrabold mb-6 text-gray-800">
          {mode === "login" ? "로그인" : "회원가입"}
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 rounded mb-3"
        />

        {mode === "signup" && (
          <input
            type="text"
            placeholder="Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded mb-3"
          />
        )}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 rounded mb-4"
        />

        {err && <div className="text-red-500 text-sm mb-3">{err}</div>}

        <button
          type="submit"
          className="w-full py-2 rounded mb-3 bg-black text-white font-semibold hover:bg-gray-900 active:scale-[.99] transition"
        >
          {mode === "login" ? "로그인" : "회원가입"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="w-full border border-gray-300 py-2 rounded text-blue-600 hover:bg-gray-50 transition"
        >
          {mode === "login" ? "회원가입으로 전환" : "로그인으로 전환"}
        </button>
      </form>
    </div>
  );
}
