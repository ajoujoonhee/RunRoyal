// client/src/pages/RunCreate.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function RunCreate() {
  const navigate = useNavigate();

  const [distance, setDistance] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [paceMinutes, setPaceMinutes] = useState("");
  const [paceSeconds, setPaceSeconds] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const formatTime = (sec) => {
    if (!sec && sec !== 0) return "-";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const formatPace = (time, dist) => {
    if (!time || !dist) return "-";
    const paceSec = time / dist;
    const m = Math.floor(paceSec / 60);
    const s = Math.round(paceSec % 60);
    return `${m}m ${s}s/km`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const d = parseFloat(distance);
    const min = parseInt(minutes || "0", 10);
    const sec = parseInt(seconds || "0", 10);
    const paceMinVal = parseInt(paceMinutes || "0", 10);
    const paceSecVal = parseInt(paceSeconds || "0", 10);

    if (!d || d <= 0) {
      setError("거리가 0보다 커야 합니다.");
      return;
    }
    if (min < 0 || sec < 0 || sec >= 60) {
      setError("총 시간 형식이 올바르지 않습니다. (초는 0~59)");
      return;
    }
    if (paceMinVal < 0 || paceSecVal < 0 || paceSecVal >= 60) {
      setError("페이스 형식이 올바르지 않습니다. (초는 0~59)");
      return;
    }

    let timeSec = min * 60 + sec;
    const paceTotalSec = paceMinVal * 60 + paceSecVal;
    const hasPaceInput = paceMinutes !== "" || paceSeconds !== "";

    if (hasPaceInput) {
      if (paceTotalSec <= 0) {
        setError("페이스는 0보다 커야 합니다.");
        return;
      }
      timeSec = Math.round(d * paceTotalSec);
    } else if (timeSec <= 0) {
      setError("총 시간은 0초보다 커야 합니다.");
      return;
    }

    const payload = {
      distance: d,
      time: timeSec,
    };

    try {
      setLoading(true);
      await api.post("/api/runs", payload);
      alert("달리기 기록이 저장되었습니다!");
      navigate("/"); // 완료 후 메인으로 이동
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "기록 저장 실패가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">달리기 기록 작성</h1>
        <p className="text-sm text-gray-500 mb-6">
          거리와 총 시간 또는 1km당 페이스를 입력하면 자동으로 계산해 저장합니다.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              거리 (km)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="예) 3.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              시간 (분/초)
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

          <div>
            <label className="block text-sm font-medium mb-1">
              1km당 페이스 (분/초) <span className="text-gray-400 text-xs">(선택)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={paceMinutes}
                onChange={(e) => setPaceMinutes(e.target.value)}
                className="w-1/2 border rounded px-3 py-2 text-sm"
                placeholder="분"
              />
              <input
                type="number"
                min="0"
                max="59"
                value={paceSeconds}
                onChange={(e) => setPaceSeconds(e.target.value)}
                className="w-1/2 border rounded px-3 py-2 text-sm"
                placeholder="초"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              페이스를 입력하면 거리×페이스로 총 시간이 자동 계산됩니다. 미입력 시 총 시간(분/초)을 그대로 사용합니다.
            </p>
          </div>

          <div className="text-xs text-gray-600 bg-slate-50 border border-dashed border-slate-200 rounded-lg p-3">
            {(() => {
              const d = parseFloat(distance || "0");
              const min = parseInt(minutes || "0", 10);
              const sec = parseInt(seconds || "0", 10);
              const paceMinVal = parseInt(paceMinutes || "0", 10);
              const paceSecVal = parseInt(paceSeconds || "0", 10);
              const hasPaceInput = paceMinutes !== "" || paceSeconds !== "";
              const paceTotal = paceMinVal * 60 + paceSecVal;
              const timeFromPace = d > 0 && paceTotal > 0 ? Math.round(d * paceTotal) : null;
              const totalTime = hasPaceInput ? timeFromPace : min * 60 + sec;
              const paceDisplay =
                d > 0 && (totalTime || 0) > 0 ? formatPace(totalTime, d) : hasPaceInput ? formatPace(paceTotal, 1) : "-";

              return (
                <ul className="space-y-1">
                  <li>계산된 총 시간: <span className="font-semibold">{totalTime && totalTime > 0 ? formatTime(totalTime) : "-"}</span></li>
                  <li>페이스: <span className="font-semibold">{paceDisplay}</span></li>
                </ul>
              );
            })()}
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
            {loading ? "저장중.." : "기록 저장"}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full mt-2 py-2 rounded border text-sm text-gray-600 hover:bg-gray-50"
          >
            뒤로가기
          </button>
        </form>
      </div>
    </div>
  );
}
