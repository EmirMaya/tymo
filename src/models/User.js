import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    dni: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, default: "user" },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.User || mongoose.model("User", UserSchema);
