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
      required: true,
      min: 0,
    },
    result: {
      type: String,
      enum: ["win", "lose", "draw"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
      required: true,
    },
    status: {
      type: String,
      enum: ["completed"],
      default: "completed",
      required: true,
    },
  },
  { timestamps: true }
);

const Competition = mongoose.model("Competition", competitionSchema);
export default Competition;
