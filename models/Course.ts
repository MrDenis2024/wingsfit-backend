import mongoose, { Types } from "mongoose";
import User from "./User";
import { CourseTypes } from "../types/courseTypes";
import CourseType from "./CourseType";

const Schema = mongoose.Schema;

const CourseSchema = new Schema<CourseTypes>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    validate: {
      validator: async (value: Types.ObjectId) => {
        const user = await User.findById(value);
        return Boolean(user && user.role === "trainer");
      },
      message: "There can only be one role",
    },
  },
  courseType: {
    type: Schema.Types.ObjectId,
    ref: "CourseType",
    required: true,
    validate: {
      validator: async (value: Types.ObjectId) => {
        const courseType = await CourseType.findById(value);
        return Boolean(courseType);
      },
      message: "CourseType does not exist",
    },
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  format: {
    type: String,
    default: "group",
    enum: ["single", "group"],
  },
  schedule: {
    type: [String],
    enum: [
      "Понедельник",
      "Вторник",
      "Среда",
      "Четверг",
      "Пятница",
      "Суббота",
      "Воскресенье",
    ],
    required: true,
  },
  price: {
    type: Number,
  },
  image: {
    type: String,
  },
});

const Course = mongoose.model("Course", CourseSchema);
export default Course;
