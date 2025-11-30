// server/src/models/Competition.js
import mongoose from "mongoose";

const competitionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    distance: {
      type: Number,
      required: true,
      min: 0,
    },
    // 사용자의 기록(초)
    time: {
      type: Number,
      required: true,
      min: 0,
    },
    // 봇/상대 기록(초)
    opponentTime: {
      type: Number,
      min: 0,
    },
    opponentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    result: {
      type: String,
      enum: ["win", "lose", "draw", null],
      default: null,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", null],
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
      required: true,
    },
  },
  { timestamps: true }
);

const Competition = mongoose.model("Competition", competitionSchema);
export default Competition;
