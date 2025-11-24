// server/src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    nickname: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// 여기서 User 모델을 만들고
const User = mongoose.model("User", userSchema);

// **default export** 로 내보낸다
export default User;
