import mongoose, { Types } from "mongoose";
import User from "./User";
import { TrainerMethods, TrainerModel, TrainerTypes } from "../types/trainerTypes";
import CourseType from "./CourseType";
import TrainerReview from "./TrainerReview";

const Schema = mongoose.Schema;

const TrainerCertificateSchema = new Schema({
  title: String,
  image: String,
});

const TrainerSchema = new Schema<TrainerTypes, TrainerModel, TrainerMethods>({
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
  courseTypes: [
    {
      type: Schema.Types.ObjectId,
      ref: "CourseType",
      validate: {
        validator: async (value: Types.ObjectId) => {
          const courseType = await CourseType.findById(value);
          return Boolean(courseType);
        },
        message: "Course type does not exist!",
      },
    },
  ],
  rating: {
    type: Number,
    default: 0,
  },
  specialization: String,
  experience: String,
  certificates: [TrainerCertificateSchema],
  description: String,
  availableDays: {
    type: [String],
    enum: ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"]
  },
});

TrainerSchema.methods.getRating = async function () {
  const reviews = await TrainerReview.find({ trainerId: this.user });

  if (reviews.length < 1) {
    this.rating = 0;
  }

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  this.rating = Math.min(Math.round(averageRating / 0.5) * 0.5, 5);
};

const Trainer = mongoose.model<TrainerTypes, TrainerModel>("Trainer", TrainerSchema);
export default Trainer;
