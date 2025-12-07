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
  const [useSplits, setUseSplits] = useState(false);
  const [splits, setSplits] = useState([{ distance: "1", paceMinutes: "", paceSeconds: "" }]);
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

  const computeSplits = () => {
    let totalDistance = 0;
    let totalTime = 0;

    for (const split of splits) {
      const d = parseFloat(split.distance);
      const pm = parseInt(split.paceMinutes || "0", 10);
      const ps = parseInt(split.paceSeconds || "0", 10);
      if (!d || d <= 0) return { error: "스플릿 거리는 0보다 커야 합니다." };
      if (pm < 0 || ps < 0 || ps >= 60) return { error: "스플릿 페이스 형식이 올바르지 않습니다. (초는 0~59)" };
      const paceSec = pm * 60 + ps;
      if (paceSec <= 0) return { error: "스플릿 페이스는 0보다 커야 합니다." };

      totalDistance += d;
      totalTime += d * paceSec;
    }

    return { totalDistance, totalTime };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    let d = parseFloat(distance);
    let timeSec = 0;

    if (useSplits) {
      const { error: splitError, totalDistance, totalTime } = computeSplits();
      if (splitError) {
        setError(splitError);
        return;
      }
      d = totalDistance;
      timeSec = Math.round(totalTime);
    } else {
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

      timeSec = min * 60 + sec;
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
      setError(err?.response?.data?.message || "기록 저장 실패가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-800 to-slate-900 flex justify-center px-4 py-10">
      <div className="w-full max-w-4xl grid lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-2 text-white">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-2xl">
            <p className="text-xs uppercase tracking-[0.25em] text-white/70">RunRoyale</p>
            <h1 className="text-3xl font-extrabold mt-2">달리기 기록 작성</h1>
            <p className="text-white/80 text-sm mt-3">
              거리와 총 시간 혹은 구간별(1km, 2km…) 페이스를 입력하면 자동으로 계산해 저장합니다.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mt-5 text-sm">
              <div className="bg-white/10 rounded-2xl p-4 border border-white/15">
                <div className="text-white/70 text-xs">입력 방식</div>
                <div className="font-semibold mt-1">전체 시간 / 구간 페이스</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 border border-white/15">
                <div className="text-white/70 text-xs">계산</div>
                <div className="font-semibold mt-1">총 시간·평균 페이스 자동 계산</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 w-full max-w-xl bg-white rounded-2xl shadow p-6 border border-slate-200">
          <h2 className="text-xl font-bold mb-4 text-slate-900">기록 입력</h2>
          <p className="text-sm text-gray-500 mb-6">
            전체 시간 입력과 구간별 페이스 입력 중 편한 방식을 선택하세요.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2 text-sm">
              <button
                type="button"
                onClick={() => setUseSplits(false)}
                className={[
                  "flex-1 rounded-lg border px-3 py-2",
                  !useSplits ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold" : "border-slate-200",
                ].join(" ")}
              >
                전체 시간 입력
              </button>
              <button
                type="button"
                onClick={() => setUseSplits(true)}
                className={[
                  "flex-1 rounded-lg border px-3 py-2",
                  useSplits ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold" : "border-slate-200",
                ].join(" ")}
              >
                구간별 페이스 입력
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">거리 (km)</label>
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

            {!useSplits && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">시간 (분/초)</label>
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
              </>
            )}

            {useSplits && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">구간별 페이스 입력</h3>
                  <button
                    type="button"
                    onClick={() => setSplits([...splits, { distance: "1", paceMinutes: "", paceSeconds: "" }])}
                    className="text-xs px-2 py-1 rounded border border-slate-200 hover:bg-slate-50"
                  >
                    + 스플릿 추가
                  </button>
                </div>
                <div className="space-y-2">
                  {splits.map((split, idx) => (
                    <div key={idx} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>스플릿 #{idx + 1}</span>
                        {splits.length > 1 && (
                          <button
                            type="button"
                            className="text-red-500"
                            onClick={() => setSplits(splits.filter((_, i) => i !== idx))}
                          >
                            삭제
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs mb-1">거리 (km)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={split.distance}
                            onChange={(e) => {
                              const next = [...splits];
                              next[idx] = { ...next[idx], distance: e.target.value };
                              setSplits(next);
                            }}
                            className="w-full border rounded px-2 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1">페이스 분</label>
                          <input
                            type="number"
                            min="0"
                            value={split.paceMinutes}
                            onChange={(e) => {
                              const next = [...splits];
                              next[idx] = { ...next[idx], paceMinutes: e.target.value };
                              setSplits(next);
                            }}
                            className="w-full border rounded px-2 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1">페이스 초</label>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={split.paceSeconds}
                            onChange={(e) => {
                              const next = [...splits];
                              next[idx] = { ...next[idx], paceSeconds: e.target.value };
                              setSplits(next);
                            }}
                            className="w-full border rounded px-2 py-2 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  각 스플릿의 페이스를 입력하면 거리×페이스 합산으로 총 시간이 계산됩니다. 1km 단위가 아니어도 됩니다(예: 2.5km).
                </p>
              </div>
            )}

            <div className="text-xs text-gray-600 bg-slate-50 border border-dashed border-slate-200 rounded-lg p-3">
              {(() => {
                if (useSplits) {
                  const { error: splitError, totalDistance, totalTime } = computeSplits();
                  const paceDisplay =
                    totalDistance > 0 && totalTime > 0 ? formatPace(totalTime, totalDistance) : "-";
                  return (
                    <ul className="space-y-1">
                      <li>
                        합산 거리: <span className="font-semibold">{totalDistance ? totalDistance.toFixed(2) : "-"}</span>{" "}
                        km
                      </li>
                      <li>
                        합산 시간:{" "}
                        <span className="font-semibold">
                          {totalTime ? formatTime(Math.round(totalTime)) : "-"}
                        </span>
                      </li>
                      <li>
                        평균 페이스: <span className="font-semibold">{splitError ? "-" : paceDisplay}</span>
                      </li>
                      {splitError && <li className="text-red-500">{splitError}</li>}
                    </ul>
                  );
                }

                const dVal = parseFloat(distance || "0");
                const minVal = parseInt(minutes || "0", 10);
                const secVal = parseInt(seconds || "0", 10);
                const paceMinVal = parseInt(paceMinutes || "0", 10);
                const paceSecVal = parseInt(paceSeconds || "0", 10);
                const hasPaceInput = paceMinutes !== "" || paceSeconds !== "";
                const paceTotal = paceMinVal * 60 + paceSecVal;
                const timeFromPace = dVal > 0 && paceTotal > 0 ? Math.round(dVal * paceTotal) : null;
                const totalTime = hasPaceInput ? timeFromPace : minVal * 60 + secVal;
                const paceDisplay =
                  dVal > 0 && (totalTime || 0) > 0 ? formatPace(totalTime, dVal) : hasPaceInput ? formatPace(paceTotal, 1) : "-";

                return (
                  <ul className="space-y-1">
                    <li>
                      계산된 총 시간:{" "}
                      <span className="font-semibold">
                        {totalTime && totalTime > 0 ? formatTime(totalTime) : "-"}
                      </span>
                    </li>
                    <li>
                      페이스: <span className="font-semibold">{paceDisplay}</span>
                    </li>
                  </ul>
                );
              })()}
            </div>

            {error && <div className="text-sm text-red-500">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className={[
                "w-full py-2 rounded font-semibold mt-2",
                loading ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-black text-white hover:bg-gray-900",
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
    </div>
  );
}
