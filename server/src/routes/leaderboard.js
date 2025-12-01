// server/src/routes/leaderboard.js
import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import Run from "../models/Run.js";

const router = express.Router();

router.get("/weekly", authMiddleware, async (_req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const rows = await Run.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: "$userId",
          totalDistance: { $sum: "$distance" },
          totalTime: { $sum: "$time" },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          userId: "$_id",
          nickname: "$user.nickname",
          totalDistance: 1,
          totalTime: 1,
          count: 1,
          avgPaceSec: {
            $cond: [
              { $gt: ["$totalDistance", 0] },
              { $divide: ["$totalTime", "$totalDistance"] },
              null,
            ],
          },
        },
      },
      {
        $addFields: {
          paceSecPerKm: {
            $cond: [
              { $gt: ["$totalDistance", 0] },
              { $divide: ["$totalTime", "$totalDistance"] },
              null,
            ],
          },
        },
      },
      // 우선 거리 내림차순, 거리 같으면 페이스 오름차순(빠른 순)
      { $sort: { totalDistance: -1, paceSecPerKm: 1 } },
      { $limit: 10 },
    ]);

    res.json({ range: "7d", generatedAt: now, rows });
  } catch (err) {
    console.error("GET /api/leaderboard/weekly error", err);
    res.status(500).json({ message: "리더보드 조회 실패" });
  }
});

export default router;
