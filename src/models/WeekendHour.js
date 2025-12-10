// src/models/WeekendHour.js
import mongoose, { Schema, models } from "mongoose";

const WeekendHourSchema = new Schema(
  {
    userDni: { type: String, required: true, index: true },
    workedDate: { type: Date, required: true },
    ingresoTime: { type: String, required: true }, // "HH:MM" o "HH:MM:SS"
  },
  { timestamps: true }
);

WeekendHourSchema.index({ userDni: 1, workedDate: 1 }, { unique: true });

export default models.WeekendHour ||
  mongoose.model("WeekendHour", WeekendHourSchema);
