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

// CORS origin을 콤마로 분리해 배열로 변환
const rawOrigins = process.env.CORS_ORIGIN || "";
const allowedOrigins = rawOrigins
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : "*",
    credentials: true,
  })
);
app.use(express.json());

// 헬스 체크
app.get("/health", (_, res) => res.send("OK"));

// 라우팅
app.use("/api/auth", authRoutes);
app.use("/api/runs", runRoutes);

// 서버 실행
(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌MongoDB connection error:", err);
    process.exit(1);
  }
})();
