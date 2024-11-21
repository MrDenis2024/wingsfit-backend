import mongoose from "mongoose";
import { ReviewTypes } from "../types/reviewTypes";

const Schema = mongoose.Schema;

const TrainerReviewSchema = new Schema<ReviewTypes>({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trainer",
    required: true,
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
