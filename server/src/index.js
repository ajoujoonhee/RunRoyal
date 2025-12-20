// server/src/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.js";
import runRoutes from "./routes/runs.js";
import competitionRoutes from "./routes/competitions.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import coachRoutes from "./routes/coach.js";

const app = express();

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

// 콤마 구분 오리진을 배열로 변환
const allowedOrigins = (CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // 서버 간/포스트맨
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

// 미들웨어
app.use(cors(corsOptions));
app.use(express.json());

// 헬스 체크
app.get("/health", (_, res) => res.send("OK"));

// 라우트
app.use("/api/auth", authRoutes);
app.use("/api/runs", runRoutes);
app.use("/api/competitions", competitionRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/coach", coachRoutes);

// 서버 실행
(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: allowedOrigins.length ? allowedOrigins : "*",
      },
    });

    // 라우트에서 접근 가능하도록 저장
    app.set("io", io);

    server.listen(PORT, () => {
      console.log(`🚀 http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
})();
