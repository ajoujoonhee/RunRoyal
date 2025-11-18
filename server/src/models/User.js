import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email:    { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true }, // 해시 저장
    nickname: { type: String, required: true, trim: true },
    elo:      { type: Number, default: 1000 },
    wins:     { type: Number, default: 0 },
    losses:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
