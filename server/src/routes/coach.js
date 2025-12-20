// server/src/routes/coach.js
import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import Run from "../models/Run.js";

const router = express.Router();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

const paceSec = (run) => {
  if (!run?.distance || !run?.time || run.distance <= 0 || run.time <= 0) return null;
  return run.time / run.distance;
};

const formatPaceText = (sec) => {
  if (!sec || sec <= 0) return "-";
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}/km`;
};

const sum = (arr) => arr.reduce((acc, cur) => acc + cur, 0);

const buildRuleBased = (runs) => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const prevWeekStart = new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000);

  const paceList = runs
    .map(paceSec)
    .filter((v) => Number.isFinite(v) && v > 0);

  const latestPace = paceSec(runs[0]);
  const bestPace = paceList.length ? Math.min(...paceList) : null;
  const longest = runs.reduce((max, r) => Math.max(max, r.distance || 0), 0);

  const recentSlice = paceList.slice(0, Math.min(5, paceList.length));
  const prevSlice = paceList.slice(recentSlice.length, recentSlice.length + 5);
  const recentAvgPace = recentSlice.length ? sum(recentSlice) / recentSlice.length : null;
  const prevAvgPace = prevSlice.length ? sum(prevSlice) / prevSlice.length : null;
  const paceDiff = recentAvgPace && prevAvgPace ? prevAvgPace - recentAvgPace : 0;

  const runsThisWeek = runs.filter((r) => r.createdAt && new Date(r.createdAt) >= weekAgo);
  const runsPrevWeek = runs.filter(
    (r) => r.createdAt && new Date(r.createdAt) < weekAgo && new Date(r.createdAt) >= prevWeekStart
  );

  const totalDistanceWeek = runsThisWeek.reduce((acc, cur) => acc + (cur.distance || 0), 0);
  const totalDistancePrevWeek = runsPrevWeek.reduce((acc, cur) => acc + (cur.distance || 0), 0);
  const weekChange =
    totalDistancePrevWeek > 0 ? ((totalDistanceWeek - totalDistancePrevWeek) / totalDistancePrevWeek) * 100 : null;

  const insights = [];
  if (latestPace) insights.push({ title: "최근 페이스", detail: `마지막 기록 기준 ${formatPaceText(latestPace)}입니다.` });
  if (bestPace) insights.push({ title: "최고 페이스", detail: `가장 빠른 구간은 ${formatPaceText(bestPace)}입니다.` });
  if (runsThisWeek.length)
    insights.push({ title: "주간 러닝 빈도", detail: `최근 7일 동안 ${runsThisWeek.length}회 달렸어요.` });
  if (paceDiff > 3) {
    insights.push({ title: "페이스 개선", detail: `${paceDiff.toFixed(1)}초/km 빨라졌어요. 같은 패턴을 유지해 보세요.` });
  } else if (paceDiff < -3) {
    insights.push({ title: "페이스 유지", detail: "최근 페이스가 다소 느려졌어요. 충분한 휴식과 보강 운동을 챙겨 보세요." });
  } else if (paceList.length) {
    insights.push({ title: "안정적인 흐름", detail: "페이스 변화가 크지 않아요. 꾸준히 거리만 조금씩 늘려보세요." });
  }

  const actions = [];
  if (totalDistanceWeek < 10) {
    actions.push("이번 주 총 10km를 목표로 2~3회로 나눠 달려보세요.");
  } else {
    actions.push("주간 거리를 10~15%만 늘려 부상 없이 볼륨을 올려보세요.");
  }

  if (runsThisWeek.length < 3) actions.push("3일에 한 번꼴로 짧은 조깅을 넣어 리듬을 만드세요.");
  if (longest < 7) actions.push("주 1회는 평소보다 1km 길게 달려 지구력을 키워보세요.");
  if (!actions.length) actions.push("충분히 잘하고 있어요. 휴식일과 보강 운동도 스케줄에 넣어주세요.");

  const summaryPieces = [];
  if (paceDiff > 3) summaryPieces.push("페이스가 개선되는 중이에요");
  if (weekChange !== null) summaryPieces.push(`주간 거리 ${weekChange >= 0 ? "+" : ""}${weekChange.toFixed(0)}%`);
  if (!summaryPieces.length && latestPace) summaryPieces.push(`현재 페이스 ${formatPaceText(latestPace)}`);

  return {
    generatedAt: now,
    summary: summaryPieces.join(" · ") || "기록을 바탕으로 맞춤 코칭을 준비했어요.",
    insights,
    actions,
    metrics: {
      runCount: runs.length,
      bestPaceSec: bestPace,
      latestPaceSec: latestPace,
      recentAvgPaceSec: recentAvgPace,
      weekRunCount: runsThisWeek.length,
      totalDistanceWeek,
      longestDistance: longest,
    },
  };
};

const callOpenAI = async (payload) => {
  const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${text}`);
  }

  return res.json();
};

router.get("/insights", authMiddleware, async (req, res) => {
  try {
    const runs = await Run.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(30).lean();

    if (!runs.length) {
      return res.json({
        generatedAt: new Date(),
        summary: "아직 기록이 없어요. 첫 러닝을 남기면 AI 코치가 맞춤 피드백을 드릴게요.",
        insights: [],
        actions: ["5km 이내 가벼운 러닝을 기록해 보세요.", "거리가 익숙해지면 주 2~3회로 늘려 보세요."],
        metrics: {
          runCount: 0,
        },
      });
    }

    const ruleBased = buildRuleBased(runs);

    if (!OPENAI_API_KEY) {
      return res.json(ruleBased);
    }

    const compactRuns = runs.slice(0, 12).map((r) => ({
      distance_km: Number(r.distance || 0).toFixed(2),
      time_sec: Math.round(r.time || 0),
      pace_sec_per_km: paceSec(r) ? Number(paceSec(r).toFixed(2)) : null,
      created_at: r.createdAt,
    }));

    const promptData = {
      summary: ruleBased.summary,
      metrics: ruleBased.metrics,
      runs: compactRuns,
    };

    const payload = {
      model: OPENAI_MODEL,
      temperature: 0.3,
      max_tokens: 300,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a concise running coach. Return JSON with fields: summary (string, max 120 chars), insights (array of {title, detail}, 2-4 items), actions (array of 2-4 short action strings). Be encouraging, specific, and keep it in Korean.",
        },
        {
          role: "user",
          content: `최근 러닝 데이터와 요약:\n${JSON.stringify(promptData, null, 2)}`,
        },
      ],
    };

    let completion;
    try {
      completion = await callOpenAI(payload);
    } catch (err) {
      console.error("OpenAI call failed:", err.message);
      return res.json(ruleBased);
    }

    const content = completion?.choices?.[0]?.message?.content;
    let parsed = null;
    if (content) {
      try {
        parsed = JSON.parse(content);
      } catch (err) {
        console.error("OpenAI JSON parse failed:", err.message);
      }
    }

    if (!parsed?.summary || !parsed?.insights || !parsed?.actions) {
      return res.json(ruleBased);
    }

    return res.json({
      ...ruleBased,
      summary: parsed.summary || ruleBased.summary,
      insights: Array.isArray(parsed.insights) && parsed.insights.length ? parsed.insights : ruleBased.insights,
      actions: Array.isArray(parsed.actions) && parsed.actions.length ? parsed.actions : ruleBased.actions,
      llmModel: OPENAI_MODEL,
    });
  } catch (err) {
    console.error("GET /api/coach/insights error", err);
    res.status(500).json({ message: "AI 코칭 생성 실패" });
  }
});

export default router;
