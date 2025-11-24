// client/src/pages/RunCreate.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function RunCreate() {
  const navigate = useNavigate();

  const [distanceKm, setDistanceKm] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10)); // yyyy-mm-dd
  const [memo, setMemo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const d = parseFloat(distanceKm);
    const min = parseInt(minutes || "0", 10);
    const sec = parseInt(seconds || "0", 10);

    if (!d || d <= 0) {
      setError("거리는 0보다 큰 숫자로 입력해주세요.");
      return;
    }
    if (min < 0 || sec < 0 || sec >= 60) {
      setError("시간 형식이 올바르지 않습니다. (초는 0~59)");
      return;
    }

    const timeSec = min * 60 + sec;
    if (timeSec <= 0) {
      setError("총 시간은 0초보다 커야 합니다.");
      return;
    }

    const payload = {
      distanceKm: d,
      timeSec,
      date,
      memo,
    };

    try {
      setLoading(true);
      await api.post("/api/runs", payload);
      alert("러닝 기록이 저장되었습니다!");
      navigate("/"); // 대시보드로 이동 (원하면 /runs로 바꿔도 됨)
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "기록 저장 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">🏃 러닝 기록 업로드</h1>
        <p className="text-sm text-gray-500 mb-6">
          오늘 뛴 거리와 시간을 입력하면 나중에 대결/분석에 사용됩니다.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 거리 */}
          <div>
            <label className="block text-sm font-medium mb-1">
              거리 (km)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="예: 3.5"
            />
          </div>

          {/* 시간 */}
          <div>
            <label className="block text-sm font-medium mb-1">
              시간 (분:초)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-1/2 border rounded px-3 py-2 text-sm"
                placeholder="분"
              />
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                className="w-1/2 border rounded px-3 py-2 text-sm"
                placeholder="초"
              />
            </div>
          </div>

          {/* 날짜 */}
          <div>
            <label className="block text-sm font-medium mb-1">
              날짜
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium mb-1">
              메모 (선택)
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={3}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="코스, 컨디션 등 메모를 남겨보세요."
            />
          </div>

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={[
              "w-full py-2 rounded font-semibold mt-2",
              loading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-900",
            ].join(" ")}
          >
            {loading ? "저장 중..." : "기록 저장하기"}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full mt-2 py-2 rounded border text-sm text-gray-600 hover:bg-gray-50"
          >
            ← 뒤로가기
          </button>
        </form>
      </div>
    </div>
  );
}
