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

const scaleOpponentTime = (run, targetDistance) => {
  if (!run?.distance || !run?.time || run.distance <= 0 || run.time <= 0) {
    return null;
  }
  const paceSec = run.time / run.distance;
  return Math.max(1, Math.round(paceSec * targetDistance));
};

// 내가 만든/참여한 대결 목록
router.get("/", authMiddleware, async (req, res) => {
  try {
    const list = await Competition.find({
      $or: [{ userId: req.userId }, { opponentId: req.userId }],
    })
      .sort({ updatedAt: -1 })
      .populate("userId", "nickname")
      .populate("opponentId", "nickname")
      .lean();
    res.json(list);
  } catch (err) {
    console.error("GET /api/competitions error", err);
    res.status(500).json({ message: "대결 목록 조회 실패" });
  }
});

// 오픈 대결 목록(상대 미정, 내가 만든 것 제외)
router.get("/open", authMiddleware, async (req, res) => {
  try {
    const list = await Competition.find({
      status: "pending",
      opponentId: null,
      userId: { $ne: req.userId },
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("userId", "nickname")
      .lean();
    res.json(list);
  } catch (err) {
    console.error("GET /api/competitions/open error", err);
    res.status(500).json({ message: "오픈 대결 조회 실패" });
  }
});

// 봇 대결 생성
router.post("/", authMiddleware, async (req, res) => {
  try {
    const difficulty = req.body?.difficulty || "beginner";
    const paceSec = paceByDifficulty[difficulty] ?? paceByDifficulty.beginner;

    const latestRun = await Run.findOne({ userId: req.userId }).sort({ createdAt: -1 });
    if (!latestRun) {
      return res.status(400).json({ message: "먼저 러닝 기록을 추가해 주세요." });
    }

    const userDistance = latestRun.distance;
    const userTime = latestRun.time;
    if (!userDistance || userDistance <= 0 || !userTime || userTime <= 0) {
      return res.status(400).json({ message: "기록 데이터가 올바르지 않습니다." });
    }

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

    const io = req.app.get("io");
    if (io) io.emit("competition:update");

    res.status(201).json(comp);
  } catch (err) {
    console.error("POST /api/competitions error", err);
    res.status(500).json({ message: "대결 생성 실패" });
  }
});

// 유저 대결 생성 (pending)
router.post("/user", authMiddleware, async (req, res) => {
  try {
    const { opponentId = null } = req.body || {};

    const latestRun = await Run.findOne({ userId: req.userId }).sort({ createdAt: -1 });
    if (!latestRun) {
      return res.status(400).json({ message: "먼저 러닝 기록을 추가해 주세요." });
    }

    const userDistance = latestRun.distance;
    const userTime = latestRun.time;
    if (!userDistance || userDistance <= 0 || !userTime || userTime <= 0) {
      return res.status(400).json({ message: "기록 데이터가 올바르지 않습니다." });
    }

    const comp = await Competition.create({
      userId: req.userId,
      opponentId: opponentId || null,
      distance: userDistance,
      time: userTime,
      status: "pending",
      difficulty: null,
      opponentTime: null,
      result: null,
    });

    const io = req.app.get("io");
    if (io) io.emit("competition:update");

    res.status(201).json(comp);
  } catch (err) {
    console.error("POST /api/competitions/user error", err);
    res.status(500).json({ message: "유저 대결 생성 실패" });
  }
});

// 대결 수락 (상대가 참여)
router.post("/:id/accept", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const comp = await Competition.findById(id);
    if (!comp) return res.status(404).json({ message: "대결을 찾을 수 없습니다." });
    if (comp.status !== "pending") {
      return res.status(400).json({ message: "이미 완료된 대결입니다." });
    }
    if (String(comp.userId) === String(req.userId)) {
      return res.status(403).json({ message: "본인 대결은 수락할 수 없습니다." });
    }
    if (comp.opponentId && String(comp.opponentId) !== String(req.userId)) {
      return res.status(403).json({ message: "수락 권한이 없습니다." });
    }

    const latestRun = await Run.findOne({ userId: req.userId }).sort({ createdAt: -1 });
    if (!latestRun) {
      return res.status(400).json({ message: "먼저 러닝 기록을 추가해 주세요." });
    }

    const opponentTime = scaleOpponentTime(latestRun, comp.distance);
    if (!opponentTime) {
      return res.status(400).json({ message: "기록 데이터가 올바르지 않습니다." });
    }

    const result = decideResult(comp.time, opponentTime);

    comp.opponentId = comp.opponentId || req.userId;
    comp.opponentTime = opponentTime;
    comp.result = result;
    comp.status = "completed";
    await comp.save();

    const io = req.app.get("io");
    if (io) io.emit("competition:update");

    res.json(comp);
  } catch (err) {
    console.error("POST /api/competitions/:id/accept error", err);
    res.status(500).json({ message: "대결 수락 실패" });
  }
});

// 대결 삭제 (생성자만)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const comp = await Competition.findOne({ _id: id, userId: req.userId });

    if (!comp) {
      return res.status(404).json({ message: "대결을 찾을 수 없습니다." });
    }

    await Competition.deleteOne({ _id: id, userId: req.userId });

    const io = req.app.get("io");
    if (io) io.emit("competition:update");

    res.json({ message: "삭제되었습니다." });
  } catch (err) {
    console.error("DELETE /api/competitions/:id error", err);
    res.status(500).json({ message: "대결 삭제 실패" });
  }
});

export default router;
