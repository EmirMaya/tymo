// src/models/WorkedDate.js
import mongoose, { Schema, models } from "mongoose";

const WorkedDateSchema = new Schema(
  {
    userDni: { type: String, required: true, index: true },
    workedDate: { type: Date, required: true },
    hours: { type: Number, default: 6 },
  },
  { timestamps: true }
);

// Para que haya solo 1 doc por (userDni + workedDate)
WorkedDateSchema.index({ userDni: 1, workedDate: 1 }, { unique: true });

export default models.WorkedDate ||
  mongoose.model("WorkedDate", WorkedDateSchema);
