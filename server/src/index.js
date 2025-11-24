// server/src/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import runRoutes from "./routes/runs.js";

const app = express();

// 환경 변수
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

// 미들웨어
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

// 헬스 체크
app.get("/health", (_, res) => res.send("OK"));

// 🔥 반드시 이렇게 유지해야 함
app.use("/api/auth", authRoutes); // ← 이게 정답
app.use("/api/runs", runRoutes);

// 서버 실행
(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
})();
