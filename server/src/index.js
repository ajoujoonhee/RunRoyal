// server/src/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import runRoutes from "./routes/runs.js";

const app = express();

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

// 콤마 구분 문자열을 배열로 변환
const allowedOrigins = (CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // 서버 간 호출/포스트맨
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

// 미들웨어
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // 프리플라이트 대응
app.use(express.json());

// 헬스 체크
app.get("/health", (_, res) => res.send("OK"));

// 라우트
app.use("/api/auth", authRoutes);
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
