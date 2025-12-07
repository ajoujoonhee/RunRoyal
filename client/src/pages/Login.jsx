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
        setToken(res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        alert("회원가입이 완료되었습니다! 자동 로그인 됩니다.");
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
      setErr(error.response?.data?.message || "요청 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-800 to-slate-900 flex items-center justify-center px-4 py-10 text-white">
      <div className="w-full max-w-5xl grid lg:grid-cols-5 gap-6 items-center">
        <div className="lg:col-span-3 rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-2xl">
          <p className="text-xs uppercase tracking-[0.25em] text-white/70">RunRoyale</p>
          <h1 className="text-3xl lg:text-4xl font-extrabold mt-2">
            {mode === "login" ? "다시 달리러 오신 걸 환영해요!" : "함께 뛸 준비 되셨나요?"}
          </h1>
          <p className="text-white/80 text-sm mt-3">
            기록을 쌓고, 대결하고, 리더보드에서 순위를 확인하세요. 한 번의 로그인으로 러닝 여정을 이어가세요.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 mt-6 text-sm">
            <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
              <div className="text-white/70 text-xs">기록 관리</div>
              <div className="font-semibold mt-1">빠른 입력 & 분석 차트</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
              <div className="text-white/70 text-xs">대결</div>
              <div className="font-semibold mt-1">봇/유저 실시간 대결</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
              <div className="text-white/70 text-xs">리더보드</div>
              <div className="font-semibold mt-1">주간 순위 & 내 기록</div>
            </div>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="lg:col-span-2 bg-white text-slate-900 w-full p-8 rounded-2xl shadow-xl border border-slate-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{mode === "login" ? "로그인" : "회원가입"}</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
              {mode === "login" ? "Returning" : "New"}
            </span>
          </div>

          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-200"
            />

            {mode === "signup" && (
              <input
                type="text"
                placeholder="Nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full border border-slate-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-200"
              />
            )}

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {err && <div className="text-red-500 text-sm mt-3">{err}</div>}

          <button
            type="submit"
            className="w-full py-2 rounded-lg mt-5 bg-indigo-600 text-white font-semibold hover:bg-indigo-700 active:scale-[.99] transition"
          >
            {mode === "login" ? "로그인" : "회원가입"}
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="w-full mt-2 border border-slate-200 py-2 rounded-lg text-indigo-700 hover:bg-indigo-50 transition"
          >
            {mode === "login" ? "회원가입으로 전환" : "로그인으로 전환"}
          </button>

          <div className="text-xs text-gray-500 mt-3">
            대시보드에서 기록을 추가하고, 대결을 만들고, 리더보드를 확인할 수 있습니다.
          </div>
        </form>
      </div>
    </div>
  );
}
