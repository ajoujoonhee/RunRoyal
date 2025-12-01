// client/src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { io } from "socket.io-client";
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
  const [openComps, setOpenComps] = useState([]);
  const [openLoading, setOpenLoading] = useState(false);
  // 리더보드
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading] = useState(false);
  const [lbErr, setLbErr] = useState("");

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

  const fetchOpenCompetitions = async () => {
    try {
      setOpenLoading(true);
      const { data } = await api.get("/api/competitions/open");
      setOpenComps(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setOpenLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLbLoading(true);
      setLbErr("");
      const { data } = await api.get("/api/leaderboard/weekly");
      setLeaderboard(data?.rows || []);
    } catch (e) {
      console.error(e);
      setLbErr(e?.response?.data?.message || "리더보드 불러오기 오류");
    } finally {
      setLbLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
    fetchCompetitions();
    fetchLeaderboard();
    fetchOpenCompetitions();

    const socketUrl =
      (import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_URL || "").replace(/\/api$/, "")) ||
      "http://localhost:4000";

    const socket = io(socketUrl, {
      transports: ["websocket"],
      withCredentials: false,
    });

    socket.on("leaderboard:update", fetchLeaderboard);
    socket.on("competition:update", () => {
      fetchCompetitions();
      fetchOpenCompetitions();
    });

    return () => {
      socket.off("leaderboard:update");
      socket.off("competition:update");
      socket.close();
    };
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
      fetchLeaderboard();
    } catch (e) {
      console.error(e);
      setCompErr(e?.response?.data?.message || "대결 생성 실패가 발생했습니다.");
    }
  };

  const createUserCompetition = async () => {
    try {
      setCompErr("");
      await api.post("/api/competitions/user");
      fetchCompetitions();
      fetchOpenCompetitions();
      fetchLeaderboard();
    } catch (e) {
      console.error(e);
      setCompErr(e?.response?.data?.message || "유저 대결 생성 실패");
    }
  };

  const acceptCompetition = async (id) => {
    if (!window.confirm("이 대결에 참여할까요?")) return;
    try {
      setCompErr("");
      await api.post(`/api/competitions/${id}/accept`);
      fetchCompetitions();
      fetchOpenCompetitions();
      fetchLeaderboard();
    } catch (e) {
      console.error(e);
      setCompErr(e?.response?.data?.message || "대결 수락 실패");
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
    return `${m}m ${s}s`;
  };

  const formatPace = (time, dist) => {
    if (!time || !dist) return "-";
    const paceSecPerKm = time / dist;
    const m = Math.floor(paceSecPerKm / 60);
    const s = Math.round(paceSecPerKm % 60);
    return `${m}m ${s}s/km`;
  };

  const resultLabel = {
    win: "승리",
    lose: "패배",
    draw: "무승부",
  };

  const formatPaceValue = (sec) => {
    if (!sec && sec !== 0) return "-";
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}m ${s}s/km`;
  };

  const flipResultForOpponent = (result) => {
    if (result === "win") return "lose";
    if (result === "lose") return "win";
    return result;
  };

  const chartData = useMemo(() => {
    return [...runs]
      .reverse()
      .map((run, idx, arr) => {
        const paceSec = run.time && run.distance ? run.time / run.distance : null;
        return {
          name: run.createdAt ? new Date(run.createdAt).toLocaleDateString() : `#${arr.length - idx}`,
          distance: run.distance,
          timeSec: run.time || 0,
          paceSec,
        };
      })
      .slice(-10);
  }, [runs]);

  const stats = useMemo(() => {
    const totalDistance = runs.reduce((sum, r) => sum + (r.distance || 0), 0);
    const totalTime = runs.reduce((sum, r) => sum + (r.time || 0), 0);
    const count = runs.length;
    const avgPaceSec = totalDistance > 0 ? totalTime / totalDistance : null;
    return { totalDistance, totalTime, count, avgPaceSec };
  }, [runs]);

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-orange-500 text-white p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] opacity-80">RunRoyale · Dashboard</div>
              <h1 className="text-3xl md:text-4xl font-bold mt-2">
                환영합니다, {user?.nickname || "Runner"}님
              </h1>
              <p className="text-white/80 text-sm mt-2">
                기록을 쌓고, 대결을 만들고, 리더보드에서 순위를 확인하세요.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/runs/new")}
                className="px-4 py-2 rounded-full bg-white text-indigo-700 font-semibold shadow-sm hover:translate-y-[-1px] transition"
              >
                기록 작성
              </button>
              <button
                onClick={createUserCompetition}
                className="px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/10 transition"
              >
                대결 만들기
              </button>
              <button
                className="px-3 py-2 rounded-full text-sm bg-white/10 border border-white/30 hover:bg-white/20 transition"
                onClick={handleLogout}
              >
                로그아웃
              </button>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mt-6 text-sm">
            <div className="bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur">
              <div className="text-white/70">총 거리</div>
              <div className="text-2xl font-semibold">{stats.totalDistance.toFixed(2)} km</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur">
              <div className="text-white/70">총 러닝 횟수</div>
              <div className="text-2xl font-semibold">{stats.count} 회</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur">
              <div className="text-white/70">평균 페이스</div>
              <div className="text-2xl font-semibold">
                {stats.avgPaceSec ? formatPaceValue(stats.avgPaceSec) : "-"}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white/90 backdrop-blur p-5 rounded-2xl shadow-md border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">빠른 러닝 기록 입력</h2>
              <span className="text-[11px] px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                NEW
              </span>
            </div>

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
                className="w-full bg-indigo-600 text-white py-2 rounded mt-2 hover:bg-indigo-700 transition font-semibold shadow-sm"
              >
                기록 추가
              </button>
            </form>
          </div>

          <div className="bg-white/90 backdrop-blur p-5 rounded-2xl shadow-md border border-slate-200">
            <h2 className="text-lg font-semibold mb-4">최근 러닝 기록</h2>

            {runsLoading && <div className="text-sm text-gray-500">불러오는 중..</div>}

            {!runsLoading && runs.length === 0 && (
              <div className="text-sm text-gray-500">아직 저장된 기록이 없습니다. 먼저 기록을 추가해 보세요.</div>
            )}

            <ul className="space-y-2 max-h-80 overflow-y-auto">
              {runs.map((run) => (
                <li
                  key={run._id}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm flex justify-between items-start gap-3 hover:border-indigo-200 transition"
                >
                  <div>
                    <div className="font-medium">거리: {run.distance?.toFixed(2)} km</div>
                    <div className="text-gray-600">시간: {formatTime(run.time)}</div>
                    <div className="text-gray-500 text-xs">페이스: {formatPace(run.time, run.distance)}</div>
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

        <div className="bg-white/90 backdrop-blur p-5 rounded-2xl shadow-md border border-slate-200">
          <h2 className="text-lg font-semibold mb-4">리포트</h2>

          <div className="grid gap-6 md:grid-cols-2 mt-6">
            <div className="h-64">
              <h3 className="font-semibold mb-2 text-sm text-gray-700">거리 / 시간 추이 (최근 10회)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => formatTime(v)} />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "시간(초)") return [formatTime(value), "시간"];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="distance" name="거리(km)" fill="#6366f1" />
                  <Bar yAxisId="right" dataKey="timeSec" name="시간(초)" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="h-64">
              <h3 className="font-semibold mb-2 text-sm text-gray-700">페이스 추이 (최근 10회)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatPaceValue(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="paceSec" name="페이스(초/km)" stroke="#f97316" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur p-5 rounded-2xl shadow-md border border-slate-200">
          <h2 className="text-lg font-semibold mb-4">주간 리더보드 (최근 7일)</h2>
          {lbErr && <div className="text-red-500 text-sm mb-2">{lbErr}</div>}
          {lbLoading && <div className="text-sm text-gray-500">불러오는 중...</div>}
          {!lbLoading && leaderboard.length === 0 && (
            <div className="text-sm text-gray-500">아직 리더보드에 표시할 기록이 없습니다. 러닝을 추가해 보세요.</div>
          )}
          {!lbLoading && leaderboard.length > 0 && (
            <ul className="divide-y">
              {leaderboard.map((row, idx) => (
                <li key={row.userId || idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-gray-900 text-white text-sm flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-sm">{row.nickname || "Runner"}</div>
                      <div className="text-xs text-gray-500">
                        횟수 {row.count || 0}회 · 평균 페이스 {row.avgPaceSec ? formatPaceValue(row.avgPaceSec) : "-"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{row.totalDistance?.toFixed(2)} km</div>
                    <div className="text-xs text-gray-500">총 시간 {formatTime(row.totalTime)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white/90 backdrop-blur p-5 rounded-2xl shadow-md border border-slate-200">
          <h2 className="text-lg font-semibold mb-4">대결 시뮬레이션 / 유저 대결</h2>

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
              봇 대결 생성 & 결과 보기
            </button>
          </form>

          <div className="border-t pt-4 mb-4">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">유저 대결 안내</h3>
            <p className="text-xs text-gray-500">
              상단 히어로 영역의 "대결 만들기"를 누르면 최신 기록으로 오픈 대결이 생성됩니다. 상대가 참여하면 두 사람의 페이스를 동일 거리로 환산해 승패를 결정합니다.
            </p>
          </div>

          <div className="border-t pt-4 mb-4">
            <h3 className="font-semibold mb-2 text-sm text-gray-700">참여 가능한 오픈 대결</h3>
            {openLoading && <div className="text-sm text-gray-500">불러오는 중..</div>}
            {!openLoading && openComps.length === 0 && (
              <div className="text-sm text-gray-500">참여 가능한 대결이 없습니다.</div>
            )}
            {!openLoading && openComps.length > 0 && (
              <ul className="space-y-2 max-h-56 overflow-y-auto">
                {openComps.map((c) => (
                  <li
                    key={c._id}
                    className="border rounded-lg px-3 py-2 text-sm flex justify-between items-start gap-3"
                  >
                    <div>
                      <div className="font-medium">거리: {c.distance?.toFixed(2)} km</div>
                      <div className="text-gray-700">요청자: {c.userId?.nickname || "?"}</div>
                      <div className="text-xs text-gray-500">
                        생성: {c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}
                      </div>
                    </div>
                    <button
                      className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                      onClick={() => acceptCompetition(c._id)}
                    >
                      참여
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">내 대결 목록</h3>

            {compLoading && <div className="text-sm text-gray-500">불러오는 중..</div>}

            {!compLoading && competitions.length === 0 && (
              <div className="text-sm text-gray-500">
                아직 생성된 대결이 없습니다. 기록을 입력하고 대결을 만들어 보세요.
              </div>
            )}

            <ul className="space-y-2 max-h-80 overflow-y-auto">
              {competitions.map((c) => {
                const currentUserId = user?.id;
                const ownerId = typeof c.userId === "object" ? c.userId?._id : c.userId;
                const opponentId = typeof c.opponentId === "object" ? c.opponentId?._id : c.opponentId;
                const isOwner = ownerId === currentUserId;
                const myTime = isOwner ? c.time : c.opponentTime;
                const oppTime = isOwner ? c.opponentTime : c.time;
                const rawResult = c.result;
                const displayResult = isOwner ? rawResult : flipResultForOpponent(rawResult);
                const challengerName =
                  (typeof c.userId === "object" && (c.userId?.nickname || c.userId?.email)) || "요청자";
                const opponentName =
                  (typeof c.opponentId === "object" && (c.opponentId?.nickname || c.opponentId?.email)) || "참가자";

                return (
                  <li
                    key={c._id}
                    className="border rounded-xl px-3 py-2 text-sm flex justify-between items-start gap-3"
                  >
                    <div>
                      <div className="font-medium">거리: {c.distance?.toFixed(2)} km</div>
                      <div className="text-gray-700">내 기록: {myTime ? formatTime(myTime) : "-"}</div>
                      <div className="text-gray-700">상대 기록: {oppTime ? formatTime(oppTime) : "-"}</div>
                      <div className="text-gray-500 text-xs">
                        요청자: {challengerName}
                        {opponentId && ` / 상대: ${opponentName}`}
                      </div>
                      <div className="text-gray-500 text-xs">
                        난이도: {c.difficulty || "-"} / 결과: {resultLabel[displayResult] || displayResult || "-"}
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
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
