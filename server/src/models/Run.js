// server/src/models/Run.js
import mongoose from "mongoose";

const runSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // km 단위 거리
    distance: {
      type: Number,
      required: true,
      min: 0,
    },
    // 초 단위 시간
    time: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 생성
  }
);

const Run = mongoose.model("Run", runSchema);
export default Run;
