import mongoose, { Types } from "mongoose";
import User from "./User";
import { TrainerTypes } from "../types/trainerTypes";

const Schema = mongoose.Schema;

const TrainerSchema = new Schema<TrainerTypes>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    validate: {
      validator: async (value: Types.ObjectId) => {
        const user = await User.findById(value);
        return Boolean(user && user.role === "trainer");
      },
      message: "There can only be one role",
    },
  },
  courseTypes: {
    type: [Schema.Types.ObjectId],
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  specialization: String,
  experience: String,
  certificates: String,
  description: String,
  availableDays: String,
});

const Trainer = mongoose.model("Trainer", TrainerSchema);
export default Trainer;
