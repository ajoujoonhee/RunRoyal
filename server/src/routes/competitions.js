// server/src/routes/competitions.js
import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import Competition from "../models/Competition.js";

const router = express.Router();

function simulateOpponentTime(userTime) {
  // 0.9x ~ 1.1x 범위 랜덤
  const factor = 0.9 + Math.random() * 0.2;
  const value = Math.max(1, Math.round(userTime * factor));
  return value;
}

function decideResult(userTime, opponentTime) {
  if (userTime < opponentTime) return "win";
  if (userTime > opponentTime) return "lose";
  return "draw";
}

// 대결 목록 조회 (내 대결만)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const list = await Competition.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error("GET /api/competitions error", err);
    res.status(500).json({ message: "대결 목록 조회 실패" });
  }
});

// 대결 생성 + 즉시 결과 결정 (봇 시뮬레이션)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { distance, time } = req.body;

    const d = Number(distance);
    const t = Number(time);

    if (!d || d <= 0 || !t || t <= 0) {
      return res.status(400).json({ message: "distance/time 값을 확인하세요." });
    }

    const opponentTime = simulateOpponentTime(t);
    const result = decideResult(t, opponentTime);

    const comp = await Competition.create({
      userId: req.userId,
      distance: d,
      time: t,
      opponentTime,
      result,
      status: "completed",
    });

    res.status(201).json(comp);
  } catch (err) {
    console.error("POST /api/competitions error", err);
    res.status(500).json({ message: "대결 생성 실패" });
  }
});

export default router;
