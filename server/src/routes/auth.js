// server/src/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

// JWT 토큰 생성 함수
function createToken(user) {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// 회원가입
router.post("/signup", async (req, res) => {
  try {
    const { email, password, nickname } = req.body;

    if (!email || !password || !nickname) {
      return res.status(400).json({ message: "모든 필드를 입력해주세요." });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "이미 존재하는 이메일입니다." });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashed,
      nickname,
    });

    const token = createToken(user);

    res.status(201).json({
      message: "회원가입 성공",
      token,
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
      },
    });
  } catch (err) {
    console.error("signup error:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

// 로그인
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res
        .status(401)
        .json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    const token = createToken(user);

    res.json({
      message: "로그인 성공",
      token,
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
      },
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

// ✅ 내 정보 조회
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "_id email nickname createdAt"
    );
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    res.json({
      id: user._id,
      email: user.email,
      nickname: user.nickname,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("me error:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

export default router;
