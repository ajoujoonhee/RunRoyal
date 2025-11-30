// server/src/routes/competitions.js
import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import Competition from "../models/Competition.js";
import Run from "../models/Run.js";

const router = express.Router();

const paceByDifficulty = {
  beginner: 7 * 60, // 7분/km
  intermediate: 5 * 60 + 30, // 5분30초/km
  advanced: 4 * 60 + 30, // 4분30초/km
};

const decideResult = (userTime, opponentTime) => {
  if (userTime < opponentTime) return "win";
  if (userTime > opponentTime) return "lose";
  return "draw";
};

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

// 대결 생성: 최신 러닝 기록과 난이도 기반 봇과 비교
router.post("/", authMiddleware, async (req, res) => {
  try {
    const difficulty = req.body?.difficulty || "beginner";
    const paceSec = paceByDifficulty[difficulty] ?? paceByDifficulty.beginner;

    // 최신 기록 조회
    const latestRun = await Run.findOne({ userId: req.userId }).sort({ createdAt: -1 });
    if (!latestRun) {
      return res.status(400).json({ message: "먼저 러닝 기록을 추가해 주세요." });
    }

    const userDistance = latestRun.distance;
    const userTime = latestRun.time;

    if (!userDistance || userDistance <= 0 || !userTime || userTime <= 0) {
      return res.status(400).json({ message: "기록 데이터가 올바르지 않습니다." });
    }

    // 봇 기록: 난이도별 고정 페이스 * 거리
    const opponentTime = Math.max(1, Math.round(paceSec * userDistance));
    const result = decideResult(userTime, opponentTime);

    const comp = await Competition.create({
      userId: req.userId,
      distance: userDistance,
      time: userTime,
      opponentTime,
      result,
      difficulty,
      status: "completed",
    });

    res.status(201).json(comp);
  } catch (err) {
    console.error("POST /api/competitions error", err);
    res.status(500).json({ message: "대결 생성 실패" });
  }
});

// 대결 삭제
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const comp = await Competition.findOne({ _id: id, userId: req.userId });

    if (!comp) {
      return res.status(404).json({ message: "대결을 찾을 수 없습니다." });
    }

    await Competition.deleteOne({ _id: id, userId: req.userId });
    res.json({ message: "삭제되었습니다." });
  } catch (err) {
    console.error("DELETE /api/competitions/:id error", err);
    res.status(500).json({ message: "대결 삭제 실패" });
  }
});

export default router;