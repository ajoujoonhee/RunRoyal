// client/src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import api from "../lib/api";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [distance, setDistance] = useState("");   // km
  const [timeMin, setTimeMin] = useState("");     // 분
  const [timeSecInput, setTimeSecInput] = useState(""); // 초
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // 기록 목록 불러오기
  const fetchRuns = async () => {
    try {
      setLoading(true);
      setErr("");
      const { data } = await api.get("/api/runs");
      setRuns(data);
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || "러닝 기록 불러오기 오류");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  // 기록 업로드
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setErr("");

      const d = Number(distance);
      const m = Number(timeMin);
      const s = Number(timeSecInput);

      if (!d || d <= 0 || m < 0 || s < 0 || (m === 0 && s === 0)) {
        setErr("거리(km)와 시간(분/초)을 올바르게 입력해주세요.");
        return;
      }

      const totalSec = m * 60 + s; // ← 여기서만 초로 변환

      await api.post("/api/runs", {
        distance: d,
        time: totalSec,
      });

      setDistance("");
      setTimeMin("");
      setTimeSecInput("");
      fetchRuns();
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || "러닝 기록 저장 중 오류가 발생했습니다.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    location.href = "/login";
  };

  // 초 → "분 XX초"
  const formatTime = (sec) => {
    if (!sec && sec !== 0) return "-";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}분 ${s}초`;
  };

  // pace(초/km) → "분 XX초 /km"
  const formatPace = (time, distance) => {
    if (!time || !distance) return "-";
    const paceSecPerKm = time / distance;
    const m = Math.floor(paceSecPerKm / 60);
    const s = Math.round(paceSecPerKm % 60);
    return `${m}분 ${s}초 /km`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 상단 헤더 */}
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          안녕하세요, {user?.nickname || "Runner"}님 👋
        </h1>
        <button
          className="text-sm text-gray-600 underline"
          onClick={handleLogout}
        >
          로그아웃
        </button>
      </div>

      <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
        {/* 왼쪽: 기록 업로드 폼 */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">🏃 러닝 기록 업로드</h2>

          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-sm mb-1">거리 (km)</label>
              <input
                type="number"
                step="0.01"
                className="w-full border rounded px-3 py-2"
                placeholder="예: 5"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">시간</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  className="w-1/2 border rounded px-3 py-2"
                  placeholder="분"
                  value={timeMin}
                  onChange={(e) => setTimeMin(e.target.value)}
                />
                <input
                  type="number"
                  className="w-1/2 border rounded px-3 py-2"
                  placeholder="초"
                  value={timeSecInput}
                  onChange={(e) => setTimeSecInput(e.target.value)}
                />
              </div>
            </div>

            {err && <div className="text-red-500 text-sm">{err}</div>}

            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded mt-2 hover:bg-gray-900 transition"
            >
              기록 저장
            </button>
          </form>
        </div>

        {/* 오른쪽: 기록 리스트 */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">📚 내 러닝 기록</h2>

          {loading && (
            <div className="text-sm text-gray-500">불러오는 중...</div>
          )}

          {!loading && runs.length === 0 && (
            <div className="text-sm text-gray-500">
              아직 저장된 기록이 없습니다. 첫 기록을 업로드해보세요!
            </div>
          )}

          <ul className="space-y-2 max-h-80 overflow-y-auto">
            {runs.map((run) => (
              <li
                key={run._id}
                className="border rounded-xl px-3 py-2 text-sm flex justify-between"
              >
                <div>
                  <div className="font-medium">
                    거리: {run.distance?.toFixed(2)} km
                  </div>
                  <div className="text-gray-600">
                    시간: {formatTime(run.time)}
                  </div>
                  <div className="text-gray-500 text-xs">
                    페이스: {formatPace(run.time, run.distance)}
                  </div>
                </div>
                <div className="text-xs text-gray-400 self-end">
                  {run.createdAt
                    ? new Date(run.createdAt).toLocaleString()
                    : "-"}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
