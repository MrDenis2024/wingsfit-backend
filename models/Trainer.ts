import mongoose, { Types } from "mongoose";
import User from "./User";
import { TrainerTypes } from "../types/trainerTypes";
import CourseType from "./CourseType";

const Schema = mongoose.Schema;

const TrainerCertificateSchema = new Schema({
  title: String,
  image: String,
});

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
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "CourseType",
        unique: true,
        validate: {
          validator: async (value: Types.ObjectId) => {
            const courseType = await CourseType.findById(value);
            return Boolean(courseType);
          },
          message: "Course type does not exist!",
        },
      },
    ],
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  specialization: String,
  experience: String,
  certificates: [TrainerCertificateSchema],
  description: String,
  availableDays: String,
});

const Trainer = mongoose.model("Trainer", TrainerSchema);
export default Trainer;
