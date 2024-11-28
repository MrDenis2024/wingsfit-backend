import mongoose, { Types } from "mongoose";
import { ReviewTypes } from "../types/reviewTypes";
import User from "./User";

const Schema = mongoose.Schema;

const TrainerReviewSchema = new Schema<ReviewTypes>({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    validate: {
      validator: async (value: Types.ObjectId) => {
        const user = await User.findById(value);
        return Boolean(user && user.role === "client");
      },
      message: "Provide a real client id",
    },
  },
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    validate: {
      validator: async (value: Types.ObjectId) => {
        const user = await User.findById(value);
        return Boolean(user && user.role === "trainer");
      },
      message: "Provide a real trainer id",
    },
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: String,
  createdAt: {
    type: String,
  },
});

const TrainerReview = mongoose.model("TrainerReview", TrainerReviewSchema);

export default TrainerReview;
