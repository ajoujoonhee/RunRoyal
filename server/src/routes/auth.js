import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { requireAuth } from "../middlewares/auth.js";

const r = Router();

// 회원가입
r.post("/signup", async (req, res) => {
  try {
    const { email, password, nickname } = req.body;
    if (!email || !password || !nickname)
      return res.status(400).json({ message: "Missing fields" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash, nickname });

    const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        elo: user.elo,
        wins: user.wins,
        losses: user.losses,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Signup error" });
  }
});

// 로그인
r.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        elo: user.elo,
        wins: user.wins,
        losses: user.losses,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Login error" });
  }
});

// 토큰 확인(선택)
r.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).lean();
  if (!user) return res.status(404).json({ message: "User not found" });
  delete user.password;
  return res.json(user);
});

export default r;
