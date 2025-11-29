// client/src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setToken } from "../lib/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // 러닝 기록 입력
  const [distance, setDistance] = useState("");
  const [timeMin, setTimeMin] = useState("");
  const [timeSecInput, setTimeSecInput] = useState("");
  const [runs, setRuns] = useState([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [runsDeleting, setRunsDeleting] = useState({});
  const [runErr, setRunErr] = useState("");

  // 대결 시뮬레이션 입력
  const [difficulty, setDifficulty] = useState("beginner");
  const [competitions, setCompetitions] = useState([]);
  const [compLoading, setCompLoading] = useState(false);
  const [compDeleting, setCompDeleting] = useState({});
  const [compErr, setCompErr] = useState("");

  const fetchRuns = async () => {
    try {
      setRunsLoading(true);
      setRunErr("");
      const { data } = await api.get("/api/runs");
      setRuns(data);
    } catch (e) {
      console.error(e);
      setRunErr(e?.response?.data?.message || "러닝 기록 불러오기 오류");
    } finally {
      setRunsLoading(false);
    }
  };

  const fetchCompetitions = async () => {
    try {
      setCompLoading(true);
      setCompErr("");
      const { data } = await api.get("/api/competitions");
      setCompetitions(data);
    } catch (e) {
      console.error(e);
      setCompErr(e?.response?.data?.message || "대결 목록 불러오기 오류");
    } finally {
      setCompLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
    fetchCompetitions();
  }, []);

  const onSubmitRun = async (e) => {
    e.preventDefault();
    try {
      setRunErr("");

      const d = Number(distance);
      const m = Number(timeMin);
      const s = Number(timeSecInput);

      if (!d || d <= 0 || m < 0 || s < 0 || (m === 0 && s === 0)) {
        setRunErr("거리(km)와 시간(분/초)을 올바르게 입력해 주세요.");
        return;
      }

      const totalSec = m * 60 + s;

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
      setRunErr(e?.response?.data?.message || "러닝 기록 저장 실패가 발생했습니다.");
    }
  };

  const onSubmitCompetition = async (e) => {
    e.preventDefault();
    try {
      setCompErr("");

      await api.post("/api/competitions", {
        difficulty,
      });

      setDifficulty("beginner");
      fetchCompetitions();
    } catch (e) {
      console.error(e);
      setCompErr(e?.response?.data?.message || "대결 생성 실패가 발생했습니다.");
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.clear();
    navigate("/login");
  };

  const deleteRun = async (id) => {
    if (!window.confirm("이 기록을 삭제할까요?")) return;
    try {
      setRunsDeleting((prev) => ({ ...prev, [id]: true }));
      await api.delete(`/api/runs/${id}`);
      await fetchRuns();
    } catch (e) {
      console.error(e);
      setRunErr(e?.response?.data?.message || "기록 삭제 실패");
    } finally {
      setRunsDeleting((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const deleteCompetition = async (id) => {
    if (!window.confirm("이 대결을 삭제할까요?")) return;
    try {
      setCompDeleting((prev) => ({ ...prev, [id]: true }));
      await api.delete(`/api/competitions/${id}`);
      await fetchCompetitions();
    } catch (e) {
      console.error(e);
      setCompErr(e?.response?.data?.message || "대결 삭제 실패");
    } finally {
      setCompDeleting((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const formatTime = (sec) => {
    if (!sec && sec !== 0) return "-";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}분 ${s}초`;
  };

  const formatPace = (time, dist) => {
    if (!time || !dist) return "-";
    const paceSecPerKm = time / dist;
    const m = Math.floor(paceSecPerKm / 60);
    const s = Math.round(paceSecPerKm % 60);
    return `${m}분 ${s}초/km`;
  };

  const resultLabel = {
    win: "승리",
    lose: "패배",
    draw: "무승부",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          환영합니다 {user?.nickname || "Runner"}님
        </h1>
        <button
          className="text-sm text-gray-600 underline"
          onClick={handleLogout}
        >
          로그아웃
        </button>
      </div>

      <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">빠른 러닝 기록 입력</h2>

          <form onSubmit={onSubmitRun} className="space-y-3">
            <div>
              <label className="block text-sm mb-1">거리 (km)</label>
              <input
                type="number"
                step="0.01"
                className="w-full border rounded px-3 py-2"
                placeholder="예) 5"
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

            {runErr && <div className="text-red-500 text-sm">{runErr}</div>}

            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded mt-2 hover:bg-gray-900 transition"
            >
              기록 추가
            </button>
          </form>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">최근 러닝 기록</h2>

          {runsLoading && (
            <div className="text-sm text-gray-500">불러오는 중..</div>
          )}

          {!runsLoading && runs.length === 0 && (
            <div className="text-sm text-gray-500">
              아직 저장된 기록이 없습니다. 먼저 기록을 추가해 보세요.
            </div>
          )}

          <ul className="space-y-2 max-h-80 overflow-y-auto">
            {runs.map((run) => (
              <li
                key={run._id}
                className="border rounded-xl px-3 py-2 text-sm flex justify-between items-start gap-3"
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
                  {run.createdAt ? new Date(run.createdAt).toLocaleString() : "-"}
                  <button
                    className="ml-2 text-red-500 underline text-[11px]"
                    disabled={runsDeleting[run._id]}
                    onClick={() => deleteRun(run._id)}
                  >
                    {runsDeleting[run._id] ? "삭제중..." : "삭제"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">대결 시뮬레이션 (MVP)</h2>

          <form onSubmit={onSubmitCompetition} className="space-y-3 mb-4">
            <div>
              <label className="block text-sm mb-1">봇 난이도</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="beginner">초급 (7:00/km)</option>
                <option value="intermediate">중급 (5:30/km)</option>
                <option value="advanced">상급 (4:30/km)</option>
              </select>
            </div>

            {compErr && <div className="text-red-500 text-sm">{compErr}</div>}

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
            >
              대결 생성 & 결과 보기
            </button>
          </form>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">내 대결 목록</h3>

            {compLoading && (
              <div className="text-sm text-gray-500">불러오는 중..</div>
            )}

            {!compLoading && competitions.length === 0 && (
              <div className="text-sm text-gray-500">
                아직 생성된 대결이 없습니다. 기록을 입력하고 대결을 만들어 보세요.
              </div>
            )}

            <ul className="space-y-2 max-h-80 overflow-y-auto">
              {competitions.map((c) => (
                <li
                  key={c._id}
                  className="border rounded-xl px-3 py-2 text-sm flex justify-between items-start gap-3"
                >
                  <div>
                    <div className="font-medium">
                      거리: {c.distance?.toFixed(2)} km
                    </div>
                    <div className="text-gray-700">내 기록: {formatTime(c.time)}</div>
                    <div className="text-gray-700">상대 기록: {formatTime(c.opponentTime)}</div>
                    <div className="text-gray-500 text-xs">
                      난이도: {c.difficulty || "-"} / 결과: {resultLabel[c.result] || c.result}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 text-right">
                    {c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}
                    <button
                      className="ml-2 text-red-500 underline text-[11px]"
                      disabled={compDeleting[c._id]}
                      onClick={() => deleteCompetition(c._id)}
                    >
                      {compDeleting[c._id] ? "삭제중..." : "삭제"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
