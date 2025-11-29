// server/src/routes/runs.js
import express from "express";
import Run from "../models/Run.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

// 내 러닝 기록 목록 조회
router.get("/", authMiddleware, async (req, res) => {
  try {
    const runs = await Run.find({ userId: req.userId }).sort({
      createdAt: -1,
    }); // 최근 기록 먼저
    res.json(runs);
  } catch (err) {
    console.error("GET /api/runs error:", err);
    res.status(500).json({ message: "러닝 기록 불러오기 중 서버 오류" });
  }
});

// 러닝 기록 저장
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { distance, time } = req.body;

    if (
      typeof distance !== "number" ||
      typeof time !== "number" ||
      distance <= 0 ||
      time <= 0
    ) {
      return res
        .status(400)
        .json({ message: "distance와 time은 양수로 입력해야 합니다." });
    }

    const run = await Run.create({
      userId: req.userId,
      distance,
      time,
    });

    res.status(201).json(run);
  } catch (err) {
    console.error("POST /api/runs error:", err);
    res.status(500).json({ message: "러닝 기록 저장 중 서버 오류" });
  }
});

// 러닝 기록 삭제
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const run = await Run.findOne({ _id: id, userId: req.userId });

    if (!run) {
      return res.status(404).json({ message: "기록을 찾을 수 없습니다." });
    }

    await Run.deleteOne({ _id: id, userId: req.userId });
    res.json({ message: "삭제되었습니다." });
  } catch (err) {
    console.error("DELETE /api/runs/:id error:", err);
    res.status(500).json({ message: "기록 삭제 실패" });
  }
});

export default router;
